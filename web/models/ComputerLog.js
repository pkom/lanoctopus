const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const moment = require('moment');
const dataTables = require('../helpers/mongoose-datatables');

const Schema = mongoose.Schema;

moment.locale('es');

const computerLogSchema = new mongoose.Schema({
  computer: { type: Schema.Types.ObjectId, ref: 'Computer' },
  status: String,
  at: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

/**
 * Return unix timestamp
 */
computerLogSchema.virtual('atUNIX').get(function () {
  if (this.at != null) {
    return this.at.getTime();
  }
});
computerLogSchema.virtual('atLocale').get(function () {
  if (this.at != null) {
    return moment(this.at).format('YYYY-MM-DD HH:mm:ss');
  }
});

/**
 * Return spanish status
 */
computerLogSchema.virtual('statusSpanish').get(function () {
  if (this.status != null) {
    if (this.status === 'starting up') {
      return 'Encendido';
    }
    return 'Apagado';
  }
  return 'Not available';
});

computerLogSchema.plugin(mongooseLeanVirtuals);
computerLogSchema.plugin(dataTables);

const ComputerLog = mongoose.model('ComputerLog', computerLogSchema, 'log_computer');

module.exports = ComputerLog;
