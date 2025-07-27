const request = require('supertest');
const app = require('../server');

describe('Request API', () => {
    test('Should create a new request', async () => {
        const newRequest = {
            title: 'Solicitud de prueba',
            description: 'Este es un mock de prueba',
            requester: 'testUser',
            approver: 'testApprover',
            request_type: 'general'
        };

        const response = await request(app)
            .post('/requests')
            .send(newRequest)
            .expect(201); 
        
            expect(response.body.message).toBe('Solicitud creada exitosamente');
            expect('response.body.id').toBeDefined();
            expect(response.body.request.title).toBe(newRequest.title);
    });

    test('Should get all request available', async () => {
        const response = await request(app)
            .get('/requests')
            .expect(200); 
        
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(0)
    });
}) 