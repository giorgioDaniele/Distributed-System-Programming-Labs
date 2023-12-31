'use strict'

const Utils = require('../utils/writer.js')
const Film = require('../DataModel/Films.js')


const editFilm = async (req, res, params, query, body, user, next) => {

  try {

    const film = await Film.getFilm(params.fid);

    if (!film || film.owner !== user.uid)
      return res.status(404).send();

    if (Number.isInteger(body.private) && body.private !== film.private)
      return res.status(400).send('Can not change visibility');

    if (body.watchDate && film.private === 0) 
      return res.status(400).send('\'watchDate\' exists for private films only');

    if (Number.isInteger(body.rating) && film.private === 0)
      return res.status(400).send('\'rating\' exists for private films only');
    
    if (Number.isInteger(body.favorite) && film.private === 0)
      return res.status(400).send('\'favorite\' exists for private films only');

    const update = {
      fid: params.fid,
      title: body.title || film.title,
      owner: user.uid,
      private: film.private,
      watchDate: body.watchDate || film.watchDate,
      rating: body.rating || film.rating,
      favorite: body.favorite || film.favorite,
    }
    await Film.editFilm(update, params.fid)
    Utils.writeJson(res, Utils.respondWithCode(200, update))
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const createdFilms = async (req, res, params, query, body, user, next) => {

  try {

    const total = await Film.countCreatedFilms(user.uid);
    const limit = parseInt(query.limit) || total;
    const offset = parseInt(query.offset) || 0;
    const items = await Film.createdFilms(user.uid, limit, offset);
    const response = {
      total,
      count: items.length,
      limit,
      offset,
      data: items,
    }
    Utils.writeJson(res, Utils.respondWithCode(200, response))
  } catch (error) {
    console.error(error);
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const filmsToReview = async (req, res, params, query, body, user, next) => {

  try {

    const total = await Film.countFilmsToReview(user.uid)
    const limit = parseInt(query.limit) || total
    const offset = parseInt(query.offset) || 0
    const items = await Film.filmsToReview(user.uid, limit, offset)
    const response = {
      total,
      count: items.length,
      limit,
      offset,
      data: items,
    }
    Utils.writeJson(res, Utils.respondWithCode(200, response))
  } catch (error) {
    console.error(error)
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const deleteFilm = async (req, res, params, query, body, user, next) => {
  try {

    const item = await Film.getFilm(params.fid)
    if (!item) return Utils.writeJson(res, Utils.respondWithCode(404))
    await Film.deleteFilm(params.fid)
    Utils.writeJson(res, Utils.respondWithCode(200))
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const newFilm = async (req, res, params, query, body, user, next) => {

  try {
    const item = await Film.newFilm({
      title:     body.title,
      owner:     user.uid,
      private:   body.private,
      watchDate: body.watchDate || null,
      rating:    body.rating || null,
      favorite:  body.favorite || null,
    })
    Utils.writeJson(res, Utils.respondWithCode(200, item))
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const privateFilm = async (req, res, params, query, body, user, next) => {
  try {
    const item = await Film.privateFilm(params.fid)
    item ? Utils.writeJson(res, Utils.respondWithCode(200, item)) : res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const privateFilms = async (req, res, params, query, body, user, next) => {
  
  try {

    const total  = await Film.countPrivateFilms()
    const limit  = parseInt(query.limit) || total
    const offset = parseInt(query.offset) || 0
    const items  = await Film.privateFilms(limit, offset)
    const response = {
      total,
      count: items.length,
      limit,
      offset,
      data: items,
    }
    Utils.writeJson(res, Utils.respondWithCode(200, response))
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const publicFilm = async (req, res, params, query, body, user, next) => {

  try {
    const item = await Film.publicFilm(params.fid)
    item ? Utils.writeJson(res, Utils.respondWithCode(200, item)) : res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const publicFilms = async (req, res, params, query, body, user, next) => {
  try {

    const total = await Film.countPublicFilms()
    const limit = parseInt(query.limit) || total
    const offset = parseInt(query.offset) || 0
    const items = await Film.publicFilms(limit, offset)
    const response = {
      total,
      count: items.length,
      limit,
      offset,
      data: items,
    }
    Utils.writeJson(res, Utils.respondWithCode(200, response))
  } catch (error) {
    console.log(error)
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const reviewPrivateFilm = async (req, res, params, query, body, user, next) => {

  try {
    const item  = await Film.reviewPrivateFilm(params.fid, params.uid)
    item ? 
      Utils.writeJson(res, Utils.respondWithCode(200, item)) : 
      res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const reviewPublicFilm = async (req, res, params, query, body, user, next) => {

  try {
    const item  = await Film.reviewPublicFilm(params.fid, params.uid)
    item ? Utils.writeJson(res, Utils.respondWithCode(200, item)) : res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const reviewsPrivateFilm = async (req, res, params, query, body, user, next) => {

  try {
    const items = await Film.reviewsPrivateFilm(params.fid)
    items ? Utils.writeJson(res, Utils.respondWithCode(200, items)) : res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const reviewsPublicFilm = async  (req, res, params, query, body, user, next) => {
  try {
    const items = await Film.reviewsPublicFilm(params.fid)
    items ? Utils.writeJson(res, Utils.respondWithCode(200, items)) : res.status(404).send()
  } catch (error) {
    Utils.writeJson(res, Utils.respondWithCode(500), error)
  }
}

const root = async  (req, res, params, query, body, user, next) => 
  Utils.writeJson(res, Utils.respondWithCode(200, {
      links: [{
          self: "Root",
          url: "http://127.0.0.1:8080/",
          method: "GET"
        }, {
          self: "Public Films",
          url: "http://127.0.0.1:8080/films/public",
          method: "GET"
        }, {
          self: "Private Films",
          url: "http://127.0.0.1:8080/films/private",
          method: "GET"
        }, {
          self: "Login",
          url: "http://127.0.0.1:8080/user/auth",
          method: "POST"
        }, {
          self: "Logout",
          url: "http://127.0.0.1:8080/user/no-auth",
          method: "POST"
        }
      ]
}))



module.exports = {
  privateFilm,
  publicFilm,
  privateFilms,
  publicFilms,
  reviewPrivateFilm,
  reviewPublicFilm,
  reviewsPrivateFilm,
  reviewsPublicFilm,
  newFilm,
  deleteFilm,
  createdFilms,
  filmsToReview,
  editFilm,
  root
}