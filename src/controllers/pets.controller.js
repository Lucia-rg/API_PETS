import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

import CustomError from '../services/errors/CustomError.js';
import EErrors from "../services/errors/enum.js";
import { generatePetErrorInfo } from '../services/errors/info.js';

const getAllPets = async (req, res, next) => {
    try {
        const pets = await petsService.getAll();
        res.send({ status: "success", payload: pets });
    } catch (error) {
        next(error);
    }
}

const createPet = async (req, res, next) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            CustomError.createError({
                name: "Pet creation error",
                cause: generatePetErrorInfo({name, specie, birthDate}),
                message: "Error attempting to create pet",
                code: EErrors.INVALID_TYPES_ERROR
            });
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        res.send({ status: "success", payload: result });
    } catch (error) {
        next(error);
    }
}

const updatePet = async (req, res, next) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        const result = await petsService.update(petId, petUpdateBody);
        
        if (!result) return res.status(404).send({ status: "error", error: "Pet not found" });
        
        res.send({ status: "success", message: "pet updated" });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ status: "error", error: "Invalid pet ID format" });
        }
        next(error);
    }
}

const deletePet = async (req, res, next) => {
    try {
        const petId = req.params.pid;
        const result = await petsService.delete(petId);
        
        if (!result) return res.status(404).send({ status: "error", error: "Pet not found" });
        
        res.send({ status: "success", message: "pet deleted" });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ status: "error", error: "Invalid pet ID format" });
        }
        next(error);
    }
}

const createPetWithImage = async (req, res, next) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;
        
        if (!name || !specie || !birthDate) {
            CustomError.createError({
                name: "Pet creation error",
                cause: generatePetErrorInfo({name, specie, birthDate}),
                message: "Error attempting to create pet",
                code: EErrors.INVALID_TYPES_ERROR
            });
        }
        
        if (req.logger) req.logger.info(file);
        
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `${__dirname}/../public/img/${file.filename}`
        });
        
        if (req.logger) req.logger.info(pet);
        const result = await petsService.create(pet);
        res.send({ status: "success", payload: result });
    } catch (error) {
        next(error);
    }
}

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}