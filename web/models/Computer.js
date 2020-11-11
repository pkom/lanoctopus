const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const moment = require('moment');
const dataTables = require('../helpers/mongoose-datatables');

moment.locale('es');

const computerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  online: Boolean,
  lastInfoDatetime: Date,
  systemInfo: {
    system: String,
    node: String,
    facters: {
      uso: String,
      usuario: String,
      tipo: String,
      sistema: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

/**
 * Return unix timestamp
 */
computerSchema.virtual('createdAtUNIX').get(function () {
  if (this.createdAt != null) {
    return this.createdAt.getTime();
  }
});
computerSchema.virtual('updatedAtUNIX').get(function () {
  if (this.updatedAt != null) {
    return this.updatedAt.getTime();
  }
});
computerSchema.virtual('lastInfoDatetimeUNIX').get(function () {
  if (this.lastInfoDatetime != null) {
    return this.lastInfoDatetime.getTime();
  }
});
computerSchema.virtual('createdAtLocale').get(function () {
  if (this.createdAt != null) {
    return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
  }
});
computerSchema.virtual('updatedAtLocale').get(function () {
  if (this.updatedAt != null) {
    return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss');
  }
});
computerSchema.virtual('lastInfoDatetimeLocale').get(function () {
  if (this.lastInfoDatetime != null) {
    return moment(this.lastInfoDatetime).format('YYYY-MM-DD HH:mm:ss');
  }
});
computerSchema.virtual('lastInfoDatetimeFrom').get(function () {
  if (this.lastInfoDatetime != null) {
    return moment(this.lastInfoDatetime).fromNow();
  }
  return 'Not available';
});


/**
 * Return uso, tipo, usuario and sistema from facter
 */
computerSchema.virtual('type').get(function () {
  if (this.systemInfo != null && this.systemInfo.facters != null
    && this.systemInfo.facters.tipo != null) {
    return this.systemInfo.facters.tipo;
  }
  return 'Not available';
});
computerSchema.virtual('use').get(function () {
  if (this.systemInfo != null && this.systemInfo.facters != null
    && this.systemInfo.facters.uso != null) {
    return this.systemInfo.facters.uso;
  }
  return 'Not available';
});
computerSchema.virtual('user').get(function () {
  if (this.systemInfo != null && this.systemInfo.facters != null
    && this.systemInfo.facters.usuario != null) {
    return this.systemInfo.facters.usuario;
  }
  return 'Not available';
});
computerSchema.virtual('system').get(function () {
  if (this.systemInfo != null && this.systemInfo.facters != null
    && this.systemInfo.facters.sistema != null) {
    return this.systemInfo.facters.sistema;
  }
  return 'Not available';
});

/**
 * Return Online Offline
 */
computerSchema.virtual('status').get(function () {
  if (this.online != null) {
    if (this.online) {
      return 'Online';
    }
    return 'Offline';
  }
  return 'Not available';
});

computerSchema.plugin(mongooseLeanVirtuals);
computerSchema.plugin(dataTables);

const Computer = mongoose.model('Computer', computerSchema, 'computer');

module.exports = Computer;
