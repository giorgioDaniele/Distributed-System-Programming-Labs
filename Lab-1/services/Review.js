'use strict'

// Interrogazioni
const countReviewsFilm  = `SELECT COUNT(*) count FROM REVIEWS WHERE fid = ?`
const countUserReviews  = `SELECT COUNT(*) count FROM REVIEWS WHERE uid = ?`
const selectReviewsFilm = `SELECT * FROM REVIEWS WHERE fid = ? LIMIT ? OFFSET ?`    
const selectReviewFilm  = `SELECT * FROM REVIEWS WHERE fid = ? AND uid = ?`  
const selectUserReviews = `SELECT * FROM REVIEWS WHERE uid = ? LIMIT ? OFFSET ?`
const deleteReviews     = 'DELETE   FROM REVIEWS WHERE fid = ?`'
const newReview         = `INSERT INTO REVIEWS (fid, uid, completed, reviewDate, rating, review) VALUES (?, ?, ?, ?, ?, ?)`
const deleteReview      = `DELETE FROM REVIEWS WHERE fid = ? AND uid = ?`
const editReview        = `UPDATE REVIEWS SET fid = ?, uid = ?, completed = ?, reviewDate = ?, rating = ?, review = ? WHERE fid = ? and uid = ?`

class ReviewService {
    // Proprietà
    sqlite
    // Metodi
    constructor(sqlite) {
        this.sqlite = sqlite
    }

    countReviewsFilm = async fid =>
        await this.sqlite.dbCountAsync(countReviewsFilm, [fid])

    countUserReviews = async uid =>
        await this.sqlite.dbCountAsync(countUserReviews, [uid])

    reviewsFilm = async (fid, limit, offset) =>
        await this.sqlite.dbAllAsync(selectReviewsFilm, [fid, limit, offset])

    reviewFilm = async (fid, uid) =>
        await this.sqlite.dbGetAsync(selectReviewFilm, [fid, uid])

    userReviews = async (uid, limit, offset) =>
        await this.sqlite.dbAllAsync(selectUserReviews, [uid, limit, offset])

    deleteReviews = async fid =>
        await this.sqlite.dbDeleteAsync(deleteReviews, [fid])

    deleteReview = async (fid, uid) =>
        await this.sqlite.dbDeleteAsync(deleteReview, [fid, uid])

    newReview = async (fid, uid, completed, reviewDate, rating, review) =>
        await this.sqlite.dbAddAsync(newReview, [fid, uid, completed, reviewDate, rating, review])

    editReview = async (fid, uid, completed, reviewDate, rating, review) =>
        await this.sqlite.dbEditAsync(editReview, [fid, uid, completed, reviewDate, rating, review, fid, uid])
}


module.exports = { ReviewService }