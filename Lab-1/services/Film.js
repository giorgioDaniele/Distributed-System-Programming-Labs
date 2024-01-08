'use strict'

// Interrogazioni
const countPublicFilms  = `SELECT COUNT(*) count FROM FILMS WHERE isPrivate = 0`
const countUserFilms    = `SELECT COUNT(*) count FROM FILMS WHERE uid = ?`
const selectGenericFilm = `SELECT * FROM FILMS WHERE fid = ?`
const selectPublicFilms = `SELECT * FROM FILMS WHERE isPrivate = 0 LIMIT ? OFFSET ?`
const selectPublicFilm  = `SELECT * FROM FILMS WHERE isPrivate = 0 AND fid = ?`
const selectPrivateFilm = `SELECT * FROM FILMS WHERE isPrivate = 1 AND fid = ?`
const deleteFilm        = `DELETE   FROM FILMS WHERE fid = ?`
const newFilm           = `INSERT   INTO FILMS (title, uid, isPrivate, watchDate, rating, favorite) VALUES (?, ?, ?, ?, ?, ?)`
const editFilm          = `UPDATE        FILMS SET title = ?, uid = ?, isPrivate = ?, watchDate = ?, rating = ?, favorite = ? WHERE fid = ?`
const userFilms         = `SELECT * FROM FILMS WHERE uid = ? LIMIT ? OFFSET ?`

class FilmService {
    // Proprietà
    sqlite
    // Metodi
    constructor(sqlite) {
        this.sqlite = sqlite
    }

    countPublicFilms = async _ =>
        await this.sqlite.dbCountAsync(countPublicFilms, [])

    countUserFilms = async uid =>
        await this.sqlite.dbCountAsync(countUserFilms, [uid])

    publicFilms = async (limit, offset) => 
        await this.sqlite.dbAllAsync(selectPublicFilms, [limit, offset])

    publicFilm = async fid  =>
        await this.sqlite.dbGetAsync(selectPublicFilm, [fid])

    genericFilm = async fid  =>
        await this.sqlite.dbGetAsync(selectGenericFilm, [fid])

    privateFilm = async (fid) =>
        await this.sqlite.dbGetAsync(selectPrivateFilm, [fid])

    deleteFilm = async fid => 
        await this.sqlite.dbDeleteAsync(deleteFilm, [fid])

    newFilm = async (title, uid, isPrivate, watchDate, rating, favorite) =>
       await this.sqlite.dbAddAsync(newFilm, [title, uid, isPrivate, watchDate, rating, favorite])

    editFilm = async (title, uid, isPrivate, watchDate, rating, favorite, fid) =>
       await this.sqlite.dbEditAsync(editFilm, [title, uid, isPrivate, watchDate, rating, favorite, fid])

    userFilms = async (uid, limit, offset) => 
        await this.sqlite.dbAllAsync(userFilms, [uid, limit, offset])

}

module.exports = { FilmService }