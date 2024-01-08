'use strict'

const { FilmController } = require('./Film')
const { ReviewContoller } = require('./Review')
const { UserContoller } = require('./User')
const { HTTPValidator } = require('../utils/validation')

const Path = require('path')
// Carica il modulo passsport
const Passport = require("passport")
// Carica il modulo session
const Session = require("express-session")
// Inizializza una nuova istanza per questa applicazione
const LocalStrategy = require("passport-local").Strategy
// Carica il servizio crypto
const Crypto = require("crypto")
const { off } = require('process')

/**
 * MasterController è la classe che si frappone 
 * tra l'invocazione delle funzionalità associate
 * ai vari endpoint e il database. Il compito della classe
 * è: orchestrare i controllori dedicati alle singole 
 * tabelle contenute all'interno del dabase; gestire
 * la validazione delle richieste emesse dai clients.
 */

/*
    (IBM)
    Indicates that the targeted resource does not exist. 
    This might be because the URI is malformed, or the 
    resource has been deleted.
*/
const HTTP404 = (res) => res.status(404).send()
/* 
    (IBM)
    Request accepted (HTTP 200), response contains result. 
    This is a general purpose response code that can be 
    returned from any request. 
    For GET requests, the requested resource or data is in 
    the response body. 
    For PUT or DELETE requests, the request was successful 
    and information about the result 
    (such as new resource identifiers, or changes in resource status) 
    can be found in the response body. 
*/
const HTTP200 = (res, data = undefined) => res.status(200).send(data)
/*
    (IBM)
    This response code is returned from PUT or POST, and indicates that
    a new resource was created successfully. The response body might for 
    example contain information about a new resource, or validation 
    information (for example, when an asset is updated).
*/
const HTTP201 = (res, data) => res.status(201).send(data)
/* 
   (IBM)
   An internal error occurred in the server. This might indicate
   a problem with the request, or might indicate a problem in the 
   server side code. Error information can be found in the 
   response body.
*/
const HTTP500 = (res)  => res.status(500).send()
/*
    (IBM)
    Indicates that the client attempted to access a resource
    which they do not have access to. This might be encountered if 
    the user accessing the remote resource does not have sufficient privileges.
*/
const HTTP403 = (res, data) => res.status(403).send(data)   
/*
    (IBM)
    Is returned from the application server when application security 
    is enabled, and authorization information was missing from the request. 
*/
const HTTP401 = (res, data) => res.status(401).send(data)
/*
    (IBM)
    The request was not valid. This code is returned when the server has
    attempted to process the request, but some aspect of the request is
    not valid, for example an incorrectly formatted resource or an attempt 
    to deploy an invalid event project to the event runtime. Information about 
    the request is provided in the response body, and includes an error code 
    and error message.
*/
const HTTP400 = (res, data) => res.status(400).send(data)

