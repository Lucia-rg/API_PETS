import { usersService } from "../services/index.js"
import CustomError from '../services/errors/CustomError.js';
import EErrors from "../services/errors/enum.js";
import UserDTO from '../dto/User.dto.js';

const getAllUsers = async(req,res,next) => {
    try {
        const users = await usersService.getAll();
        const usersDTO = users.map(user => UserDTO.getUserResponseFrom(user));
        
        res.send({ status: "success", payload: usersDTO });
    } catch (error) {
        const dbError = CustomError.createError({
            name: "Database Connection Error",
            cause: error.message,
            message: "Error interno al intentar conectarse a la base de datos de usuarios",
            code: EErrors.DATABASE_ERROR
        });

        next(dbError);
    }
};

const getUser = async (req,res,next) => {
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
        
        const userDTO = UserDTO.getUserResponseFrom(user);    
        res.send({ status: "success", payload: userDTO });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "El formato del ID proporcionado es inválido"
            });
        }
        next(error);
    }
};

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