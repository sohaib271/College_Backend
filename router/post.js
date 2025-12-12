import prisma from "../model/prisma.js";
import express from "express";
import { upload, uploadVideo, uploadPDF } from "../model/cloud.js";

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

const multiUploadOptional = (req, res, next) => {
  upload.array("postImage", 10)(req, res, (err) => {
    if (err) return res.status(400).json({ msg: err.message });

    uploadVideo.single("lecture")(req, res, (err) => {
      if (err) return res.status(400).json({ msg: err.message });

      uploadPDF.single("pdfFile")(req, res, (err) => {
        if (err) return res.status(400).json({ msg: err.message });

        next();
      });
    });
  });
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
        likes: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
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
      include: { user: true, likes: true, comments: true },
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

router.post("/like/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  const { likedBy } = req.body;
  const userId = Number(likedBy);
  try {
    const like = await prisma.likes.create({
      data: { likedBy: userId, postId },
    });
    if (!like) return res.json({ msg: "Error liking the post" });
    return res.status(200).json({ msg: "Post Liked" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/comment/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  const { commentBy, content } = req.body;
  const userId = Number(commentBy);
  try {
    const comment = await prisma.comments.create({
      data: { content, commentBy: userId, postId },
    });
    if (!comment) return res.json({ msg: "Error posting message" });
    return res.status(200).json({ msg: "Comment Posted" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.get("/comments/show/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  const com = await prisma.comments.findMany({
    where: { postId },
    include: { user: { select: { name: true, image: true, dept: true } } },
  });

  if (!com) return res.json({ msg: "Error retrieving comments" });

  return res.json({ com });
});

router.get("/likes/detail/:id", async (req, res) => {
  const postId = parseInt(req.params.id);
  const like = await prisma.likes.findMany({
    where: { postId },
    include: { user: { select: { name: true, image: true } } },
  });

  if (!like) return res.json({ msg: "Error showing detail" });

  return res.json({ like });
});

router.post("/upload-lectures/:id", multiUploadOptional, async (req, res) => {
  try {
    const postedBy = parseInt(req.params.id);
    const { title, description } = req.body;
    const images = req.files?.postImage
      ? req.files.postImage.map((file) => file.path)
      : [];

    const video =
      req.file?.path ||
      (req.files?.lecture && req.files.lecture[0]?.path) ||
      null;

    const pdfFile =
      req.file?.path ||
      (req.files?.pdfFile && req.files.pdfFile[0]?.path) ||
      null;

    const postData = await prisma.posts.create({
      data: {
        title,
        description,
        postImage: images,
        postedBy,
        video,
        file: pdfFile,
      },
    });
    if (!postData) return res.json({ msg: "Missing fields from user" });

    return res.json({ msg: "Lecture Uploaded!" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.get("/get-lectures/all", async (req, res) => {
  try {
    let posts = await prisma.posts.findMany({
      where: { video: { not: null } },
      include: {
        user: { select: { name: true, image: true, dept: true } },
        likes: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    posts = posts.map((post) => removeNulls(post));
    return res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-lectures/:id", async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    let posts = await prisma.posts.findMany({
      where: { AND: [{ video: { not: null } }, { postedBy: userId }] },
      include: { user: true, likes: true, comments: true },
      orderBy: { createdAt: "desc" },
    });
    posts = posts.map((post) => removeNulls(post));
    return res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
