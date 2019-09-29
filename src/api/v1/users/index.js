const express = require('express');

const usersCtrl = require('./users.ctrl');

const router = express.Router();

router.use('/', usersCtrl);

module.exports = router;
