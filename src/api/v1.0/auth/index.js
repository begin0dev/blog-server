const express = require('express');

const localCtrl = require('./local.ctrl');
const socialCtrl = require('./social.ctrl');

const router = express.Router();

router.use('/local', localCtrl);
router.use('/social', socialCtrl);

module.exports = router;
