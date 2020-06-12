const express = require('express');

const { isNotLoggedIn } = require('middlewares/auth');
const socialCtrl = require('./social.ctrl');

const router = express.Router();

router.use(isNotLoggedIn);
router.use('/social', socialCtrl);

module.exports = router;
