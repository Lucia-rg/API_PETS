import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../src/app.js';
import userModel from '../../src/dao/models/User.js';
import petModel from '../../src/dao/models/Pet.js';
import adoptionModel from '../../src/dao/models/Adoption.js';

const requester = supertest(app);

describe('Testing del Router de Adoptions (/api/adoptions)', function () {

    let testUserId = '';
    let testAvailablePetId = '';
    let testAdoptedPetId = '';
    let testAdoptionId = '';
    const fakeObjectId = '64b1f2e3c9e8a1b2c3d4e5f6';

    before(async function () {
        
        await userModel.deleteMany({});
        await petModel.deleteMany({});
        await adoptionModel.deleteMany({});

        const mockUser = await userModel.create({
            first_name: 'Adoptante',
            last_name: 'Test',
            email: 'adoptante@correo.com',
            password: 'hashedpassword',
            role: 'user',
            pets: []
        });
        testUserId = mockUser._id.toString();

        const mockAvailablePet = await petModel.create({
            name: 'Filius',
            specie: 'Dog',
            birthDate: '2022-01-01',
            adopted: false
        });
        testAvailablePetId = mockAvailablePet._id.toString();

        const mockAdoptedPet = await petModel.create({
            name: 'Gato adoptado',
            specie: 'Cat',
            birthDate: '2021-05-10',
            adopted: true,
            owner: testUserId
        });
        testAdoptedPetId = mockAdoptedPet._id.toString();

        const mockAdoption = await adoptionModel.create({
            owner: testUserId,
            pet: testAdoptedPetId
        });
        testAdoptionId = mockAdoption._id.toString();
        
        mockUser.pets.push(mockAdoptedPet._id);
        await mockUser.save();
    });

    it('1. GET /api/adoptions - Debe retornar todas las adopciones registradas', async function () {
        const response = await requester.get('/api/adoptions');

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('array');
        expect(response.body.payload.length).to.be.greaterThan(0);
    });

    it('2. GET /api/adoptions/:aid - Debe retornar una adopción específica por su ID', async function () {
        const response = await requester.get(`/api/adoptions/${testAdoptionId}`);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('object');
        expect(response.body.payload._id).to.equal(testAdoptionId);
    });

    it('3. GET /api/adoptions/:aid - Debe retornar error 404 si la adopción no existe', async function () {
        const response = await requester.get(`/api/adoptions/${fakeObjectId}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Adoption not found');
    });

    it('4. POST /api/adoptions/:uid/:pid - Debe retornar error 404 si el usuario no existe', async function () {
        const response = await requester.post(`/api/adoptions/${fakeObjectId}/${testAvailablePetId}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('User not found');
    });

    it('5. POST /api/adoptions/:uid/:pid - Debe retornar error 404 si la mascota no existe', async function () {
        const response = await requester.post(`/api/adoptions/${testUserId}/${fakeObjectId}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Pet not found');
    });

    it('6. POST /api/adoptions/:uid/:pid - Debe retornar error 400 si la mascota ya está adoptada', async function () {

        const response = await requester.post(`/api/adoptions/${testUserId}/${testAdoptedPetId}`);

        expect(response.statusCode).to.equal(400);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('Pet is already adopted');
    });

    it('7. POST /api/adoptions/:uid/:pid - Debe procesar la adopción exitosamente con datos correctos', async function () {

        const response = await requester.post(`/api/adoptions/${testUserId}/${testAvailablePetId}`);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('Pet adopted');

        const updatedPet = await petModel.findById(testAvailablePetId);
        expect(updatedPet.adopted).to.be.true;
        expect(updatedPet.owner.toString()).to.equal(testUserId);

        const updatedUser = await userModel.findById(testUserId);
        
        const petExistsInUser = updatedUser.pets.some(p => {
            const idToCompare = p._id ? p._id.toString() : p.toString();
            return idToCompare === testAvailablePetId;
        });

        expect(petExistsInUser).to.be.true;
    });

    it('8. GET /api/adoptions/:aid - Debe devolver error si el formato del ID de adopción es inválido (CastError)', async function () {
        const invalidFormatId = '12345';
        const response = await requester.get(`/api/adoptions/${invalidFormatId}`);

        expect(response.statusCode).to.be.oneOf([400, 404, 500]);
        expect(response.body.status).to.equal('error');
    });

    it('9. POST /api/adoptions/:uid/:pid - Debe devolver error si el formato del ID de usuario es inválido', async function () {
        const invalidUid = 'usuario-invalido';
        const response = await requester.post(`/api/adoptions/${invalidUid}/${testAvailablePetId}`);

        expect(response.statusCode).to.be.oneOf([400, 404, 500]);
        expect(response.body.status).to.equal('error');
    });

    it('10. POST /api/adoptions/:uid/:pid - Debe devolver error si el formato del ID de la mascota es inválido', async function () {
        const invalidPid = 'mascota-invalida';
        const response = await requester.post(`/api/adoptions/${testUserId}/${invalidPid}`);

        expect(response.statusCode).to.be.oneOf([400, 404, 500]);
        expect(response.body.status).to.equal('error');
    });

});