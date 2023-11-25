'use strict'

// Imports
const Passport = require('passport')
const Authentication = require('./src/auth')
const Storage = require('./src/storage')
const FileSystem = require('fs')
const Path = require('path')
const HTTPServer = require('http')
const OAPISwagTools = require('oas3-tools')
const { Validator, ValidationError } = require('express-json-validator-middleware')

// Server Port
const PORT = 8080

const options = {
    routing: { 
        controllers: Path.join(__dirname, './DAOs') 
    },
}
const expressAppConfig = OAPISwagTools.expressAppConfig(Path.join(__dirname, 'api/openapi.yaml'), options)
expressAppConfig.addValidator()

const app = expressAppConfig.getApp()
Authentication.initAuthentication(app)

const filmDAO   = require(Path.join(__dirname, 'DAOs/FilmDao'))
const reviewDAO = require(Path.join(__dirname, 'DAOs/ReviewDao'))
const imageDAO  = require(Path.join(__dirname, 'DAOs/ImageDao'))

// Set up the schema validator
const loginRequestSchema = 
    JSON.parse(FileSystem.
        readFileSync(Path.
            join('.', 'schemas', 'login_schema.json'))
                .toString())

const postingFilmSchema  = 
    JSON.parse(FileSystem.
        readFileSync(Path.
            join('.', 'schemas', 'post_film_schema.json'))
                .toString())

const postingReviewSchema = 
    JSON.parse(FileSystem.
        readFileSync(Path.
            join('.', 'schemas', 'post_review_schema.json'))
                .toString())

const editingFilmSchema = 
    JSON.parse(FileSystem.
        readFileSync(Path.
            join('.', 'schemas', 'edit_film_schema.json'))
                .toString())

// Create a new validator
const validator = new Validator({ allErrors: true })

// Add schemas to validator
validator.ajv.addSchema([
    loginRequestSchema, 
    postingFilmSchema, 
    editingFilmSchema, 
    postingReviewSchema])

const applyMiddleware = (middlewareList, handler) => {
    return (req, res) => {
        // Recursive function to execute middleware in order
        const runMiddleware = (index) => {
        if (index === middlewareList.length) {
            // If all middleware are executed, call the handler
              handler(req, res, req.params, req.query, req.body, req.user, () => {});
        } else {
            // Call the current middleware with a callback to the next middleware
            middlewareList[index](req, res, () => runMiddleware(index + 1));
        }
    }
    // Start running middleware from the beginning
    runMiddleware(0);
    }
}


// Public URLs
const rootURL              = '/api/'
const publicFilmsURL       = '/api/films/public'
const publicFilmURL        = '/api/films/public/:fid'
const reviewsPublicFilmURL = '/api/films/public/:fid/reviews'
const reviewPublicFilmURL  = '/api/films/public/:fid/reviews/:uid'

// Authenticated URLs
const postFilmURL           = '/api/films'
const editFilmURL           = '/api/films/:fid'
const deleteFilmURL         = '/api/films/:fid'
const privateFilmsURL       = '/api/films/private'
const privateFilmURL        = '/api/films/private/:fid'
const reviewsPrivateFilmURL = '/api/films/private/:fid/reviews'
const reviewPrivateFilmURL  = '/api/films/private/:fid/reviews/:uid'
const createdFilmsURL       = '/api/films/created'
const invitedToReviewURL    = '/api/films/invited-to-review'
const postReviewURL         = '/api/reviews'
const editReviewURL         = '/api/reviews/:fid/:uid'
const deleteReviewURL       = '/api/reviews/:fid/:uid'
const filmImagesURL         = '/api/films/public/:fid/images'
const filmImageURL          = '/api/films/public/:fid/images/:iid'
const postImageURL          = '/api/films/public/:fid/images'
const deleteImageURL        = '/api/films/public/:fid/images/:iid'

app.get(rootURL, applyMiddleware([], filmDAO.root))

app.get(publicFilmsURL, applyMiddleware([], filmDAO.publicFilms))
app.get(publicFilmURL, applyMiddleware([], filmDAO.publicFilm))
app.get(reviewsPublicFilmURL, applyMiddleware([], filmDAO.reviewsPublicFilm))
app.get(reviewPublicFilmURL, applyMiddleware([], filmDAO.reviewPublicFilm))
app.get(privateFilmsURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.privateFilms))
app.get(privateFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.privateFilm))
app.get(reviewsPrivateFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.reviewsPrivateFilm))
app.get(reviewPrivateFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.reviewPrivateFilm))
app.get(createdFilmsURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.createdFilms))
app.get(invitedToReviewURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.filmsToReview))

app.post(postFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.newFilm))
app.put(editFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.editFilm))
app.delete(deleteFilmURL, applyMiddleware([Authentication.isLoggedIn], filmDAO.deleteFilm))

app.post(postReviewURL, applyMiddleware([Authentication.isLoggedIn], reviewDAO.newReview))
app.put(editReviewURL, applyMiddleware([Authentication.isLoggedIn], reviewDAO.editReview))
app.delete(deleteReviewURL, applyMiddleware([Authentication.isLoggedIn], reviewDAO.deleteReview))

app.get(filmImagesURL, applyMiddleware([Authentication.isLoggedIn], imageDAO.filmImages))
app.get(filmImageURL, applyMiddleware([Authentication.isLoggedIn], imageDAO.filmImage))
app.post(postImageURL, applyMiddleware([Authentication.isLoggedIn, Storage.uploadImg], imageDAO.newImage))
app.delete(deleteImageURL, applyMiddleware([Authentication.isLoggedIn], imageDAO.deleteImage))


app.post('/api/user/auth', validator.validate({body: loginRequestSchema}), (req, res, next) => {
    
    Passport.authenticate('local', (error, user, info) => {
        if (error) return next(error)
        if (!user && info) return res.status(400).send('Username and/or password are missing')
        if (!user) return res.status(401).send('Username and/or are not valid')
        req.login(user, (err) => {
            if (err) return next(err)
            return res.status(200).json(req['user'])
        })
    }) 
    (req, res, next)
})
app.post('/api/user/no-auth', (req, res) => req.logout( () => {res.end()}))


// Error middleware
app.use((err, _, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(400).send(err)
    }
    next(err)
})

// Initialize the Swagger middleware
HTTPServer.createServer(app).listen(PORT, () => {
    console.log('###################################################################')
    console.log(`Your server is listening on port ${PORT} (http://localhost:${PORT})`)
    console.log(`Swagger-ui is available on http://localhost:${PORT}/docs`)
    console.log('###################################################################')
})
