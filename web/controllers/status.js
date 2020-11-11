const { promisify } = require('util');
const axios = require('axios');
const validator = require('validator');

/**
 * GET /status
 */
exports.getSystemStatus = (req, res) => {
  res.render('status/index', {
    title: 'Monitorizar',
    subtitle: 'Estado'
  });
};

