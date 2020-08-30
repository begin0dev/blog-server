import express from 'express';

import { isNotLoggedIn } from '@app/middlewares/auth';
import socialCtrl from './social.ctrl';

const router = express.Router();

router.use(isNotLoggedIn);
router.use('/social', socialCtrl);

export = router;
