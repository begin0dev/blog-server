import express from 'express';

import imagesController from './images.controller';

const router = express.Router();

router.use('/images', imagesController);

export default router;
