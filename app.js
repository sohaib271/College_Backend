import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./router/auth.js";
import postRouter from "./router/post.js";

dotenv.config();

const app=express();
app.use(cors({
  origin:"*",
  credentials:true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/college",(req,res)=>{
  res.send("This is my server");
});

app.use("/user",authRouter);
app.use("/activity",postRouter);

const Port=8000;

app.listen(Port,()=>console.log("Server Started"));