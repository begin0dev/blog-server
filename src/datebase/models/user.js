const mongoose = require('mongoose');
const { generatePassword } = require('lib/bcryptHelper');

const User = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  password: String,
  commonProfile: {
    displayName: String,
  },
  oAuth: {
    local: {
      refreshToken: {
        type: String,
        unique: true,
        index: true,
      },
      expiredAt: Date,
    },
    github: {
      id: {
        type: String,
        unique: true,
        index: true,
      },
    },
    facebook: {
      id: {
        type: String,
        unique: true,
        index: true,
      },
    },
    google: {
      id: {
        type: String,
        unique: true,
        index: true,
      },
    },
    kakao: {
      id: {
        type: String,
        unique: true,
        index: true,
      },
    },
  },
}, { timestamps: true });

User.set('toJSON', {
  transform(doc) {
    return {
      _id: doc._id,
      email: doc.email,
      commonProfile: {
        displayName: doc.commonProfile.displayName,
      },
    };
  },
});

// static methods
User.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email });
};

User.statics.findBySocialId = function findBySocialId(provider, id) {
  return this.findOne({
    [`oAuth.${provider}.id`]: id,
  });
};

User.statics.findByLocalRefreshToken = function findByLocalRefreshToken(refreshToken) {
  return this.findOne({ 'oAuth.local.refreshToken': refreshToken });
};

User.statics.localRegister = async function localRegister({ email, password, displayName }) {
  // generate password
  const hashPassword = await generatePassword(password);
  const user = new this({
    email,
    password: hashPassword,
    commonProfile: {
      displayName,
    },
  });
  return user.save();
};

User.statics.socialRegister = async function socialRegister({ provider, id, email, displayName }) {
  const user = new this({
    email,
    commonProfile: {
      displayName,
    },
    oAuth: {
      [provider]: {
        id,
      },
    },
  });
  return user.save();
};

module.exports = mongoose.model('User', User);
