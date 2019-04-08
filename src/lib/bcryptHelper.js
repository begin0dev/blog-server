const bcrypt = require('bcrypt');

const saltRounds = 12;

exports.generatePassword = async (password) => {
  try {
    // generate salt
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    throw new Error(err);
  }
};

exports.comparePassword = (password, hash) => bcrypt.compare(password, hash);
