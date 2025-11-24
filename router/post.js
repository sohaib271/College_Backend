import prisma from "../model/prisma.js";
import express from "express"
import { upload } from "../model/cloud.js";

  const removeNulls = (obj) => {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== null)
          .map(([k, v]) => [
            k,
            v !== null && typeof v === "object" && !Array.isArray(v)
              ? removeNulls(v)
              : v
          ])
      );
    };

const router=express.Router();

router.post("/create/:id",upload.array("postImage",10),async(req,res)=>{
 try {
   const postedBy=parseInt(req.params.id);
  const {title,description,tag}=req.body;

  const image=req.files?req.files.map(file => file.path):[];

  const postData=await prisma.posts.create({data:{
    title,
    tag,
    description,
    postImage:image,
    postedBy
  }});
if(!postData) return res.json({msg:"Missing fields from user"});

return res.json({msg:"Post Created!"});
 } catch (error) {
  return res.status(400).json({msg:error.message});
 }
});

router.get("/all",async(req,res)=>{
   try {
    let posts = await prisma.posts.findMany({
      include: { user: {select:{name:true,image:true,dept:true}} }
    });
    posts = posts.map((post) => removeNulls(post));
    return res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }   
});

router.get("/my-posts/:id",async(req,res)=>{
  const userId=parseInt(req.params.id);

  try {
    let posts=await prisma.posts.findMany({where:{postedBy:userId},include:{user:true}});
    posts=posts.map((post) => removeNulls(post));
    return res.json(posts)
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;