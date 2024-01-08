'use strict'

const { FilmService } = require('../services/Film')

/**
 * FilmController è la classe coordinata da MasterController
 * e che si frappone tra il codice Javascript e le invocazioni
 * nel database, ossia il codice SQL. E' compito di questa
 * quella mascherare tutte le interazioni relative alla tabella
 * dei films, manipolando i risultati in modo che possano essere
 * immediatamente deposti nelle risposte HTTP dal master.
 */
class FilmController {
    service
    /**
     * @param {object} sqlite 
     * La classe riceve dal master il riferimento
     * all'oggetto che rappresenta il database.
     */
    constructor(sqlite) {
        this.service = new FilmService(sqlite)
    }
    /**
     * 
     * @param {number | string} limit  numero massimo di film da selezione.
     * @param {number | string} offset indice nel database dal quale iniziare a selezionare i film.
     * @returns la lista di film nel database che sono pubblici.
     */
    publicFilms = async (limit, offset) => {
        try {
            const total  = await this.service.countPublicFilms()
            const films  = await this.service.publicFilms(limit || total, offset || 0)
            return ({
                total:  total, 
                count:  films.length, 
                limit:  limit  || total, 
                offset: offset || 0,
                data:   films 
            })
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} uid identificatore dell'utente.
     * @param {number | string} limit  numero massimo di film da selezione.
     * @param {number | string} offset indice nel database dal quale iniziare a selezionare i film.
     * @returns la lista di film, quella associata all'utente con identificatore
     * uid.
     */
    userFilms = async (uid, limit, offset) => {
        try {
            const total  = await this.service.countUserFilms(uid)
            const films  = await this.service.userFilms(uid, limit || total, offset || 0)
            return ({
                total:  total, 
                count:  films.length, 
                limit:  limit  || total, 
                offset: offset || 0,
                data:   films 
            })
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @returns il film pubblico (se esiste), quello con identificatore
     * fid.
     */
    publicFilm = async (fid) => {
        try {
            return await this.service.publicFilm(fid)
        } catch(error) {
            return error
        }
    } 
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @returns il film privato (se esiste), quello con identificatore
     * fid.
     */
    privateFilm = async (fid) => {
        try {
            return await this.service.privateFilm(fid)
        } catch(error) {
            return error
        }
    } 
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * @returns il film (se esiste), quello con identificatore
     * fid.
     */ 
    genericFilm = async (fid) => {
        try {
            return await this.service.genericFilm(fid)
        } catch(error) {
            return error
        }
    } 
    /**
     * 
     * @param {number | string} fid identificatore del film.
     * Consente la cancellazione del film con identificatore fid.
     */
    deleteFilm = async (fid) => {
        try {
            return await this.service.deleteFilm(fid)
        } catch(error) {
            return error
        }
    } 
    /**
     * 
     * @param {string} title il titolo del film.
     * @param {number | string} uid l'identificatore dell'utente al quale il film è associato.
     * @param {number | string} isPrivate l'indicatore di visiblità.
     * @param {string} watchDate la data associata al film.
     * @param {number | string} rating la votazione associata al film.
     * @param {number | string} favorite l'indicatore di preferenza.
     * @returns il film che è stato appena creato all'interno del database.
     */
    newFilm = async (title, uid, isPrivate, watchDate, rating, favorite) => {
        try {
            const fid = await this.service.newFilm(
                title,
                uid,
                isPrivate,
                watchDate || null,
                rating    || null,
                favorite  || null)
            return ({
                fid:       fid,
                title:     title,
                uid:       uid,
                isPrivate: isPrivate,
                watchDate: watchDate || null,
                rating:    rating    || null,
                favorite:  favorite  || null
            })
        } catch(error) {
            return error
        }
    }
    /**
     * 
     * @param {string} title il titolo del film.
     * @param {number | string} uid l'identificatore dell'utente al quale il film è associato.
     * @param {number | string} isPrivate l'indicatore di visiblità.
     * @param {string} watchDate la data associata al film.
     * @param {number | string} rating la votazione associata al film.
     * @param {number | string} favorite l'indicatore di preferenza.
     * @returns il film che è stato appena modificato all'interno del database.
     */
    editFilm = async (title, uid, isPrivate, watchDate, rating, favorite, fid) => {
        try {
            const _ = await this.service.editFilm(
                title,
                uid,
                isPrivate,
                watchDate || null,
                rating    || null,
                favorite  || null,
                fid)
            return ({
                fid:       fid,
                title:     title,
                uid:       uid,
                isPrivate: isPrivate,
                watchDate: watchDate || null,
                rating:    rating    || null,
                favorite:  favorite  || null
            })
        } catch(error) {
            return error
        }
    }
}

module.exports = { FilmController }