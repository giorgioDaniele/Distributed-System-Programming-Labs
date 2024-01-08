'use strict'

const { UserService } = require('../services/User')

/**
 * UserController è la classe coordinata da MasterController
 * e che si frappone tra il codice Javascript e le invocazioni
 * nel database, ossia il codice SQL. E' compito di questa
 * quella mascherare tutte le interazioni relative alla tabella
 * degli utenti, manipolando i risultati in modo che possano 
 * essere immediatamente deposti nelle risposte HTTP dal master.
 */
class UserContoller {
    service
    /**
     * 
     * @param {object} sqlite 
     * La classe riceve dal master il riferimento
     * all'oggetto che rappresenta il database.
     */
    constructor(sqlite) {
        this.service = new UserService(sqlite)
    }

    userProfileEmail = (email) =>
        this.service.userProfileEmail(email)
            .then(user   =>  user)
            .catch(error => 'ERROR')

    userProfile = (uid) =>
        this.service.userProfile(uid)
            .then(user   => user)
            .catch(error => 'ERROR')
}

module.exports = { UserContoller }