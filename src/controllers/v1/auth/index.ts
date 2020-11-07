import express from 'express';

import { isNotLoggedIn } from '@app/middlewares/auth';
import socialController from './social.controller';

const router = express.Router();

router.use(isNotLoggedIn);
router.use('/social', socialController);

export default router;