class MasterController {
    filmController
    reviewController
    userController
    postFilmValidator
    putFilmValidator
    postReviewValidator
    putReviewValidator
    /**
     * 
     * @param {object} sqlite
     * Costruttore della classe Master Controller
     */
    constructor(sqlite) {
        this.filmController    = new FilmController(sqlite)
        this.reviewController  = new ReviewContoller(sqlite)
        this.userController    = new UserContoller(sqlite)
        this.postFilmValidator = new HTTPValidator(
            Path.join(
                Path.resolve(__dirname, '..'), 'schemas', 'POST-Film.json'))
        this.putFilmValidator = new HTTPValidator(
            Path.join(
                Path.resolve(__dirname, '..'), 'schemas', 'PUT-Film.json'))
        this.postReviewValidator = new HTTPValidator(
            Path.join(
                Path.resolve(__dirname, '..'), 'schemas', 'POST-Review.json'))
        this.putReviewValidator = new HTTPValidator(
            Path.join(
                Path.resolve(__dirname, '..'), 'schemas', 'PUT-Review.json'))
    }   
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la lista di film con visibilità pubblica
     * presenti all'interno del database. La lista è contenuta
     * all'interno del corpo della risposta HTTP.
     */
    publicFilms = async (req, res) => {
        // Seleziona il limite voluto dall'utente
        const limit = req.query.limit
        // Seleziona lo offset voluto dall'utente
        const offset = req.query.offset
        try {
            const films = await this.filmController.publicFilms(limit, offset)
            return HTTP200(res, films)
        } catch(error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * richiesto. L'oggetto è contenuto all'interno del 
     * corpo della risposta HTTP. Se il film dovesse essere
     * inesistente, la risposta HTTP sarà con codice 404.
     */
    publicFilm = async (req, res) => {
        // Identificatore del film
        const fid = req.params.fid
        try {
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            return HTTP200(res, film)
        } catch {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la lista di film associati all'utente che ne
     * fa richiesta. La lista è contenuta all'interno
     * della risposta HTTP.
     */
    userFilms = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid   
        try {
            const films = await this.filmController.userFilms(claimantId)
            return HTTP200(res, films)
        } catch(error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la lista delle recensioni associate al
     * film con visiblità pubblica all'interno del database.
     * La lista è contenuta all'interno del corpo della
     * risposta HTTP. Se il film non è presente nel 
     * database, allora nessuna delle sue recensioni è
     * disponibile; pertanto, in quel caso, la risposta
     * HTTP è 404.
     */
    reviewsFilm = async (req, res) => {
        // Identificatore del film
        const fid = req.params.fid
        // Seleziona il limite voluto dall'utente
        const limit = req.query.limit
        // Seleziona lo offset voluto dall'utente
        const offset= req.query.offset
        try {
            // Verifica che il film richiesto esiste
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            const reviews = await this.reviewController.reviewsFilm(fid, limit, offset)
            return HTTP200(res, reviews)
        } catch (error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON della 
     * recensione associato ad un particolare film all'interno
     * del database. L'oggetto è contenuto della risposta 
     * HTTP. Se il film oppure la recensione non dovessero
     * esistere, allora la risposta sarà HTTP 404.
     */
    reviewFilm = async (req, res) => {
        // Identificatore del film
        const fid = req.params.fid
        // Identificatore dell'utente
        const uid = req.params.uid
        try {
            // Verfica che il film richiesto esiste
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che la recensione richiesta esiste
            const review = await this.reviewController.reviewFilm(fid, uid)
            if(!review)
                return HTTP404(res)
            return HTTP200(res, review)
        } catch (error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la lista di recensioni all'interno del 
     * database che hanno come utente associato quello
     * che fa la richiesta. La lista è contenuta all'interno
     * della risposta HTTP.
     */
    userReviews = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Seleziona il limite voluto dall'utente
        const limit = req.query.limit
        // Seleziona lo offset voluto dall'utente
        const offset = req.query.offset
        try {
            const films  = await this.reviewController.userReviews(claimantId, limit, offset)
            return HTTP200(res, films)
        } catch(error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * richiesto. L'oggetto è contenuto all'interno del 
     * corpo della risposta HTTP. Se il film dovesse essere
     * inesistente, la risposta HTTP sarà con codice 404.
     */
    privateFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore del film
        const fid = req.params.fid
        try {
            // Verifica che il film richiesto esista
            const film = await this.filmController.privateFilm(fid)
            if(!film)                          
                return HTTP404(res)
            // Verifica che il film richiesto sia associato all'utente
            // che fa richiesta
            if(film && !film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            return HTTP200(res, film)
        } catch (error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena cancellato dal database. Nel caso
     * in cui il film non esistesse, la risposta sarebbe HTTP
     * 404.
     */
    deletePrivateFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore del film
        const fid = req.params.fid
        try {
            // Verifica che il film che si vuol cancellare esiste
            const film = await this.filmController.privateFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che il film che si vuol cancellare sia associato
            // all'utente che ne fa richiesta
            if(film && film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Procedi con la cancellazione del film
            await this.filmController.deleteFilm(fid)
            return HTTP200(res, film)
        } catch(error) {
            return error
        }    
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena cancellato dal database. Nel caso
     * in cui il film non esistesse, la risposta sarebbe HTTP
     * 404.
     */
    deletePublicFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore del film
        const fid = req.params.fid
        try {
            // Verifica che il film che si vuol cancellare esiste
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che il film che si vuol cancellare sia associato
            // all'utente che ne fa richiesta
            if(film && film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            const reviews = await this.reviewController.reviewsFilm(fid)
            // Se esiste almeno una recensione, allora cancelle tutte
            if(reviews.data.length > 0)
                await this.reviewController.deleteReviewsFilm(fid) 
            // Procedi con la cancellazione del film
            await this.filmController.deleteFilm(fid)
            return HTTP200(res, film)
        } catch(error) {
            return error
        }    
    }
        /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena creato all'interno del database.
     */
    newPrivateFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        try {
            if(this.postFilmValidator.validateObject(req.body))
                return HTTP401(res, 'Richiesta non valida')
            const film = await this.filmController.newFilm(
                req.body.title,      // Titolo
                claimantId,          // Utente associato
                1,                   // Indicatore visibilità (privato)
                req.body.watchDate,  // Data associata
                req.body.rating,     // Votazione
                req.body.favorite    // Indicazione di preferenza
            )
            return HTTP201(res, film)
        } catch (error) {
            console.log(error)
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena creato all'interno del database.
     */
    newPublicFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        try {
            if(this.postFilmValidator.validateObject(req.body))
                return HTTP401(res, 'Richiesta non valida')
            const film = await this.filmController.newFilm(
                req.body.title,      // Titolo
                claimantId,          // Utente associato
                0,                   // Indicatore visibilità (privato)
                req.body.watchDate,  // Data associata
                req.body.rating,     // Votazione
                req.body.favorite    // Indicazione di preferenza
            )
            return HTTP201(res, film)
        } catch (error) {
            console.log(error)
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena modificato all'interno del database.
     */
    editPublicFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore del film
        const fid = req.params.fid 
        try {
            // Verifica che il film da modificare esiste
            let film = await this.filmController.publicFilm(fid)
            if(!film)                                                      
                return HTTP404(res)
            // Verifica che il film da modificare sia associato
            // all'utente che ne fa richiesta
            if(film && film.uid !== claimantId)                                  
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Verifica che la richiesta sia conforme con lo schema JSON
            // (PUT-Film.json)
            if(this.putFilmValidator.validateObject(req.body))           
                return HTTP401(res, 'Richiesta non valida!')
            if(req.body.isPrivate && req.body.isPrivate !== film.isPrivate)
                return HTTP400(res, 'Operazione non consentita: non è possibile modificare la visibilità!')
            film = await this.filmController.editFilm(
                req.body.title,      // Titolo
                claimantId,          // Utente
                0,                   // Indicatore della visibilità (pubblico)
                req.body.watchDate,  // Data associata al film
                req.body.rating,     // Votazione   
                req.body.favorite,   // Indicatore di preferenza
                fid
            )
            return HTTP200(res, film)
        } catch (error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON del film
     * che è stato appena modificato all'interno del database.
     */
    editPrivateFilm = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore del film
        const fid = req.params.fid 
        try {
            // Verifica che il film da modificare esiste
            let film = await this.filmController.privateFilm(fid)
            if(!film)                                                      
                return HTTP404(res)
            // Verifica che il film da modificare sia associato
            // all'utente che ne fa richiesta
            if(film && film.uid !== claimantId)                                  
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Verifica che la richiesta sia conforme con lo schema JSON
            // (PUT-Film.json)
            if(this.putFilmValidator.validateObject(req.body))           
                return HTTP401(res, 'Richiesta non valida!')
            if(req.body.isPrivate && req.body.isPrivate !== film.isPrivate)
                return HTTP400(res, 'Operazione non consentita: non è possibile modificare la visibilità!')
            film = await this.filmController.editFilm(
                req.body.title,      // Titolo
                claimantId,          // Utente
                1,                   // Indicatore della visibilità (privato)
                req.body.watchDate,  // Data associata al film
                req.body.rating,     // Votazione   
                req.body.favorite,   // Indicatore di preferenza
                fid
            )
            return HTTP200(res, film)
        } catch (error) {
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON della 
     * recensione appena cancellata.
     */
    deleteReview = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore film
        const uid = req.params.uid
        // Identificatore utente
        const fid = req.params.fid
        console.log(fid, uid)
        try {
            // Verifica che il film del quale si sta cancellando
            // la recensione esiste
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che il film del quale si sta cancellando
            // la recensione sia uno di quelli pubblici
            if(film.isPrivate)
                return HTTP400(res, 'Operazione non consentita: i film privati non hanno recensioni associate')
            // Verifica che il film del quale si sta cancellando
            // la recensione sia uno di quelli associati all'utente
            // che ha fatto richiesta.
            if(film && film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Verica che esiste la recensione che si vuol cancellare
            const review = await this.reviewController.reviewFilm(fid, uid)
            if(!review)
                return HTTP404(res)
            // Procedi alla cancellazione della risorsa
            await this.reviewController.deleteReviewFilm(fid, uid)
            return HTTP200(res, review)
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON della 
     * recensione appena creata.
     */
    newReview = async (req, res) => { 
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore film
        const uid = req.body.uid
        // Identificatore utente
        const fid = req.params.fid
        try {
            // Verifica che la richiesta sia conforme con lo schema JSON
            // (POST-Review.json)
            if(this.postReviewValidator.validateObject(req.body))
                return HTTP401(res, 'Richiesta non valida')
            // Verifica che il film esiste (quello al quale si vuol asssociare
            // la recensione)
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che il film del quale si sta cancellando
            // la recensione sia uno di quelli pubblici
            if(film.isPrivate)
                return HTTP400(res, 'Operazione non consentita: i film privati non hanno recensioni associate')
            // Verifica che il film è associato all'utente che fa richiesta
            // di associarvi una nuova recensione
            if(film && film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Verifica che non è stata ancora emessa nessuna recensione
            let review = await this.reviewController.reviewFilm(fid, uid)
            if(review)
                return HTTP200(res, review)
            // Procedi con la creazione della recensione
            review = await this.reviewController.newReview(
                fid,                  // Film
                req.body.uid,         // Utente
                req.body.completed,   // Stato della recensione
                req.body.reviewDate,  // Data di completamento
                req.body.rating,      // Votazione
                req.body.review,      // Commento
            )
            return HTTP201(res, review)
        } catch (error) {
            console.log(error)
            return HTTP500(res)
        }
    }
    /**
     * 
     * @param {object} req Richiesta HTTP
     * @param {object} res Risposta HTTP
     * @returns la rappresentazione in formato JSON della 
     * recensione appena modificata.
     */
    editReview = async (req, res) => {
        // Identificatore dell'utente che sta eseguendo la richiesta
        const claimantId = req.user.uid
        // Identificatore film
        const uid = req.params.uid
        // Identificatore utente
        const fid = req.params.fid
        try {
            // Verifica che la richiesta sia conforme con lo schema JSON
            // (POST-Review.json)
            if(this.putReviewValidator.validateObject(req.body))
                return HTTP401(res, 'Richiesta non valida')
            // Verifica che il film esiste (quello al quale si vuol asssociare
            // la recensione)
            const film = await this.filmController.publicFilm(fid)
            if(!film)
                return HTTP404(res)
            // Verifica che il film del quale si sta cancellando
            // la recensione sia uno di quelli pubblici
            if(film.isPrivate)
                return HTTP400(res, 'Operazione non consentita: i film privati non hanno recensioni associate')
            // Verifica che il film è associato all'utente che fa richiesta
            // di associarvi una nuova recensione
            if(film && film.uid !== claimantId)
                return HTTP403(res, 'Utente non autorizzato: il film non è associato al tuo account!')
            // Verifica che esiste la recensione da voler modificare
            let review = await this.reviewController.reviewFilm(fid, uid)
            if(!review)
                return HTTP404(res)
            review = await this.reviewController.editReview(
                fid,                  // Film
                claimantId,           // Utente
                req.body.completed,   // Stato della recensione
                req.body.reviewDate,  // Data di completamento
                req.body.rating,      // Votazione
                req.body.review,      // Commento
            )
            return HTTP200(res, review)
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {object} app 
     * Registrazione della procedura di autenticazione per l'accesso
     * degli utenti alla piattaforma
     */
    initAuth = (app) => {

        Passport.use(new LocalStrategy(
            (username, password, done) => {
                // Preleva il profilo dell'utente
                this.userController.userProfileEmail(username)
                .then(user => user ? // L'utente esiste?
                    // Confronta l'hash della password registrata con l'hash calcolato
                    // sulla password immessa dall'utente
                    Crypto.scrypt(password, user.salt, 32, (error, pwdHashed) =>
                        error ? done(null, false) : // Errore
                            Crypto.timingSafeEqual(Buffer.from(user.pwdh, 'hex'), pwdHashed) ? 
                                done(null, user)   : // L'utente è leggittimo
                                done(null, false)) : done(null, false))
                .catch(error => done(null, fase))    // Errore
            })
        )

        // Primitiva per trasformare un utente nel suo id
        Passport.serializeUser((user, done) => 
            done(undefined, user['uid']))

        // Primitiva per estrarre dalla richesta l'utente 
        // (se questo ha precendentemente eseguito l'autenticazione)
        Passport.deserializeUser((uid, done) =>
            this.userController.userProfile(uid)
                .then(user => done(undefined, user))
                .catch(error => done(error, undefined))
        )

        app.use(Session({
            secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
            resave: false,
            saveUninitialized: false
        }))

        // Inizializza l'applicazione per
        // utilizzare passport
        app.use(Passport.initialize())
        app.use(Passport.session())
    }
    /**
     * 
     * Funzione che consente di verificare la presenza del cookie di 
     * sessione all'interno di una richiesta HTTP.
     */
    isAuth = (req, res, next) =>
        req.isAuthenticated() ? next() : HTTP401(res, 'Non autenticato');
    /**
     * 
     * Funzione per l'autenticazione degli utenti
     */
    login = (req, res, next) =>
        Passport.authenticate('local', (error, user, info) => {
            if (error)         return next(error)
            if (!user && info) return HTTP401(res, 'Username e password non specificati');
            if (!user)         return HTTP403(res, 'Username e password sono errate');
            req.login(user, (error) => {
                if (error) return next(err)
                return HTTP200(res, user)
            })
        })(req, res, next)
    /**
     * 
     * Funzione per gestire l'abbandono del servizio 
     * da parte dei clienti.
     */
    logout = (req, res, next) =>
        req.logout(() => res.end())

}

module.exports = { MasterController }