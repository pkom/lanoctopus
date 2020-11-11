const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const moment = require('moment');
const dataTables = require('../helpers/mongoose-datatables');

moment.locale('es');

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  email: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: Boolean,
  online: Boolean,

  profile: {
    fullName: String,
    employeeNumber: String,
    firstName: String,
    lastName: String,
    gender: String,
    location: String,
    website: String,
    photoType: String,
    photo: Buffer
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

/**
 * Embedded picture
 */
userSchema.virtual('photoPath').get(function() {
  if (this.profile.photo != null && this.profile.photoType != null) {
    return `data:${this.profile.photoType};charset=utf-8;base64,${this.profile.photo.toString('base64')}`
  }
});

/**
 * Full Name Reversed
 */
userSchema.virtual('fullNameRev').get(function() {
  // if (this.profile.lastName != null && this.profile.firstName != null) {
  //   return `${this.profile.lastName}, ${this.profile.firstName}`
  // }
  return (this.profile.lastName && this.profile.firstName) ? `${this.profile.lastName}, ${this.profile.firstName} (${this.name})` : this.name
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for get datetimes.
 */
userSchema.virtual('createdAtUNIX').get(function () {
  if (this.createdAt != null) {
    return this.createdAt.getTime();
  }
});
userSchema.virtual('updatedAtUNIX').get(function () {
  if (this.updatedAt != null) {
    return this.updatedAt.getTime();
  }
});
userSchema.virtual('createdAtLocale').get(function () {
  if (this.createdAt != null) {
    return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
  }
});
userSchema.virtual('updatedAtLocale').get(function () {
  if (this.updatedAt != null) {
    return moment(this.updatedAt).format('YYYY-MM-DD HH:mm:ss');
  }
});

/**
 * Helper method for get user photo.
 * 
 */
userSchema.virtual('photo').get(function () {
  if (this.profile.photo) {
    return this.photoPath
  } else {
    return this.gravatar(40)
  }
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=mp&s=30`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

userSchema.plugin(mongooseLeanVirtuals);
userSchema.plugin(dataTables);

const User = mongoose.model('User', userSchema, 'user');

module.exports = User;
