import { adoptionsService, petsService, usersService } from "../services/index.js"
import CustomError from '../services/errors/CustomError.js';
import EErrors from "../services/errors/enum.js";

const getAllAdoptions = async(req,res,next)=>{
    try {
        const result = await adoptionsService.getAll();
        res.send({status:"success",payload:result})
    } catch (error) {
        const dbError = CustomError.createError({
            name: "Database Connection Error",
            cause: error.message,
            message: "Error interno al intentar conectarse a la base de datos de usuarios",
            code: EErrors.DATABASE_ERROR
        });

        next(dbError);  
    }
    
}

const getAdoption = async(req,res,next)=>{
    try {
        const adoptionId = req.params.aid;
        const adoption = await adoptionsService.getBy({_id:adoptionId})

        if(!adoption) {
            CustomError.createError({
            name: "Adoption not found",
            cause: `The adoption with ID ${adoptionId} does not exist in the database`,
            message: "Adoption not found",
            code: EErrors.ROUTING_ERROR
            });
        } 
        
        res.send({status:"success",payload:adoption})
        
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({
                status: "error",
                error: "El formato del ID proporcionado es inválido"
            });
        }
        next(error);   
    }
    
}

const createAdoption = async(req,res,next)=>{
    try {

        const {uid,pid} = req.params;
        const user = await usersService.getUserById(uid);

        if(!user) {
            CustomError.createError({
            name: "User not found",
            cause: `The user with ID ${uid} does not exist in the database`,
            message: "User not found",
            code: EErrors.ROUTING_ERROR
            });
        }

        const pet = await petsService.getBy({_id:pid});

        if(!pet) {
            CustomError.createError({
            name: "Pet not found",
            cause: `The pet with ID ${pid} does not exist in the database`,
            message: "Pet not found",
            code: EErrors.ROUTING_ERROR
            });
        }

        if(pet.adopted) return res.status(400).send({status:"error",error:"Pet is already adopted"});
        user.pets.push(pet._id);
        await usersService.update(user._id,{pets:user.pets})
        await petsService.update(pet._id,{adopted:true,owner:user._id})
        await adoptionsService.create({owner:user._id,pet:pet._id})
        res.send({status:"success",message:"Pet adopted"})
        
    } catch (error) {
        next(error);    
    }

}

export default {
    createAdoption,
    getAllAdoptions,
    getAdoption
}