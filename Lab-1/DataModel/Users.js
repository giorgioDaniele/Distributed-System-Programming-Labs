'use strict';

const Database = require('../src/db')
const db = Database.handle
const Crypto = require("crypto")
const dbGetAsync = Database.dbGetAsync

const authUser = (username, password) => new Promise((resolve, reject) => {
  // Get the student with the given email
  dbGetAsync(db,
    'select * from users where email = ?',
    [username])
    .then(user => {
      // If there is no such user, resolve to false.
      // This is used instead of rejecting the Promise to differentiate the
      // failure from database errors
      if (!user) resolve(false)
      // Verify the password
      Crypto.scrypt(password, user.salt, 32, (err, hashedPassword) => {
        if (err) 
          reject(err);
        const passwordHex = Buffer.from(user.pwdh, 'hex')
        !Crypto.timingSafeEqual(passwordHex, hashedPassword) ? resolve(false) : resolve(user)
      })

    }).catch(e => reject(e));
})
const userWithID = async uid => {
  const user = await dbGetAsync(
    db,
    'select email from users where uid = ?', [uid])
  return {...user, uid};
}

module.exports = {
  authUser,
  userWithID,
}