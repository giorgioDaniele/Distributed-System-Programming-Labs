'use strict'

const Multer = require('multer')
const storage = Multer.diskStorage({
    destination: function (req, file, cb)  { cb(null, './resources/images')}, 
    filename:    function (req, file, cb)  { cb(null, file.originalname)}
})
const uploadImg = Multer({storage: storage}).single('image')
module.exports.uploadImg = uploadImg