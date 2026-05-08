import { usersService } from "../services/index.js"
import CustomError from '../services/errors/CustomError.js';
import EErrors from "../services/errors/enum.js";

const getAllUsers = async(req,res)=>{
    const users = await usersService.getAll();
    res.send({status:"success",payload:users})
}

const getUser = async(req,res,next)=> {
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) {
            CustomError.createError({
            name: "User not found",
            cause: `The user with ID ${userId} does not exist in the database`,
            message: "User not found",
            code: EErrors.ROUTING_ERROR
            });
        }
        res.send({status:"success",payload:user})     
    } catch (error) {
        next(error);
    }
}

const updateUser =async(req,res,next)=>{
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) {
            CustomError.createError({
            name: "User update error",
            cause: `The user with ID ${userId} does not exist in the database`,
            message: "Error updating user",
            code: EErrors.ROUTING_ERROR
            });
        }
        const result = await usersService.update(userId,updateBody);
        res.send({status:"success",message:"User updated"})    
    } catch (error) {
        next(error); 
    }
}

const deleteUser = async(req,res,next) =>{
    try {
        const userId = req.params.uid;
        const user = await usersService.getUserById(userId);
        if(!user) {
                CustomError.createError({
                name: "User update error",
                cause: `The user with ID ${userId} does not exist in the database`,
                message: "Error updating user",
                code: EErrors.ROUTING_ERROR
                });
            }
        const result = await usersService.delete(userId);
        res.send({status:"success",message:"User deleted"})  
    } catch (error) {
        next(error); 
    }  
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}