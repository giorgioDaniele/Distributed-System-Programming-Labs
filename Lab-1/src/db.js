'use strict'

const sqlite = require('sqlite3')
const handle = new sqlite.Database('./resources/db.sqlite')

const dbAllAsync    = (db, sql, params = []) =>
     new Promise((resolve, reject) => 
        db.all(sql, params, (error, rows) => 
            error ? reject(error) : resolve(rows)))

const dbRunAddAsync = (db, sql, params = []) => 
    new Promise((resolve, reject) =>
        db.run(sql, params, function(error) {
    if(error) reject(error)
    else {
        const lastID = this.lastID
        resolve(lastID)
    }
}))

const dbRunDeleteAsync = (db, sql, params = []) => 
    new Promise((resolve, reject) => 
        db.run(sql, params, error => 
            error ? reject(error) : resolve()))

const dbRunEditAsync = (db, sql, params = []) => 
    new Promise((resolve, reject) => 
        db.run(sql, params, error => 
            error ? reject(error) : resolve()))

const dbGetAsync   = (db, sql, params = []) => 
    new Promise((resolve, reject) => 
        db.get(sql, params, (error, row) => 
            error ? reject(error) : resolve(row)))

const dbCountAsync = (db, sql, params = []) => 
    new Promise((resolve, reject) => 
        db.get(sql, params, (error, row) =>
            error ? reject(error) : resolve(row.count)))

module.exports = {
    handle,
    dbAllAsync,
    dbRunAddAsync,
    dbRunDeleteAsync,
    dbGetAsync,
    dbRunEditAsync,
    dbCountAsync
}