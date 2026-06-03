import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../src/app.js';
import petModel from '../../src/dao/models/Pet.js';

const requester = supertest(app);

describe('Testing del router de Pets (/api/pets)', function() {
    let testPetId = '';
    before(async function () {
        await petModel.deleteMany({});
    });

    it('1. GET /api/pets - Debe retornar un arreglo de mascotas y status 200', async function () {
        const response = await requester.get('/api/pets');
        
        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('array');
    });

    it('2. POST /api/pets - Debe crear una mascota correctamente con datos válidos', async function () {
        const mockPet = {
            name: 'Filius',
            specie: 'Dog',
            birthDate: '2020-01-01'
        };

        const response = await requester.post('/api/pets').send(mockPet);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        
        expect(response.body.payload).to.have.property('_id');
        expect(response.body.payload.name).to.equal(mockPet.name);
        expect(response.body.payload.adopted).to.be.false;

        testPetId = response.body.payload._id;
    });

    it('3. POST /api/pets - Debe devolver error si faltan datos obligatorios (Validación)', async function () {
        const invalidPet = {
            name: 'Mascota Incompleta'
        };

        const response = await requester.post('/api/pets').send(invalidPet);
        expect(response.statusCode).to.be.oneOf([400, 500]); 
        expect(response.body.status).to.equal('error');
    });

    it('4. PUT /api/pets/:pid - Debe actualizar una mascota existente', async function () {
        const updateData = {
            name: 'Filius actualizado'
        };

        const response = await requester.put(`/api/pets/${testPetId}`).send(updateData);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('pet updated');

        const petInDb = await petModel.findById(testPetId);
        expect(petInDb.name).to.equal(updateData.name);
    });

    it('5. DELETE /api/pets/:pid - Debe eliminar una mascota por ID', async function () {
        const response = await requester.delete(`/api/pets/${testPetId}`);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('pet deleted');

        const deletedPet = await petModel.findById(testPetId);
        expect(deletedPet).to.be.null;
    });

    it('6. POST /api/pets/withimage - Debe crear una mascota cargando una imagen', async function () {
        const testImagePath = './src/public/img/imagenprueba.jpg';

        const response = await requester.post('/api/pets/withimage')
            .field('name', 'Filius') 
            .field('specie', 'Dog')
            .field('birthDate', '2021-04-15')
            .attach('image', testImagePath);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.have.property('_id');
        expect(response.body.payload.image).to.be.a('string'); 
        expect(response.body.payload.image).to.include('imagenprueba.jpg');
    });

});

