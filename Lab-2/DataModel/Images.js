'use strict';

const Database = require('../src/db')

const db = Database.handle
const dbAllAsync = Database.dbAllAsync
const dbCountAsync = Database.dbCountAsync
const dbRunAddAsync = Database.dbRunAddAsync
const dbRunDeleteAsync = Database.dbRunDeleteAsync
const dbGetAsync = Database.dbGetAsync
const dbRunEditAsync = Database.dbRunEditAsync


const imagesSQL      = `SELECT * FROM IMAGES WHERE fid = ?`
const imageSQL       = `SELECT * FROM IMAGES WHERE fid = ? AND iid = ?`
const newImageSQL    = `INSERT INTO IMAGES (fid, format, name) VALUES (?, ?, ?)`
const deleteImageSQL = `DELETE FROM IMAGES WHERE fid = ? AND iid = ?`

const filmImages  = async fid        => await dbAllAsync(db, imagesSQL, [fid])

const filmImage   = async (fid, iid) => await dbGetAsync(db, imageSQL,  [fid, iid])

const newImage    = async update => {

    const lastID = await dbRunAddAsync(db, newImageSQL, [
      update.fid,
      update.format,
      update.name,
    ])
    return {
      iid: lastID,
      ...update,
    }
}

const deleteImage = async (fid, iid) => await dbRunDeleteAsync(db, deleteImageSQL, [fid, iid])


module.exports = {
    filmImage,
    filmImages,
    newImage,
    deleteImage
}