"use strict"

const Passport = require("passport")
const Session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const User = require('../DataModel/Users')

const initAuthentication = (app) => {
  // Setup passport
  Passport.use(new LocalStrategy((username, password, done) => {
    User.authUser(username.toLowerCase(), password)
      .then(user => {
        if (user) done(null, user);
        else      done(undefined, false);
      })
      .catch(() => /* db error */ done({status: 500, msg: "Database error"}, false));
  }))

  // Serialization and deserialization of the student to and from a cookie
  Passport.serializeUser((user, done) =>  done(null, user['uid']))
  Passport.deserializeUser((id, done) => 
    User.userWithID(id).then(user => 
      done(null, user)).catch(err => done(err, null)))

  // Initialize express-session
  app.use(Session({
    secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
    resave: false,
    saveUninitialized: false
  }));

  // Initialize passport middleware
  app.use(Passport.initialize())
  app.use(Passport.session())
}

/**
 * Express middleware to check if the user is authenticated.
 * Responds with a 401 Unauthorized in case they're not.
 */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).send('Not authenticated');
}

module.exports = { 
  initAuthentication, 
  isLoggedIn 
};