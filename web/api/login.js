const express = require('express');
const passport = require('passport');
const passportConfig = require('../config/passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * POST /api/login
 * Sign in using username and password returning a jsonwebtoken.
 */
router.post('/', async (req, res, next) => {
  if (!req.body.name || !req.body.password) {
    return res.status(400).send({
      message: 'No username or password has been submitted'
    })
  }
  passport.authenticate('ldapauth', { session: false }, async (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.status(401).send({
        message: info.message
      })
    }
    jwt.sign({
        sub: user.id,
        name: user.name,
        exp: Date.now() + parseInt(process.env.JWT_LIFETIME),
        createdAtLocale: user.createdAtLocale,
        updatedAtLocale: user.updatedAtLocale,
        fullName: user.fullNameRev,
        isAdmin: user.name === process.env.USER_ADMIN ? true : false,
      },
      process.env.SESSION_SECRET,
      { algorithm: 'HS256' },
      (err, token) => {
        if (err) {
          return res.status(401).send({
            message: 'Error getting token'
          })  
        }

        req.logIn(user, (err) => {
          if (err) return res.status(401).send({ message: 'Error creating session' })  

          if (user.name === process.env.USER_ADMIN) {
            req.session.isAdmin = true;
          } else {
            req.session.isAdmin = false;
          }

          res.status(200).send({
            token
          })

        });


      }
    )
  })(req, res);
});


/**
 * GET /api/jwtprotected
 * Check JWT token
 */
router.get('/jwtprotected', passportConfig.JWTisAuthenticated, (req, res)=> {
  res.status(200).send({
    message: 'JWT token validated'
  })
});


module.exports = router;
