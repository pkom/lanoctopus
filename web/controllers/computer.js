const Computer = require('../models/Computer');
const ComputerLog = require('../models/ComputerLog');
const UserLog = require('../models/UserLog');

/**
 * GET /computer
 * Computer page.
 */
exports.getComputer = (req, res) => {
  res.render('computer/index', {
    title: 'Monitorizar',
    subtitle: 'Equipos'
  });
  // try {
  //   computers = await Computer.find();
  //   res.render('computer/index', {
  //     title: 'Monitorizar',
  //     subtitle: 'Equipos',
  //   });
  // }
  // catch (err) {
  //   req.flash('errors', { msg: err.message });
  //   return res.redirect('/')
  // }
};

/**
 * GET /computerStatus
 * ComputerStatus page.
 */
exports.getComputerStatus = async (req, res) => {
  // get computer id
  const computer = await Computer.findOne({ name: req.params.computer });
  if (!computer) {
    req.flash('errors', { msg: `No se ha encontrado ordenador ${req.params.computer}` });
    return res.redirect('/computer')
  }
  const computerLog = await ComputerLog.find({ computer: computer._id }).sort({ at: -1 }).lean({ virtuals: true });;
  res.render('computer/status', {
    title: 'Monitorizar',
    subtitle: 'Equipo-Estados',
    computer,
    computerLog
  });
};

/**
 * GET /computerUser
 * ComputerUser page.
 */
exports.getComputerUser = async (req, res) => {
  // get computer id
  const computer = await Computer.findOne({ name: req.params.computer });
  if (!computer) {
    req.flash('errors', { msg: `No se ha encontrado ordenador ${req.params.computer}` });
    return res.redirect('/computer')
  }
  const userLog = await UserLog.find({ computer: computer._id }).sort({ at: -1 }).populate('user');
  res.render('computer/user', {
    title: 'Monitorizar',
    subtitle: 'Equipo-Usuarios',
    computer,
    userLog
  });
};


exports.getComputerCallback = (req, res) => {
  Computer.find((err, computers) => {
    if (!err) {
      res.render('computer/index', {
        title: 'Monitorize',
        subtitle: 'Computers',
        computers: computers
      });
    }
    else {
      req.flash('errors', { msg: 'Something went wrong accessing database' });
      return res.redirect('/')
    }
  }).sort({ name: 1 });
};
