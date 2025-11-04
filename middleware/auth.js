import { User } from "../controller/auth.js";
import prisma from "../model/prisma.js";

async function authMiddleware(req,res,next){
  try {
    const token=req.headers['authorization'].split(' ')[1];
    if(!token) return res.json({err:"Token not reached"});

    const decode=User.decodeToken(token);
    if(decode==null) return res.json({err:"Incorrect token from user"});

    const userInfo=await prisma.user.findUnique({where:{id:decode.id}});
    const cleanedUser = Object.fromEntries(
  Object.entries(userInfo).filter(([_, v]) => v !== null)
);

    req.user=cleanedUser;

    next();

  } catch (error) {
    return res.status(500).json({err:"Invalid or unavailable token"});
  }
}

export default authMiddleware;