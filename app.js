import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./router/auth.js";

dotenv.config();

const app=express();
app.use(cors({
  origin:"*",
  credentials:true
}));

app.use(express.json());

app.get("/college",(req,res)=>{
  res.send("This is my server");
});

app.use("/user",authRouter);

const Port=8000;

app.listen(Port,()=>console.log("Server Started"));