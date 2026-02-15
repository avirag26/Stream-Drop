import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, S3_CONFIG } from '../config/s3.config';
import path from 'path';


const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_CONFIG.bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const userId = (req as any).user?.id || 'unknown';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `profile-photos/${userId}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {

    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

export const uploadProfilePhoto = upload.single('photo');
