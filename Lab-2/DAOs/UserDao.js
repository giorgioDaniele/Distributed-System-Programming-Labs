'use strict';

const Utils = require('../utils/writer.js');
const User = require('../DataModel/UserService.js');


module.exports.login = function login (req, res, next, body) {
  User.login(body)
    .then(function (response) {
      Utils.writeJson(res, response);
    })
    .catch(function (response) {
      Utils.writeJson(res, response);
    });
};

module.exports.logout = function logout (req, res, next) {
  User.logout()
    .then(function (response) {
      Utils.writeJson(res, response);
    })
    .catch(function (response) {
      Utils.writeJson(res, response);
    });
};
