import express from 'express';

import imagesController from './images.controller';

const router = express.Router();

router.use('/', imagesController);

export default router;
