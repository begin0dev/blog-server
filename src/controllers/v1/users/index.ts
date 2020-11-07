import express from 'express';

import usersController from './users.controller';

const router = express.Router();

router.use('/', usersController);

export default router;
