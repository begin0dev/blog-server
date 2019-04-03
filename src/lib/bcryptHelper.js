const bcrypt = require('bcrypt');

const saltRounds = 12;

exports.generatePassword = (password) => {
  return new Promise(async (resolve, reject) => {
    // generate salt
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      resolve(hash);
    } catch (err) {
      reject(err);
    }
  });
};

exports.comparePassword = (password, hash) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await bcrypt.compare(password, hash);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};
