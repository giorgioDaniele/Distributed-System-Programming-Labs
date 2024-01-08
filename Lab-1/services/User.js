'use strict'

// Interrogazioni
const selectProfileEmail = `SELECT * FROM USERS where email = ?`
const selectProfile = `SELECT * FROM USERS where uid = ?`

class UserService {
    // Proprietà
    sqlite
    // Metodi
    constructor(sqlite) {
        this.sqlite = sqlite
    }

    userProfileEmail = async email => 
        await this.sqlite.dbGetAsync(selectProfileEmail, [email])   

    userProfile = async uid =>
        await this.sqlite.dbGetAsync(selectProfile, [uid])
}

module.exports = { UserService }
