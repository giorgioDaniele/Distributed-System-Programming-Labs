'use strict'

const Utils         = require('../utils/writer.js')
const Image         = require('../DataModel/Images.js')
const Film          = require('../DataModel/Films.js')
const FileSystem    = require('fs')
const Path          = require('path')
const HTTP_codes    = require('../src/http_codes.js')
const gRPC          = require('../src/grpc.js')

const fileNameToExt   = string => string.split('.')[1]
const contenTypeToExt = string => string.split('/')[1]

const filmImages = async (_req, res, params, _query, _body, _user, _next) => {

    const fid = params.fid

    try {
        const items = await Image.filmImages(fid)
        return Utils.writeJson(res, Utils.respondWithCode(200, {
            total: items.length,
            data:  items ? items.map(obj => ({
                self: `http://127.0.0.1:8080/api/films/public/${obj.fid}/images/${obj.iid}`,
                ...obj
            })) : []
        }))
    } catch(error) { 
        return Utils.writeJson(res, 
            Utils.respondWithCode(
                HTTP_codes.INTERNAL_SERVER_ERROR), 
                error) 
    }
}

const filmImage = async (req, res, params, _query, _body, _user, _next) => {

    const fid = params.fid
    const iid = params.iid

    const reqCnt = req.get("Accept") ? req.get("Accept").trim() : undefined
    const reqFmt = req.get("Accept") ? contenTypeToExt(req.get("Accept").trim()) : undefined
    const supFmt = ['png', 'jpg', 'jpeg', 'gif', 'json']

    if(!reqFmt)
        return res.status(HTTP_codes.BAD_REQUEST).send('Not recognized format');
        // Invalid format
    if(reqFmt && !supFmt.includes(reqFmt))
        return res.status(HTTP_codes.BAD_REQUEST).send('Format not supported')
        // Format not supported

    try {

        const image = await Image.filmImage(fid, iid)

        if(!image)
            return res.status(HTTP_codes.NOT_FOUND).send()

        if(reqFmt === 'json') { 
            return Utils.writeJson(res, Utils.respondWithCode(200, {
                self: `http://127.0.0.1:8080/api/films/public/${fid}/images/${iid}`,
                data:  image
            })) 
        } 

        const imageBytes = FileSystem.readFileSync(
            Path.join(
                __dirname + '/../resources/images', 
                image.name))

        const sendPicture = (res, reqCnt, bytes) => 
            res.status(HTTP_codes.OK).setHeader('Content-Type', reqCnt).send(bytes)

        contenTypeToExt(image.format) !== reqFmt ? 
            await gRPC.fileConverter(
                { file_type_origin: contenTypeToExt(image.format), file_type_target: reqFmt},  
                    imageBytes, 
                        bytes => sendPicture(res, reqCnt, bytes)) : sendPicture(res, reqCnt, bytes)

    } catch(error) { 
        return Utils.writeJson(res, 
            Utils.respondWithCode(
                HTTP_codes.INTERNAL_SERVER_ERROR), 
                error) 
        // Database error
    }
}

const newImage  = async (req, res, params, _query, _body, user, _next) => {

    const fid = params.fid
    const iid = params.iid
    const fnm = req.file.filename
    const spt = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

    const deleteFile = async name => 
        FileSystem.unlink(
            Path.join(
                __dirname + '/../resources/images', 
                name.trim()), () => {})

    // Constraint: a user can associate a new image to a public film she owns!
    try {

        const film = await Film.publicFilm(fid)

        if(!film) {
            await deleteFile(fnm)
            return res.status(HTTP_codes.NOT_FOUND).send() 
            // The film does not exist
        }

        if(film && film.owner !== user.uid) {
            await deleteFile(fnm)
            return res.status(HTTP_codes.FORBIDDEN).send('Not the owner of film'); 
            // The user is not owning the film
        }

        if(film && fileNameToExt(fnm) && !spt.includes(fileNameToExt(fnm))) {
            await deleteFile(fnm)
            return res.status(HTTP_codes.BAD_REQUEST).send('Format not supported'); 
            // The format is not supported
        }

        const update = await Image.newImage({
            fid:    film.fid,
            format: 'image/' + `${fileNameToExt(fnm) ? fileNameToExt(fnm) : 'jpg'}`,
            name:   fnm
        })

        return Utils.writeJson(res, Utils.respondWithCode(HTTP_codes.CREATED, {
            self: `http://127.0.0.1:8080/api/films/public/${update.fid}/images/${update.iid}`,
            data:  update
        }))
        // Done

    } catch(error) { 
        return Utils.writeJson(res, 
            Utils.respondWithCode(
                HTTP_codes.INTERNAL_SERVER_ERROR), 
                error) 
        // Database error
    }
}

const deleteImage = async (req, res, params, query, body, user, next) => {

    const fid = params.fid
    const iid = params.iid
    const uid = user.uid

    // Constraint: a user can delete an image from a public film she owns!

    const deleteFile = async name => 
        FileSystem.unlink(Path.join(__dirname + '/../resources/images', name.trim()), () => {})

    try {

        const film  = await Film.publicFilm(fid)
        const image = await Image.filmImage(fid, iid)

        if(!image) {
            await deleteFile(fnm)
            return res.status(HTTP_codes.NOT_FOUND).send() 
            // The image does not exist
        }

        if(image && film.owner !== uid) {
            await deleteFile(fnm)
            return res.status(HTTP_codes.FORBIDDEN).send('Not the owner of film'); 
            // The user is not owning the film
        }

        await Image.deleteImage(fid, iid)
        deleteFile(image.name)
        return res.status(HTTP_codes.OK).send() 
        // Done

    } catch(error) { 
        return Utils.writeJson(res, 
            Utils.respondWithCode(
                HTTP_codes.INTERNAL_SERVER_ERROR), 
                error) 
        // Database error
    }
}


module.exports = {
    filmImage,
    filmImages,
    newImage,
    deleteImage
}