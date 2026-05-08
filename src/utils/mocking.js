import { faker } from '@faker-js/faker';
import { createHash } from "../utils/index.js";

export const generateUser = async () => {
    const password = await createHash('coder123');
    
    return {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        password: password,
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: []
    };
};

export const generatePet = () => {
    return {
        name: faker.animal.petName(),
        specie: faker.animal.type(),
        birthDate: faker.date.past({ years: 10 }),
        adopted: false,
        image: faker.image.url({ width: 640, height: 480, category: 'animals' })
    };
};