const User = require('../models/User');
const UserLog = require('../models/UserLog');

/**
 * GET /user
 * User page.
 */
exports.getUser = (req, res) => {
  res.render('user/index', {
    title: 'Monitorizar',
    subtitle: 'Usuarios'
  });
  // try {
  //   users = await User.find();
  //   res.render('user/index', {
  //     title: 'Monitorizar',
  //     subtitle: 'Usuarios',
  //     users: users
  //   });
  // }
  // catch (err) {
  //   req.flash('errors', { msg: err.message });
  //   return res.redirect('/')
  // }
};

/**
 * GET /UserComputer
 * UserComputer page.
 */
exports.getUserComputer = async (req, res) => {
  // get user id
  const user = await User.findOne({ name: req.params.user });
  if (!user) {
    req.flash('errors', { msg: `No se ha encontrado usuario ${req.params.user}` });
    return res.redirect('/user')
  }
  const userLog = await UserLog.find({ user: user._id }).sort({ at: -1 }).populate('user').populate('computer');
  res.render('user/status', {
    title: 'Monitorizar',
    subtitle: 'Usuario-Equipos',
    usr: user,
    userLog
  });
};