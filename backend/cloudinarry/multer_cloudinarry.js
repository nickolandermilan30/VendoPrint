// import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import pkg from 'cloudinary';
// import dotenv from 'dotenv';
// const { v2: cloudinary } = pkg;

// dotenv.config();

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: 'dxgepee4v',
//   api_key: '787166788257487',
//   api_secret: 'STtAX5LPdDOOOJzaTLiOrXw9l2A',
// });

// // Configure Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'VendoPrint', 
//     resource_type: 'Auto',
//     allowedFormats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
//   },
// });

// const upload = multer({ storage: storage });

// export default upload;