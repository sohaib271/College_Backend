import jwt from "jsonwebtoken";
import prisma from "../model/prisma.js";
import bcrypt from "bcrypt";

class Auth{

  async hashPassword(password){
    return bcrypt.hash(password,10);
  }

  async checkUser(email){
    return await prisma.user.findUnique({where:{email}});
  }

  async findUser(email,password){
    const user=await this.checkUser(email);
    const checkPass=await bcrypt.compare(password,user.password);
    if(!checkPass || !user) return null;

    return user;
  }

  async generateToken(email,password){
    const user=await this.findUser(email,password);

    if(user==null) return null;

    const token=jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRY});
    return token;
  }


  decodeToken(token){
    try {
      return jwt.verify(token,process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export const User=new Auth();