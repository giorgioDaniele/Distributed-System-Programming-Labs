'use strict'

// Film-Manager

const Express = require('express')
const Morgan = require('morgan')
const { Database } = require('./utils/database')
const { MasterController } = require('./controllers/Master')

// Crea un riferimento al database
const sqlite = new Database()
// Crea un riferimento al controllore della tabella films
const master = new MasterController(sqlite)

// Crea un'istanza di Express
const app = new Express()
// Seleziona la porta
const port = 8080

app.use(Morgan('dev'))
app.use(Express.json())

// Funzioni aperte a tutti
const rootURL      = '/api/'                                // Radice
const publicFilms  = '/api/films/public'                    // Accedi alla lista dei film pubblici
const publicFilm   = '/api/films/public/:fid'               // Accedi ad uno del film pubblici
const reviewsFilm  = '/api/films/public/:fid/reviews'       // Accedi alla recensioni di un film pubblico
const reviewFilm   = '/api/films/public/:fid/reviews/:uid'  // Accedi ad una particolare recensione di un film pubblico

const privateFilm       = '/api/films/private/:fid'        // Accedi ad un film privato
const deletePrivateFilm = '/api/films/private/:fid'        // Cancella uno tra i film privati
const deletePublicFilm  = '/api/films/public/:fid'         // Cancella uno tra i film publici
const newPublicFilm     = '/api/films/public'              // Crea un nuovo film, tra quelli pubblici
const newPrivateFilm    = '/api/films/private'             // Crea un nuovo film, tra quelli privati
const editPrivateFilm   = '/api/films/private/:fid'        // Modifica uno dei film tra quelli privati
const editPublicFilm    = '/api/films/public/:fid'         // Modifica uno dei film tra quelli pubblici

const userReviews  = '/api/reviews/invited'                 // Accedi a tutte le recensioni associate al profilo
const newReview    = '/api/films/public/:fid/reviews'       // Crea una nuova recensione associata ad un film
const deleteReview = '/api/films/public/:fid/reviews/:uid'  // Cancella una recensione 
const editReview   = '/api/films/public/:fid/reviews/:uid'  // Modifica una recensione

const login  = '/api/auth'        // Autenticazione sul servizio
const logout = '/api/no-auth'     // Terminazione e uscita dal servizio

// Inizializza autenticazione
master.initAuth(app)

// Funzioni per la lettura di film pubblici
app.get(publicFilms, (req, res, next) => master.publicFilms(req, res, next))
app.get(publicFilm,  (req, res, next) => master.publicFilm(req, res, next))
// Fuzioni per la lettura delle recensioni (base)
app.get(reviewsFilm, (req, res, next) => master.reviewsFilm(req, res, next))
app.get(reviewFilm,  (req, res, next) => master.reviewFilm(req, res, next))
// Funzioni per la lettura di film privati
app.get(privateFilm, master.isAuth, (req, res, next) => master.privateFilm(req, res, next))
// Funzioni per la creazione di nuovi film
app.post(newPrivateFilm, master.isAuth, (req, res, next) => master.newPrivateFilm(req, res, next))
app.post(newPublicFilm,  master.isAuth, (req, res, next) => master.newPublicFilm(req, res, next))
// Funzioni per la cancellazione di film
app.delete(deletePrivateFilm, master.isAuth, (req, res, next) => master.deletePrivateFilm(req, res, next))
app.delete(deletePublicFilm,  master.isAuth, (req, res, next) => master.deletePublicFilm(req, res, next))
// Funzioni per la modifica di film
app.put(editPublicFilm,  master.isAuth, (req, res, next) => master.editPublicFilm(req, res, next))
app.put(editPrivateFilm, master.isAuth, (req, res, next) => master.editPrivateFilm(req, res, next))
// Fuzioni per la lettura delle recensioni (avanzate)
app.get(userReviews, master.isAuth, (req, res, next) => master.userReviews(req, res, next))
// Funzione per la creazione di una nuova recensione
app.post(newReview, master.isAuth, (req, res, next) => master.newReview(req, res, next))
// Funzione per la cancellazione di una recensione
app.delete(deleteReview, master.isAuth, (req, res, next) => master.deleteReview(req, res, next))
// Funzione per la modifica di una recensione
app.put(editReview, master.isAuth, (req, res, next) => master.editReview(req, res, next))

// Registrazioni delle funzioni per gestire le sessioni, ossia l'autenticazione
app.post(login,  (req, res, next) => master.login(req, res, next))
app.post(logout, (req, res, next) => master.logout(req, res, next))

// Avvia il servizio
app.listen(port, () =>
    console.log(`Film manager is listening at http://localhost:${port}`))