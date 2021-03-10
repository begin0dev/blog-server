import express from 'express';

import auths from './auths';
import users from './users';
import commons from './commons';

const router = express.Router();

router.use('/auths', auths);
router.use('/users', users);
router.use('/commons', commons);

export default router;
