import express from "express";
import prisma from "../model/prisma.js";
import { User } from "../controller/auth.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../model/cloud.js";

const router=express.Router();

router.post("/register",async (req,res)=>{
  const {name,email,phoneNo,address,dept,session,password,role,batch,designation,semester,student_id,teacher_id,principal_id,admin_id,hod_id}=req.body;
  const isUser=await User.checkUser(email);

  if(isUser) return res.json({err:"Email already exists"});

  let id;

  if(role==="Student"){
    const lastStudent=await prisma.user.findFirst({where:{role:"Student"},orderBy:{id:"desc"}});

    id=lastStudent?lastStudent?.id+1:300;
  }

  const hash=await User.hashPassword(password);

  const newUser=await prisma.user.create({data:{
    id,
    name,
    email,
    student_id,
    teacher_id,
    admin_id,
    hod_id,
    principal_id,
    phoneNo,
    address,
    dept,
    session,
    password:hash,
    role,
    batch,
    designation,
    semester
  }})

  if(!newUser) return res.json({err:"Error Registering User"});
  return res.status(200).json({success:"Successfully Registered"});
});

router.post("/get-token",async(req,res)=>{
  const {email,password}=req.body;

  const token=await User.generateToken(email,password);
  if(token==null) return res.json({err:"Wrong email or password"});

  return res.json({token});

});

router.get("/get-info",authMiddleware,(req,res)=>{
  return res.status(200).json({user:req.user});
});

router.get("/all",async(req,res)=>{
  const users=await prisma.user.findMany();
  const filteredUser=users.map((m)=>{
    const cleanedUser={};

    for(const key in m){
      if(m[key]!==null){
        cleanedUser[key]=m[key];
      }
    }
    return cleanedUser;
  });

  return res.json(filteredUser);
});

router.post("/find-number",async(req,res)=>{
  const {phoneNo}=req.body;

  const user=await prisma.user.findFirst({where:{phoneNo:phoneNo}});
  if(!user.id){
    return res.status(404).json({msg:"Phone number does not exist"});
  }
  const cleanedUser=Object.fromEntries(Object.entries(user).filter(([_,v])=>v!==null));
  return res.json({cleanedUser});
})

router.patch("/update-profile/:id",upload.single("image"),async (req,res)=>{
  const userId=parseInt(req.params.id);
  const {name,password}=req.body;
  const hashedPassword=await User.hashPassword(password);

  const updateData={};

  const image=req.file?req.file.path:null;

  if(name) updateData.name=name;
  if(image) updateData.image=image;
  if(password) updateData.password=hashedPassword;
  
  if(Object.keys(updateData).length===0){
    return res.status(400).json({err:"Empty fieds from user"});
  }
  const upd=await prisma.user.update({where:{id:userId},data:updateData});

  if(upd){
    return res.status(200).json({msg:"Successfull updated"});
  }
});

export default router;
