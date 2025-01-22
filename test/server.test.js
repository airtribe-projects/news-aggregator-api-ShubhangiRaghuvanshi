
  





const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User'); // Adjust path to your User model
require('dotenv').config();

describe('API Tests', () => {
    let token;

    beforeAll(async () => {
        // Connect to the test database
        await mongoose.connect(process.env.TEST_MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Disconnect from the test database
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clean up the database before each test
        await mongoose.connection.db.dropDatabase();

        // Create a test user
        await User.create({
            email: 'testuser@example.com',
            password: 'password123', // Ensure this matches your hashing logic in the app
        });

        // Log in the test user to get a token
        const loginRes = await request(app)
            .post('/api/v1/users/login')
            .send({ email: 'testuser@example.com', password: 'password123' });

        token = loginRes.body.token;
    });

    describe('User Registration', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({ email: 'newuser@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'User registered successfully.');
        });
    });

    describe('User Login', () => {
        it('should log in an existing user', async () => {
            const res = await request(app)
                .post('/api/v1/users/login')
                .send({ email: 'testuser@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not log in with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/users/login')
                .send({ email: 'testuser@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(401);
        });
    });

    describe('User Preferences', () => {
        it('should fetch user preferences', async () => {
            const res = await request(app)
                .get('/api/v1/users/preferences')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('preferences');
        });

        it('should update user preferences', async () => {
            const res = await request(app)
                .put('/api/v1/users/preferences')
                .set('Authorization', `Bearer ${token}`)
                .send({ preferences: ['movies', 'comics'] });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('preferences', ['movies', 'comics']);
        });
    });

    describe('News API', () => {
        it('should fetch news based on preferences', async () => {
            const res = await request(app)
                .get('/api/v1/news')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('articles');
        });

        it('should return 401 if no token is provided', async () => {
            const res = await request(app).get('/api/v1/news');

            expect(res.status).toBe(401);
        });
    });
});
