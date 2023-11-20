'use strict'
// Imports
const Passport = require('passport')
const Authentication = require('./src/auth')
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

const addRoutes = (routes) => 
        routes.forEach((route) => {
            const handlers = route.handlers.map((handler) => {
                if(route.auth) 
            // If the endpoint requires authentication, convert
            // the handler into enveloped (the authentication procedure) 
            // handler that has next
            // function the handler itself
                    return (req, res, next) => 
                        Authentication.isLoggedIn(req, res, () => 
                            handler(
                                res, 
                                req, 
                                req.params, 
                                req.query, 
                                req.body, 
                                req.user, 
                                next))
            // Otherwise, just convert the tuple into the
            // handler without authentication
                return (req, res, next) => 
                    handler(
                        res, 
                        req, 
                        req.params, 
                        req.query, 
                        req.body, 
                        req.user, 
                        next)
    })
    app[route.method](route.path, 
        (req, res, next) =>
            handlers.forEach((handler) =>
                handler(req, res, next)))
})

const publicRoutes = [{
    method: 'get',
    path: '/api/films/public',
    handlers: [filmDAO.publicFilms],
    auth: false,
}, {
    method: 'get',
    path: '/api/films/public/:fid',
    handlers: [filmDAO.publicFilm],
    auth: false,
}, {
    method: 'get',
    path: '/api/films/public/:fid/reviews',
    handlers: [filmDAO.reviewsPublicFilm],
    auth: false,
}, {
    method: 'get',
    path: '/api/films/public/:fid/reviews/:uid',
    handlers: [filmDAO.reviewPublicFilm],
    auth: false,
}, {
    method: 'get',
    path: '/',
    handlers: [filmDAO.root],
    auth: false,
}]

const privateRoutes = [{
    method: 'get',
    path: '/api/films/private',
    handlers: [filmDAO.privateFilms],
    auth: true,
}, {
    method: 'get',
    path: '/api/films/private/:fid',
    handlers: [filmDAO.privateFilm],
    auth: true,
}, {
    method: 'get',
    path: '/api/films/private/:fid/reviews',
    handlers: [filmDAO.reviewsPrivateFilm],
    auth: true,
}, {
    method: 'get',
    path: '/api/films/private/:fid/reviews/:uid',
    handlers: [filmDAO.reviewPrivateFilm],
    auth: true,
}, {
    method: 'get',
    path: '/api/films/created',
    handlers: [filmDAO.createdFilms],
    auth: true,
}, {
    method: 'get',
    path: '/api/films/invited-to-review',
    handlers: [filmDAO.filmsToReview],
    auth: true,
}, {
    method: 'post',
    path: '/api/films',
    handlers: [filmDAO.newFilm],
    auth: true,
    validate: 'post_film_schema',
}, {
    method: 'put',
    path: '/api/films/:fid',
    handlers: [filmDAO.editFilm],
    auth: true,
    validate: 'edit_film_schema',
}, {
    method: 'delete',
    path: '/api/films/:fid',
    handlers: [filmDAO.deleteFilm],
    auth: true,
}]

const reviewRoutes = [{
    method: 'post',
    path: '/api/reviews',
    handlers: [reviewDAO.newReview],
    auth: true,
    validate: 'post_review_schema',
}, {
    method: 'post',
    path: '/api/reviews/:fid/:uid',
    handlers: [reviewDAO.editReview],
    auth: true,
}, {
    method: 'put',
    path: '/api/reviews/:fid/:uid',
    handlers: [reviewDAO.editReview],
    auth: true,
}, {
    method: 'delete',
    path: '/api/reviews/:fid/:uid',
    handlers: [reviewDAO.deleteReview],
    auth: true,
}]

addRoutes([...publicRoutes, ...privateRoutes, ...reviewRoutes])

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
    console.log(`Your server is listening on port ${PORT} (http://localhost:${PORT})`)
    console.log(`Swagger-ui is available on http://localhost:${PORT}/docs`)
})
