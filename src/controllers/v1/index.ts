import express from 'express';

import auth from './auth';
import users from './users';
import common from './common';

const router = express.Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/common', common);

export default router;
