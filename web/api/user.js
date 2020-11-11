const express = require('express');

const router = express.Router();

const User = require('../models/User');

router.get('/', async (req, res) => {
  const users = await User
    .find({})
    .sort('name')
    .exec();
  res.send(users);
});

router.get('/mdt', (req, res) => {
  User.dataTables({
    limit: req.query.length,
    skip: req.query.start,
    order: req.query.order,
    columns: req.query.columns,
    oFilters: req.query.oFilters,
    search: req.query.search,
    // sort: {
    //   name: 1
    // },
    formatter: (user) => {
      return {
        name: user.name,
        online: user.online ? 'Online' : 'Offline',
        profile: user.profile,
        // photo: `<img src='${user.gravatar(30)}' alt='Foto de ${user.name}'>`,
        // photo: user.profile.photo ? `<img class='rounded-circle' src='${user.photoPath}' alt='Foto de ${user.name}'>` : `<img class='rounded-circle' src='${user.gravatar(40)}' alt='Foto de ${user.name}'>`,
        photo: `<img class='rounded-circle' src='${user.photo}' alt='Foto de ${user.name}'>`,
        createdAtLocale: user.createdAtLocale,
        updatedAtLocale: user.updatedAtLocale,
        action: `<a class="btn btn-primary btn-sm mr-1" href="/user/${user.name}" target="_blank" data-toggle="tooltip" data-placement="top" title="Equipos utilizados"><i class="fa fa-desktop mr-0"></i></a>`
      };
    }
  }).then((table) => {
    res.json({
      data: table.data,
      recordsFiltered: table.totalFiltered,
      recordsTotal: table.total
    });
  });
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const user = await User.findOne({ name: id })
    .exec();
  if (!user) {
    return res.send({status: 'ERR', message: 'Not Found'});
  }
  res.send({ status: 'OK', data: user });
});


module.exports = router;
