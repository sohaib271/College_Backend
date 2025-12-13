import {v2 as cloudinary} from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET
});

const storage=new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:"islamia_college",
    format:async (req,file)=>"webp",
    public_id: (req,file)=> `${Date.now()}-${file.originalname}`
  }
});

const videoStorage=new CloudinaryStorage({
  cloudinary,
  params:{
    folder:"lectures",
    resource_type:"video"
  }
})
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "pdfs",
    resource_type: "raw",
    public_id: (req, file) => `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
  },
});
const uploadPDF = multer({ storage: pdfStorage });
const upload=multer({storage});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
export {cloudinary,upload,uploadVideo,uploadPDF};