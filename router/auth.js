import express from "express";
import prisma from "../model/prisma.js";
import { User } from "../controller/auth.js";

const router=express.Router();

router.post("/register",async (req,res)=>{
  const {name,email,phoneNo,address,dept,session,password,role,batch,designation}=req.body;
  const isUser=await User.checkUser(email);

  if(isUser) return res.json({err:"Email already exists"});

  let id;

  if(role==="Student"){
    const lastStudent=await prisma.user.findFirst({where:{role:"Student"},orderBy:{id:"desc"}});

    id=lastStudent?lastStudent.id+1:300;
  }

  const hash=await User.hashPassword(password);

  const newUser=await prisma.user.create({data:{
    id,
    name,
    email,
    phoneNo,
    address,
    dept,
    session,
    password:hash,
    role,
    batch,
    designation
  }})

  if(!newUser) return res.json({err:"Error Registering User"});
  return res.status(200).json({success:"Successfully Registered"});
})


export default router;
