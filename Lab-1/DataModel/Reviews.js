'use strict';

const Database = require('../src/db')

const db = Database.handle
const dbRunAddAsync = Database.dbRunAddAsync
const dbRunDeleteAsync = Database.dbRunDeleteAsync
const dbGetAsync = Database.dbGetAsync
const dbRunEditAsync = Database.dbRunEditAsync

const reviewSQL = `
  SELECT *
    FROM reviews
      WHERE fid = ? AND uid = ?`
const newReviewSQL = `
  INSERT INTO reviews (
    fid, 
    uid, 
    completed,
    reviewDate, 
    rating, 
    review) 
    VALUES (?, ?, ?, ?, ?, ?)`
const deleteReviewSQL = `
  DELETE FROM 
    reviews 
      WHERE fid = ? AND uid = ?`
const editReviewSQL = `
  UPDATE reviews
  SET
    fid = ?,
    uid = ?,
    completed = ?,
    reviewDate = ?,
    rating = ?,
    review = ?
    WHERE fid = ? and uid = ?;
`

const getReview = async(fid, uid) => await dbGetAsync(db, reviewSQL, [fid, uid])

// POST /api/reviews
const newReview = async review => {
  await dbRunAddAsync(db, newReviewSQL, Object.values(review))
  return { ...review }
}
// DELETE /api/reviews/{fid}/{uid}
const deleteReview = async (fid, uid) => 
  await dbRunDeleteAsync(db, deleteReviewSQL, [fid, uid])

// PUT /api/reviews/{fid}/{uid}
const editReview = async (update, fid, uid) =>
  await dbRunEditAsync(db, editReviewSQL, [...Object.values(update), fid, uid])


module.exports = {
  newReview,
  deleteReview,
  getReview,
  editReview
}