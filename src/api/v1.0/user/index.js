const express = require('express');

const userCtrl = require('./user.ctrl');

const router = express.Router();

router.use('/', userCtrl);

module.exports = router;
