const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const User = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    profileImageUrl: String,
    oAuth: {
      local: {
        refreshToken: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
        expiredAt: Date,
      },
      github: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      facebook: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      google: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      kakao: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
    },
  },
  { timestamps: true },
);

User.plugin(mongooseDelete, { deletedAt: true });

User.set('toJSON', {
  transform({ _id, displayName, profileImageUrl }) {
    return {
      _id,
      displayName,
      profileImageUrl,
    };
  },
});

// static methods
User.statics.findBySocialId = function(provider, id) {
  return this.findOne({ [`oAuth.${provider}.id`]: id });
};

User.statics.findByRefreshToken = function(refreshToken) {
  return this.findOne({ 'oAuth.local.refreshToken': refreshToken });
};

User.statics.socialRegister = async function({ provider, id, displayName, profileImageUrl = '' }) {
  const user = new this({
    displayName,
    profileImageUrl,
    oAuth: { [provider]: { id } },
  });
  return user.save();
};

module.exports = mongoose.model('User', User);
