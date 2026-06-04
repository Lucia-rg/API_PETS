import { expect } from 'chai';
import supertest from 'supertest';
import app from '../../src/app.js';
import userModel from '../../src/dao/models/User.js';

const requester = supertest(app);

describe('Testing del Router de Sessions (/api/sessions)', function () {

    const mockUser = {
        first_name: 'Nombre',
        last_name: 'Apellido',
        email: 'nombre.apellido@correo.com',
        password: 'PasswordSeguro123'
    };

    let authCookie = '';

    before(async function () {
        await userModel.deleteMany({});
    });

    it('1. POST /api/sessions/register - Debe registrar un usuario exitosamente, hashear la contraseña y tener el rol "user" por defecto', async function () {
        const response = await requester.post('/api/sessions/register').send(mockUser);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body).to.have.property('payload');

        const userInDb = await userModel.findOne({ email: mockUser.email });
        
        expect(userInDb).to.not.be.null;
        expect(userInDb.password).to.not.equal(mockUser.password);
        expect(userInDb.role).to.equal('user');
        expect(userInDb.password.startsWith('$2')).to.be.true; 
    });

    it('2. POST /api/sessions/register - Debe impedir crear dos usuarios con el mismo email (duplicado)', async function () {

        const response = await requester.post('/api/sessions/register').send(mockUser);

        expect(response.statusCode).to.equal(400);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.equal('User already exists');
    });

    it('3. POST /api/sessions/register - Debe devolver error si faltan campos obligatorios', async function () {
  
        const incompleteUser = {
            first_name: 'Incompleto',
            email: 'incompleto@correo.com'
        };

        const response = await requester.post('/api/sessions/register').send(incompleteUser);

        expect(response.statusCode).to.equal(400);
    });

    it('4. POST /api/sessions/login - Debe iniciar sesión y devolver una cookie (coderCookie)', async function () {

        const loginCredentials = {
            email: mockUser.email,
            password: mockUser.password
        };

        const response = await requester.post('/api/sessions/login').send(loginCredentials);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('Logged in');

        const cookies = response.headers['set-cookie'];
        expect(cookies).to.exist;

        const coderCookie = cookies.find(cookie => cookie.startsWith('coderCookie='));
        expect(coderCookie).to.exist;

        authCookie = coderCookie;
    });

    it('5. POST /api/sessions/login - Debe devolver error con credenciales inválidas', async function () {

        const invalidCredentials = {
            email: mockUser.email,
            password: 'PasswordIncorrecto123'
        };

        const response = await requester.post('/api/sessions/login').send(invalidCredentials);

        expect(response.statusCode).to.equal(401);
        expect(response.body.status).to.equal('error');
    });

    it('6. POST /api/sessions/login - Debe devolver error si el body está incompleto (falta password) ', async function () {

        const incompleteBody = {
            email: mockUser.email
        }

        const response = await requester.post('/api/sessions/login').send(incompleteBody);

        expect(response.statusCode).to.equal(400);
        expect(response.body.status).to.equal('error');
    });

    it('7. POST /api/sessions/login - Debe devolver error si el body está incompleto (falta email) ', async function () {

        const incompleteBody = {
            password: mockUser.password
        }

        const response = await requester.post('/api/sessions/login').send(incompleteBody);

        expect(response.statusCode).to.equal(400);
        expect(response.body.status).to.equal('error');
    });

    it('8. GET /api/sessions/current - Debe leer la cookie y devolver al usuario logueado', async function () {

        const response = await requester.get('/api/sessions/current')
            .set('Cookie', authCookie);

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.payload).to.have.property('email');
        expect(response.body.payload.email).to.equal(mockUser.email);
    });

    it('9. GET /api/sessions/current - Debe fallar si no se envía la cookie de sesión', async function () {
        
        const response = await requester.get('/api/sessions/current');

        expect(response.statusCode).to.equal(401);
    });

    it('10. GET /api/sessions/logout - Debe limpiar la cookie y cerrar sesión', async function () {
        const response = await requester.get('/api/sessions/logout');

        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('success');
        expect(response.body.message).to.equal('Logged out');

        const cookies = response.headers['set-cookie'];
        const clearedCookie = cookies.find(cookie => cookie.includes('coderCookie=;'));
        
        expect(clearedCookie).to.exist;
    });

    it('11. GET /api/sessions/current - Debe rechazar la petición si el token fue alterado (Firma inválida)', async function () {

        const tamperedCookie = 'coderCookie=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.UnPayloadFalso.UnaFirmaInventada';
        
        const response = await requester.get('/api/sessions/current')
            .set('Cookie', tamperedCookie);

        expect(response.statusCode).to.equal(401);
        expect(response.body.status).to.equal('error');
        expect(response.body.error).to.include('inválido'); 
    });

});