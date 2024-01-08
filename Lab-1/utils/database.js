'use strict'

const Path = require('path')
const Sqlite3 = require('sqlite3')

class Database {
    // Proprieta
    sqlite
    /**
     * Costruttore per la classe Database
     */
    constructor() {
        const dbPath = Path.join(Path.resolve(__dirname, '..'), 'resources', 'db')
        this.sqlite = new Sqlite3.Database(dbPath, (error) => error ?
            console.log('[-] Si è verificato\n\n', error, '\n\nnell\'apertura del db') :
            console.log('[+] Apertura del db avvenuta con successo'))
    }
    /**
     * 
     * @param {string} query 
     * @param {number[]} params 
     * @returns righe nel database che soddisfano una condizione,
     * quella definita nella query. Opzionalmente, è possibile 
     * limitare il ventaglio di ricerca, inserendo i parametri
     * limit e offset, rispettivamente LIMIT e OFFSET nella 
     * interrogazione SQL
     */
    dbAllAsync = (query, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.all(query, params, (error, rows) =>
                error ? reject(error) : resolve(rows)))

    /**
     * 
     * @param {string} query 
     * @param {any | any[]} params 
     * @returns riga nel database che soddisfa una condizione,
     * quella definita nella query. In caso di risultato nullo,
     * il valore di ritorno è undefined.
     */
    dbGetAsync = (query, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.get(query, params, (error, row) =>
                error ? reject(error) : resolve(row)))
    /**
     * 
     * @param {string} query 
     * @param {null} params 
     * @returns numero di righe nel database che soddisfano una
     * condizione, quella definita nalla query.
     */
    dbCountAsync = (query, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.get(query, params, (error, row) =>
                error ? reject(error) : resolve(row.count)))
    /**
     * 
     * @param {string} query 
     * @param {any[]} params 
     * @returns l'identificatore associato all'elemento
     * appena inserito nel database.
     */
    dbAddAsync = (sql, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.run(sql, params, function (error) {
                if (error)
                    reject(error)
                else
                    resolve(this.lastID)
            }))
    /**
     * 
     * @param {string} query 
     * @param {any[]} params
     */
    dbEditAsync = (sql, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.run(sql, params, error =>
                error ? reject(error) : resolve()))
    /**
     * 
     * @param {string} query 
     * @param {any[]} params
     */
    dbDeleteAsync = (sql, params = []) =>
        new Promise((resolve, reject) =>
            this.sqlite.run(sql, params, error =>
                error ? reject(error) : resolve()))
}

module.exports = { Database }
