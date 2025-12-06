import prisma from "../model/prisma.js";
import express from "express";
import { upload } from "../model/cloud.js";

const removeNulls = (obj) => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => [
        k,
        v instanceof Date
          ? v
          : v !== null && typeof v === "object" && !Array.isArray(v)
          ? removeNulls(v)
          : v,
      ])
  );
};

const router = express.Router();

router.post("/create/:id", upload.array("postImage", 10), async (req, res) => {
  try {
    const postedBy = parseInt(req.params.id);
    const { title, description, tag } = req.body;

    const image = req.files ? req.files.map((file) => file.path) : [];

    const postData = await prisma.posts.create({
      data: {
        title,
        tag,
        description,
        postImage: image,
        postedBy,
      },
    });
    if (!postData) return res.json({ msg: "Missing fields from user" });

    return res.json({ msg: "Post Created!" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    let posts = await prisma.posts.findMany({
      include: {
        user: { select: { name: true, image: true, dept: true } },
        likes:true,
        comments:true
      },
      orderBy:{createdAt:"desc"}
    });
    posts = posts.map((post) => removeNulls(post));
    return res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-posts/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    let posts = await prisma.posts.findMany({
      where: { postedBy: userId },
      include: { user: true, likes:true,comments:true },
      orderBy: { createdAt: "desc" },
    });
    posts = posts.map((post) => removeNulls(post));
    return res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete-one/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  try {
    const delPost = await prisma.posts.delete({ where: { id: postId } });
    if (!delPost) return res.json({ msg: "Error deleting post" });

    return res.status(200).json({ msg: "Successfully deleted" });
  } catch (error) {
    return res.status(500), json({ msg: error.msg });
  }
});

router.post("/like/:id",async(req,res)=>{
  const postId=parseInt(req.params.id);
  const {likedBy}=req.body;
  const userId=parseInt(likedBy);
  try {
    const like=await prisma.likes.create({where:{postId},data:{likedBy:userId}})
    if(!like) return res.json({msg:"Error liking the post"});
    return res.status(200).json({msg:"Post Liked"});
  } catch (error) {
    return res.status(500).json({msg:error.message});
  }
});

router.post("/comment/:id",async(req,res)=>{
  const postId=parseInt(req.params.id);
  const {commentBy,content}=req.body;
  const userId=parseInt(commentBy);
  try {
    const comment=await prisma.comments.create({where:{postId},data:{content,commentBy:userId}});
    if(!comment) return res.json({msg:"Error posting message"});
    return res.status(200).json({msg:"Comment Posted"});
  } catch (error) {
    return res.status(500).json({msg:error.message});
  }
})

export default router;
