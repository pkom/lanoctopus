const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const moment = require('moment');
const dataTables = require('../helpers/mongoose-datatables');

const Schema = mongoose.Schema;

moment.locale('es');

const userLogSchema = new mongoose.Schema({
  computer: { type: Schema.Types.ObjectId, ref: 'Computer' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  action: String,
  at: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

/**
 * Return unix timestamp
 */
userLogSchema.virtual('atUNIX').get(function () {
  if (this.at != null) {
    return this.at.getTime();
  }
});
userLogSchema.virtual('atLocale').get(function () {
  if (this.at != null) {
    return moment(this.at).format('YYYY-MM-DD HH:mm:ss');
  }
});

/**
 * Return spanish action
 */
userLogSchema.virtual('actionSpanish').get(function () {
  if (this.action != null) {
    if (this.action === 'login') {
      return 'Inicio de sesión';
    }
    return 'Cierre de sesión';
  }
  return 'Not available';
});

userLogSchema.plugin(mongooseLeanVirtuals);
userLogSchema.plugin(dataTables);

const UserLog = mongoose.model('UserLog', userLogSchema, 'log_user');

module.exports = UserLog;
