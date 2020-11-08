import express, { Request, Response, Express } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { apiDoc } from '@app/lib/helpers/apidoc-helper';
import { Status } from '@app/types/base';

const router = express.Router();

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: 'begin0dev-static',
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images',
    format: 'png',
  },
});
const uploader = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2 },
});

router.post('/', apiDoc({ summary: '이미지 등록 api' }), uploader.array('images', 3), (req: Request, res: Response) => {
  res
    .status(200)
    .json({
      status: Status.SUCCESS,
      data: { imageUrls: (<Express.Multer.File[]>req.files).map((file) => file.path) },
    });
});

export default router;
