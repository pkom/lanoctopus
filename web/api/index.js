const express = require('express');
const passportConfig = require('../config/passport');

const computer = require('./computer');
const user = require('./user');
const ldap = require('./ldap');
const login = require('./login');

const router = express.Router();

router.use('/computer', passportConfig.isAdmin, computer);
router.use('/user', passportConfig.isAdmin, user);
router.use('/ldap', passportConfig.isAdmin, ldap);
router.use('/login', login);

module.exports = router