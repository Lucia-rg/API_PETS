import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../src/app.js';
import userModel from '../../src/dao/models/User.js';

const requester = supertest(app);

describe('Testing del Router de Users (/api/users)', function () {
    let testUserId = '';

    before(async function () {
        await userModel.deleteMany({});
        
        const mockUser = await userModel.create({
            first_name: 'Usuario',
            last_name: 'Prueba',
            email: 'test@correo.com',
            password: 'hashedpassword123',
            role: 'user',
            pets: []
        });

        testUserId = mockUser._id.toString();
    });

    it('1. GET /api/users - Debe retornar un arreglo de usuarios y status 200', async function () {
        const response = await requester.get('/api/users');
        
        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('array');
        
        expect(response.body.payload.length).to.be.greaterThan(0);
        
        const firstUser = response.body.payload[0];
        expect(firstUser).to.not.have.property('password');
    });

    it('2. GET /api/users/:uid - Debe retornar un usuario específico por su ID', async function () {
        const response = await requester.get(`/api/users/${testUserId}`);
        
        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.be.an('object');

        expect(response.body.payload.email).to.equal('test@correo.com');
        expect(response.body.payload._id).to.equal(testUserId);
    });

    it('3. PUT /api/users/:uid - Debe actualizar los datos de un usuario', async function () {
        const updateData = {
            first_name: 'Nombre Actualizado',
            role: 'admin'
        };

        const response = await requester.put(`/api/users/${testUserId}`).send(updateData);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('User updated');

        const userInDb = await userModel.findById(testUserId);
        expect(userInDb.first_name).to.equal(updateData.first_name);
        expect(userInDb.role).to.equal(updateData.role);
    });

    it('4. DELETE /api/users/:uid - Debe eliminar un usuario del sistema', async function () {
        const response = await requester.delete(`/api/users/${testUserId}`);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('User deleted');

        const deletedUser = await userModel.findById(testUserId);
        expect(deletedUser).to.be.null;
    });

    it('5. GET /api/users/:uid - Debe devolver error si el formato del ID es inválido (CastError)', async function () {
        const invalidFormatId = '12345';
        
        const response = await requester.get(`/api/users/${invalidFormatId}`);

        expect(response.statusCode).to.be.oneOf([400, 500]);
        expect(response.body.status).to.equal('error');
    });

    it('6. GET /api/users/:uid - Debe devolver error 404 si el ID tiene formato válido pero no existe en la BD', async function () {
        const nonExistentId = '64b1f2e3c9e8a1b2c3d4e5f6';
        
        const response = await requester.get(`/api/users/${nonExistentId}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('User not found');
    });

});