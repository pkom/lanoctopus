const express = require('express')
const ldap = require('ldapjs-client')

const User = require('../models/User')
const ldapClient = require('../helpers/ldap-client')

const router = express.Router()

const OPTS = {
  url: process.env.PASSPORT_LDAP_URL,
  bindDN: process.env.PASSPORT_LDAP_BINDDN,
  bindCredentials: process.env.PASSPORT_LDAP_BINDCREDENTIALS,
  searchBase: 'ou=People,dc=instituto,dc=extremadura,dc=es',
  searchAttributes: ['employeeNumber', 'cn', 'givenName', 'sn', 'uid', 'jpegPhoto']
}

/* We have to modify function "get object" in node_modules/ldapjs-client/responses/search_entry.js to achieve jpegphoto base64 from ldap
with next content

get object() {
  return this.attributes.reduce((obj, a) => {
    let buf = a.buffers;
    let val = a.vals;
    let item
    if (a.type === 'jpegPhoto') {
      item = buf;
    } else {
      item = val;
    }
    obj[a.type] = item && item.length ? item.length > 1 ? item.slice() : item[0] : [];
    // obj[a.type] = a.vals && a.vals.length ? a.vals.length > 1 ? a.vals.slice() : a.vals[0] : [];
    return obj;
  }, { dn: this.objectName });
}
 */

router.post('/updateusers', async (req, res) => {
  const client = new ldap({ url: OPTS.url })
  try {
    await client.bind(OPTS.bindDN, OPTS.bindCredentials)
    const users = await User
      .find({})
      .sort({ name: 1 })
      .exec()
    for (const user of users) {
      const entries = await client.search(OPTS.searchBase, {
        filter: `(uid=${user.name})`,
        scope: 'sub',
        attributes: OPTS.searchAttributes
      })
      if (entries && entries[0]) {
        await User.findOneAndUpdate({ name: user.name }, {
          'profile.lastName': entries[0].sn || '',
          'profile.firstName': entries[0].givenName || '',
          'profile.fullName': `${entries[0].sn}, ${entries[0].givenName}` || '',
          'profile.employeeNumber': entries[0].employeeNumber || '',
          'profile.photoType': 'image/jpeg',
          'profile.photo': entries[0].jpegPhoto
        })
      }
    };
    await client.unbind()
    await client.destroy()
    res.send({ info: 'Se han importado los datos de usuarios del servidor ldap' })
  } catch (err) {
    await client.destroy()
    return res.status(500).send({ info: err.message })
  }
})

//   client.bind(OPTS.bindDN, OPTS.bindCredentials, function(err) {
//     if (err) {
//       return res.status(500).send({ info: err.message })
//     }
//     const users = await User
//       .find({})
//       .exec();
//     users.forEach(async function(user) {
//       console.log(user.name);
//       userLdap = client.search(OPTS.searchBase, {
//         filter: `(uid=${user.name})`,
//         scope: 'sub',
//         attributes: OPTS.searchAttributes
//       }, async function (err, response) {
//         if (err) {
//           return res.status(500).send({ info: err.message })
//         }
//         console.log('buscando...');
//         response.on('searchEntry', function(entry) {
//           console.log('entry: ' + JSON.stringify(entry.object));
//         });
//         response.on('end', function(result) {
//           console.log('status: ' + result.status);
//         });
//       });
//     });
//   });
//   client.unbind();
//   res.send({ info: 'Se han importado los datos de usuarios del servidor ldap'});
// });

router.get('/user', async (req, res) => {
  try {
    const users = await ldapClient.getUsers()
    const response = users.map((user) => {
      let src
      if (user.jpegPhoto) {
        src = `data:image/png;base64,${user.jpegPhoto.toString('base64')}`
      } else {
        src = 'https://gravatar.com/avatar/?s=40&d=mp&s=30'
      }
      return {
        tipo: user.homeDirectory && user.homeDirectory.substring(0, 14) === '/home/profesor' ? 'Profesor' : 'Alumno',
        photo: `<img class="rounded-circle" src="${src}" alt="Foto de ${user.cn}"></img>`,
        name: user.sn + ', ' + user.givenName,
        user: user.uid,
        uid: user.uidNumber,
        gid: user.gidNumber,
        id: user.employeeNumber
      }
    })
    res.status(200).send(response)
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
})

router.get('/user/:username', async (req, res) => {
  try {
    const user = await ldapClient.getUser(req.params.username)
    let src
    if (user.jpegPhoto) {
      src = `data:image/png;base64,${user.jpegPhoto.toString('base64')}`
    } else {
      src = 'https://gravatar.com/avatar/?s=40&d=mp&s=30'
    }
    delete user.jpegPhoto
    user.photo = `<img class="rounded-circle" src="${src}" alt="Foto de ${user.cn}"></img>`
    res.status(200).send(user)
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
})

module.exports = router
