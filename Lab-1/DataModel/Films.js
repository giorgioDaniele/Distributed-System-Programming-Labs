'use strict';

const Database = require('../src/db')

const db = Database.handle
const dbAllAsync = Database.dbAllAsync
const dbCountAsync = Database.dbCountAsync
const dbRunAddAsync = Database.dbRunAddAsync
const dbRunDeleteAsync = Database.dbRunDeleteAsync
const dbGetAsync = Database.dbGetAsync
const dbRunEditAsync = Database.dbRunEditAsync

// Queries
const filmSQL = `
  SELECT *
  FROM films
  WHERE fid = ?`
const countPublicFilmsSQL = `
  SELECT COUNT(*) count 
  FROM films
  WHERE private = 0`
const countPrivateFilmsSQL = `
  SELECT COUNT(*) count 
  FROM films
  WHERE private = 1`
const privateFilmsSQL = `
  SELECT *
  FROM films
  WHERE private = 1
  LIMIT ? OFFSET ?`
const publicFilmsSQL = `
  SELECT *
  FROM films
  WHERE private = 0
  LIMIT ? OFFSET ?`
const publicFilmSQL = `
  SELECT *
  FROM films
  WHERE private = 0 AND fid = ?`
const privateFilmSQL = `
  SELECT *
  FROM films
  WHERE private = 1 AND fid = ?`
const publicFilmReviews = `
  SELECT r.* 
  FROM reviews r
  INNER JOIN films f ON r.fid = f.fid
  WHERE f.fid = ? AND f.private = 0`
const privateFilmReviews = `
  SELECT r.* 
  FROM reviews r
  INNER JOIN films f ON r.fid = f.fid
  WHERE f.fid = ? AND f.private = 1`
const publicFilmReview = `
  SELECT r.* 
  FROM reviews r
  INNER JOIN films f ON r.fid = f.fid
  WHERE r.fid = ? AND f.private = 0 AND r.uid = ?`
const privateFilmReview = `
  SELECT r.* 
  FROM reviews r
  INNER JOIN films f ON r.fid = f.fid
  WHERE r.fid = ? AND f.private = 1 AND r.uid = ?`
const newFilmSQL = `
  INSERT INTO FILMS (
    title, 
    owner, 
    private,
    watchDate, 
    rating, 
    favorite) 
    VALUES (?, ?, ?, ?, ?, ?)`
const deleteFilmSQL = `
  DELETE FROM films WHERE fid = ?`
const countCreatedFilmsSQL = `
  SELECT COUNT(*) count 
  FROM films
  WHERE owner = ?`
const createdFilmsSQL = `
  SELECT *
  FROM films
  WHERE owner = ? 
  LIMIT ? OFFSET ?`
const invitedToReviewSQL = `
  SELECT
  films.fid,
  films.title,
  films.owner,
  films.private,
  films.watchDate,
  films.rating,
  films.favorite
  FROM films
  JOIN
  reviews ON films.fid = reviews.fid
  WHERE reviews.uid = ?
  LIMIT ? OFFSET ?`
const countFilmsToReviewSQL =  `
  SELECT COUNT(*) count
  FROM films
  JOIN
  reviews ON films.fid = reviews.fid
  WHERE reviews.uid = ?`
const editFilmSQL = `
  UPDATE FILMS
  SET
      title = ?,
      owner = ?,
      private = ?,
      watchDate = ?,
      rating = ?,
      favorite = ?
  WHERE fid = ?;
`

const getFilm = async fid => 
  await dbGetAsync(db, filmSQL, [fid]) || undefined

const countPublicFilms  = async  _  =>
  await dbCountAsync(db, countPublicFilmsSQL,  [])

const countPrivateFilms = async  _  => 
  await dbCountAsync(db, countPrivateFilmsSQL, [])

const countCreatedFilms = async uid => 
  await dbCountAsync(db, countCreatedFilmsSQL, [uid])

const countFilmsToReview = async uid => 
  await dbCountAsync(db, countFilmsToReviewSQL, [uid])

// GET /api/films/public
const publicFilms = async (limit, offset) => 
  await dbAllAsync(db, publicFilmsSQL, [limit, offset])

// GET /api/films/private
const privateFilms = async (limit, offset) => 
  await dbAllAsync(db, privateFilmsSQL, [limit, offset])

// GET /api/films/private/{fid}
const privateFilm = async fid => 
  await dbGetAsync(db, privateFilmSQL, [fid])

// GET /api/films/public/{fid}
const publicFilm = async fid => 
  await dbGetAsync(db, publicFilmSQL, [fid])

// GET /api/films/private/{fid}/reviews
const reviewsPrivateFilm = async fid =>
  (await dbGetAsync(db, privateFilmSQL, [fid]))
    ? await dbAllAsync(db, privateFilmReviews, [fid]) : undefined

// GET /api/films/public/{fid}/reviews
const reviewsPublicFilm = async fid =>
  (await dbGetAsync(db, publicFilmSQL, [fid]))
    ? await dbAllAsync(db, publicFilmReviews, [fid]) : undefined


// GET /api/films/private/{fid}/reviews/{uid}
const reviewPrivateFilm = async (fid, uid) => 
  await dbGetAsync(db, privateFilmReview, [fid, uid])

// GET /api/films/public/{fid}/reviews/{uid}
const reviewPublicFilm = async (fid, uid) => 
  await dbGetAsync(db, publicFilmReview, [fid, uid])

// GET /api/films/created
const createdFilms = async (uid, limit, offset) =>
  await dbAllAsync(db, createdFilmsSQL, [uid, limit, offset])

// GET /api/films/invited-to-review
const filmsToReview = async (uid, limit, offset) => 
  await dbAllAsync(db, invitedToReviewSQL, [uid, limit, offset])


// POST /api/films
const newFilm = async update => {
  const lastID = await dbRunAddAsync(db, newFilmSQL, [
    update.title,
    update.owner,
    update.private,
    update.watchDate,
    update.rating,
    update.favorite,
  ])
  return {
    fid: lastID,
    ...update,
  }
}

// DELETE /api/films/{fid}
const deleteFilm = async fid => 
  await dbRunDeleteAsync(db, deleteFilmSQL, [fid])

// PUT /api/films/{fid}
const editFilm = async (update, fid) =>
  await dbRunEditAsync(db, editFilmSQL, [
    update.title,
    update.owner,
    update.private,
    update.watchDate,
    update.rating,
    update.favorite,
    fid,
  ])

module.exports = { 
  getFilm,
  countPrivateFilms,
  countPublicFilms,
  publicFilm,
  publicFilms,
  privateFilm,
  privateFilms,
  reviewPrivateFilm,
  reviewsPrivateFilm,
  reviewPublicFilm,
  reviewsPublicFilm,
  createdFilms,
  deleteFilm,
  editFilm,
  filmsToReview,
  newFilm,
  countCreatedFilms,
  countFilmsToReview,
  filmsToReview
}