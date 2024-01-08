'use strict'

const { ReviewService } = require('../services/Review')

/**
 * ReviewController è la classe coordinata da MasterController
 * e che si frappone tra il codice Javascript e le invocazioni
 * nel database, ossia il codice SQL. E' compito di questa
 * quella mascherare tutte le interazioni relative alla tabella
 * delle recensioni, manipolando i risultati in modo che possano 
 * essere immediatamente deposti nelle risposte HTTP dal master.
 */
class ReviewContoller {
    service
    /**
     * 
     * @param {object} sqlite 
     * La classe riceve dal master il riferimento
     * all'oggetto che rappresenta il database.
     */
    constructor(sqlite) {
        this.service = new ReviewService(sqlite)
    }
    /**
     * 
     * @param {number | string} fid    identificatore del film.
     * @param {number | string} limit  numero massimo di recensioni da selezione.
     * @param {number | string} offset indice nel database dal quale iniziare a selezionare le recensioni.
     * @returns una lista di recensioni, quelle associate al film
     * con identificatore fid.
     */
    reviewsFilm = async (fid, limit, offset) => {
        try {
            const total = await this.service.countReviewsFilm(fid)
            const reviews = await this.service.reviewsFilm(fid, limit || total, offset || 0)
            return ({
                total: total,
                count: reviews.length,
                limit: limit || total,
                offset: offset || 0,
                data: reviews
            })
        } catch (error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @param {number | string} uid identificatore dell'utente.
     * @returns una recensione (se esiste), quella associata al
     * film con identificatore fid e all'utente con identificatore
     * uid.
     */
    reviewFilm = async (fid, uid) => {
        try {
            return await this.service.reviewFilm(fid, uid)
        } catch (error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} uid    identificatore dell'utente.
     * @param {number | string} limit  numero massimo di recensioni da selezione.
     * @param {number | string} offset indice nel database dal quale iniziare a selezionare le recensioni.
     * @returns una lista di recensioni, quelle associate all'utente
     * con identificatore uid.
     */
    userReviews = async (uid, limit, offset) => {
        try {
            const total = await this.service.countUserReviews(uid)
            const reviews = await this.service.userReviews(uid, limit || total, offset || 0)
            return ({
                total: total,
                count: reviews.length,
                limit: limit || total,
                offset: offset || 0,
                data: reviews
            })
        } catch (error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid  identificatore del film.
     * Consente la cencellazione di tutte le recensioni all'interno
     * del database associate ad un film con identificatore fid,
     */
    deleteReviewsFilm = async (fid) => {
        try {
            return await this.service.deleteReviews(fid)
        } catch (error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @param {number | string} uid identificatore dell'utente.
     * @param {number | string} completed stato della recensione.
     * @param {string} reviewDate data di completamento della recensione.
     * @param {number | string} rating punteggio attribuito al film.
     * @param {string} review commento al film recensito.
     * @returns la recensione appena creata all'interno del database.
     */
    newReview = async (fid, uid, completed, reviewDate, rating, review) => {
        try {
            const _ = await this.service.newReview(
                fid,
                uid,
                completed,
                reviewDate  || null,
                rating      || null,
                review      || null)
            return ({
                fid:        fid,
                uid:        uid,
                completed:  completed,
                reviewDate: reviewDate || null,
                rating:     rating     || null,
                review:     review     || null
            })
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid  identificatore del film.
     * @param {number | string} uid  identificatore dell'utente.
     * Consente la cancellazione di una recensione in particolare, 
     * quella associata al film con identificatore fid e utente con
     * identificatore uid.
     */
    deleteReviewFilm = async (fid, uid) => {
        try {
            return await this.service.deleteReview(fid, uid)
        } catch (error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @param {number | string} uid identificatore dell'utente.
     * @param {number | string} completed stato della recensione.
     * @param {string} reviewDate data di completamento della recensione.
     * @param {number | string} rating punteggio attribuito al film.
     * @param {string} review commento al film recensito.
     * @returns la recensione appena modificata all'interno del database.
     */
    editReview = async (fid, uid, completed, reviewDate, rating, review) => {
        console.log(fid)
        console.log(uid)
        console.log(completed)
        console.log(reviewDate)
        console.log(rating)
        console.log(review)
        try {
            const _ = await this.service.editReview(
                fid,
                uid,
                completed,
                reviewDate  || null,
                rating      || null,
                review      || null)
            return ({
                fid:        fid,
                uid:        uid,
                completed:  completed,
                reviewDate: reviewDate || null,
                rating:     rating     || null,
                review:     review     || null
            })
        } catch(error) {
            return error
        }
    }
}

module.exports = { ReviewContoller }