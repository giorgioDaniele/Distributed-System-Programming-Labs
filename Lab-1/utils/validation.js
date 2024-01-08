'use strict'

const Ajv = require('ajv');
const FileSystem = require('fs');
/**
 * La classe consente la validazione di oggetti JSON 
 * contro schemi arbitrari definiti nel file contenuto
 * al percorso indicato.
 */
class HTTPValidator {
    schema
    ajv
    validate
    /**
     * 
     * @param {string} schemaPath 
     */
    constructor(schemaPath) {
        this.ajv = new Ajv({
            allErrors: true,
        })
        this.validate = this.ajv.compile(JSON.parse(FileSystem.readFileSync(schemaPath).toString()))
    }

    validateObject = (object) => {
        this.validate(object)
        //console.log(this.validate.errors)
        return this.validate.errors
    }
        
} 

module.exports = { HTTPValidator }