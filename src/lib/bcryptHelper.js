const bcrypt = require('bcrypt');

const saltRounds = 12;

exports.generatePassword = async password => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
};

exports.comparePassword = (password, hash) => bcrypt.compare(password, hash);
