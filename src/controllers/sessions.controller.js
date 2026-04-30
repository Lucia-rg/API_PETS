import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

import CustomError from '../services/errors/CustomError.js';
import EErrors from "../services/errors/enum.js";
import { generateUserErrorInfo } from '../services/errors/info.js';

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            CustomError.createError({
                name: "User creation error",
                cause: generateUserErrorInfo({first_name, last_name, email}),
                message: "Error attempting to register user",
                code: EErrors.INVALID_TYPES_ERROR
            });
        }

        const exists = await usersService.getUserByEmail(email);
        if (exists) return res.status(400).send({ status: "error", error: "User already exists" });
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        let result = await usersService.create(user);
        console.log(result);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            CustomError.createError({
                    name: "Login error",
                    cause: `Missing required fields: 
                    * email
                    * password`,
                    message: "Incomplete values for login",
                    code: EErrors.INVALID_TYPES_ERROR
            });
        }
        
        const user = await usersService.getUserByEmail(email);
        if(!user) {
            CustomError.createError({
                    name: "Auth error",
                    cause: `No user found registered with the email ${email}`,
                    message: "Invalid credentials",
                    code: EErrors.AUTH_ERROR
            });
        }
        
        const isValidPassword = await passwordValidation(user,password);
        if(!isValidPassword) {
            CustomError.createError({
                    name: "Auth error",
                    cause: `Incorrect password`,
                    message: "Invalid credentials",
                    code: EErrors.AUTH_ERROR
            });
        }
        
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto,'tokenSecretJWT',{expiresIn:"1h"});
        res.cookie('coderCookie',token,{maxAge:3600000}).send({status:"success",message:"Logged in"})
        
    } catch (error) {
        next(error);   
    }

}

const current = async(req,res) =>{
    const cookie = req.cookies['coderCookie']
    const user = jwt.verify(cookie,'tokenSecretJWT');
    if(user)
        return res.send({status:"success",payload:user})
}

const unprotectedLogin  = async(req,res) =>{
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
    const isValidPassword = await passwordValidation(user,password);
    if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
    const token = jwt.sign(user,'tokenSecretJWT',{expiresIn:"1h"});
    res.cookie('unprotectedCookie',token,{maxAge:3600000}).send({status:"success",message:"Unprotected Logged in"})
}
const unprotectedCurrent = async(req,res)=>{
    const cookie = req.cookies['unprotectedCookie']
    const user = jwt.verify(cookie,'tokenSecretJWT');
    if(user)
        return res.send({status:"success",payload:user})
}
export default {
    current,
    login,
    register,
    current,
    unprotectedLogin,
    unprotectedCurrent
}