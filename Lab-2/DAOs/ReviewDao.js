'use strict'

const utils = require('../utils/writer.js')
const Review = require('../DataModel/Reviews.js')
const Film = require('../DataModel/Films.js')

const editReview = async (req, res, params, query, body, user, next) => {

  const review = await Review.getReview(params.fid, user.uid)
  const film = await Film.getFilm(params.fid)

  if (!review || !film || review.uid !== user.uid) 
    return res.status(404).send()

  if (body.completed && body.completed === 0) 
    return res.status(200).send()

  const update = {
    fid: params.fid,
    uid: user.uid,
    completed: body.completed,
    reviewDate: body.reviewDate || review.reviewDate,
    rating: body.rating || review.rating,
    review: body.review || review.review,
  }
  await Review.editReview(update, params.fid, user.uid)
  utils.writeJson(res, utils.respondWithCode(200, update))
}

const deleteReview = async (req, res, params, query, body, user, next) => {

  try {

    const review = await Review.getReview(params.fid, params.uid) // Get the review
    const film   = await Film.getFilm(params.fid)          // Get the film associated to that review

    if(!review)                
      return res.status(404).send() // If not found, send 404
    if(!film)                  
      return res.status(404).send() // If not found, send 404
    if(film.owner !== auid)     
      return res.status(401).send('Not owning this film')    // The user does not own this film
    if(review.completed === 0) 
      return res.status(400).send('Review is not completed') // The review is not completed
    
    await Review.deleteReview(params.fid, params.uid) // Delete it
    return res.status(200).send()
  } catch (error) {
    console.log(error)
    utils.writeJson(res, utils.respondWithCode(500), error)
  }
}

const newReview = async (req, res, params, query, body, user, next) => {
  try {
    const item = await Review.newReview({
      fid: body.fid,
      uid: body.uid,
      completed: body.completed,
      reviewDate: body.reviewDate || null,
      rating: body.rating || null,
      review: body.review || null
    })
    utils.writeJson(res, utils.respondWithCode(200, item))
  } catch (error) {
    console.error(error) // Changed from console.log to console.error for better error logging
    utils.writeJson(res, utils.respondWithCode(500), error)
  }
}

module.exports = {
  newReview,
  deleteReview,
  editReview,
}
