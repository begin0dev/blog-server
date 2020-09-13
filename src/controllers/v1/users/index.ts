import express from 'express';

import usersCtrl from './users.ctrl';

const router = express.Router();

router.use('/', usersCtrl);

export default router;
