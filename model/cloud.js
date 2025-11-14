import {v2 as cloudinary} from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_secret:process.env.CLOUDINARY_API_SECRET,
  api_key:process.env.CLOUDINARY_API_KEY
});

const storage=new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:"islamia_college",
    format:async (req,file)=>"webp",
    public_id: (req,file)=> `${Date.now()}-${file.originalname}`
  }
});

const upload=multer({storage});

export {cloudinary,upload};