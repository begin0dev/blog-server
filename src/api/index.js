const express = require('express');
const v1 = require('./v1.0');

const versions = {
  '1.0': v1,
};

const router = express.Router();

router.use('/v1.0', versions['1.0']);

module.exports = router;
