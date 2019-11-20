const passport = require('passport');
const axios = require('axios');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: LdapStrategy } = require('passport-ldapauth');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const _ = require('lodash');
const moment = require('moment');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
  User.findOne({ userName: username.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Username ${username} not found.` });
    }
    if (!user.password) {
      return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid username or password.' });
    });
  });
}));

// LDAP STRATEGY

// Credentials from the free LDAP test server by forumsys
// More info at: http://www.forumsys.com/tutorials/integration-how-to/ldap/online-ldap-test-server/
/* LDAP Server Information (read-only access):

Server: ldap.forumsys.com
Port: 389

Bind DN: cn=read-only-admin,dc=example,dc=com
Bind Password: password

All user passwords are password.

You may also bind to individual Users (uid) or the two Groups (ou) that include:

ou=mathematicians,dc=example,dc=com

riemann
gauss
euler
euclid
ou=scientists,dc=example,dc=com

einstein
newton
galieleo
tesla
 */
let OPTS;
if (process.env.LDAP_TEST === 'no') {
  OPTS = {
    url: 'ldap://ldap.forumsys.com:389',
    bindDn: 'cn=read-only-admin,dc=example,dc=com',
    bindCredentials: 'password',
    searchBase: 'dc=example,dc=com',
    searchFilter: '(uid={{username}})'
  };
} else {
  OPTS = {
    url: 'ldap://ldap:389',
    bindDN: 'cn=replica,dc=instituto,dc=extremadura,dc=es',
    bindCredentials: 'replica',
    searchBase: 'ou=People,dc=instituto,dc=extremadura,dc=es',
    searchFilter: '(uid={{username}})',
    searchAttributes: ['employeeNumber', 'cn', 'givenName', 'sn', 'uid'],
    // bindProperty: 'uid'
    groupSearchBase: 'ou=Group,dc=instituto,dc=extremadura,dc=es', 
    groupSearchAttributes: ['cn'],
    groupSearchFilter: '(&(objectClass=groupOfNames)(memberUid={{username}}))'
  };
}
passport.use(new LdapStrategy({
  usernameField: 'username',
  passwordField: 'password',
  server: OPTS
}, async (user, done) => {
  // store data into database User model from ldap
  User.findOneAndUpdate({ userName: user.uid }, {
    userName: user.uid,
    // email: user.mail,
    'profile.fullName': user.cn,
    'profile.employeeNumber': user.employeeNumber,
    'profile.firstName': user.givenName,
    'profile.lastName': user.sn
  }, { new: true, upsert: true }, (err, usr) => {
    if (err) { return done(err); }
    return done(null, usr);
  });
}));

// JSON WEB TOKENS STRATEGY
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.SECRET || 'secret', // config.get('jwtPrivateKey'),
}, async (payload, done) => {
  try {
    // Find the user specified in token
    const user = await User.findById(payload.sub);
    // if user does not exist, handle it
    if (!user) {
      return done(null, false);
    }

    // Otherwise, return the user
    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/')[2];
  const token = req.user.tokens.find((token) => token.kind === provider);
  if (token) {
    // Is there an access token expiration and access token expired?
    // Yes: Is there a refresh token?
    //     Yes: Does it have expiration and if so is it expired?
    //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
    //       No, Quickbooks and Google- refresh token and save, and then go to next();
    //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
    // No: we are good, go to next():
    if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
      if (token.refreshToken) {
        if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, 'minutes'))) {
          res.redirect(`/auth/${provider}`);
        } else {
          refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
            User.findById(req.user.id, (err, user) => {
              user.tokens.some((tokenObject) => {
                if (tokenObject.kind === provider) {
                  tokenObject.accessToken = accessToken;
                  if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, 'seconds').format();
                  return true;
                }
                return false;
              });
              req.user = user;
              user.markModified('tokens');
              user.save((err) => {
                if (err) console.log(err);
                next();
              });
            });
          });
        }
      } else {
        res.redirect(`/auth/${provider}`);
      }
    } else {
      next();
    }
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
