const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cricket_players',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        format: 'webp',
        transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:low' },
            { fetch_format: 'auto' }
        ]
    }
});

const upload = multer({
    storage: storage,
    limits: {

        fileSize: 100 * 1024 // STRICT LIMIT: 100KB. 
    }
});

module.exports = { cloudinary, upload };
