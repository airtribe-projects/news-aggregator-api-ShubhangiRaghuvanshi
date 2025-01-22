
  





const tap = require('tap');
const supertest = require('supertest');
const app = require('../app');
const server = supertest(app);

const mockUser = {
    username: 'User`',
    email: 'user1@example.com',
    password: 'user1456',
    preferences: [
        {
            category: 'sports',
            languages: ['en']
        }
    ]
};


let token = '';

// Auth tests

tap.test('POST /api/v1/users/register', async (t) => { 
    const response = await server.post('/api/v1/users/register').send(mockUser);
    t.equal(response.status, 201); // Expecting status 201 for successful registration
    t.end();
});

tap.test('POST /api/v1/users/register with missing email', async (t) => {
    const response = await server.post('/api/v1/users/register').send({
        name: mockUser.name,
        password: mockUser.password
    });
    t.equal(response.status, 400); // Expecting status 400 for missing email
    t.end();
});

tap.test('POST /api/v1/users/login', async (t) => { 
    const response = await server.post('/api/v1/users/login').send({
        email: mockUser.email,
        password: mockUser.password
    });
    t.equal(response.status, 200); // Expecting status 200 for successful login
    t.hasOwnProp(response.body, 'token'); // Ensure the response contains a token
    token = response.body.token; // Save the token for further tests
    t.end();
});

tap.test('POST /api/v1/users/login with wrong password', async (t) => {
    const response = await server.post('/api/v1/users/login').send({
        email: mockUser.email,
        password: 'wrongpassword'
    });
    t.equal(response.status, 401); // Expecting status 401 for wrong password
    t.end();
});

// Preferences tests

tap.test('GET /api/v1/users/preferences', async (t) => {
    const response = await server.get('/api/v1/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200); // Expecting status 200
    t.hasOwnProp(response.body, 'preferences'); // Ensure preferences are returned
    t.same(response.body.preferences, mockUser.preferences); // Ensure preferences match
    t.end();
});

tap.test('GET /api/v1/users/preferences without token', async (t) => {
    const response = await server.get('/api/v1/users/preferences');
    t.equal(response.status, 401); // Expecting status 401 for missing token
    t.end();
});

tap.test('PUT /api/v1/users/preferences', async (t) => {
    const response = await server.put('/api/v1/users/preferences').set('Authorization', `Bearer ${token}`).send({
        preferences: ['movies', 'comics', 'games']
    });
    t.equal(response.status, 200); // Expecting status 200 for successful update
    t.end();
});

tap.test('Check PUT /api/v1/users/preferences', async (t) => {
    const response = await server.get('/api/v1/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200); // Expecting status 200 after update
    t.same(response.body.preferences, ['movies', 'comics', 'games']); // Ensure preferences match
    t.end();
});

// News tests

tap.test('GET /api/v1/news', async (t) => {
    const response = await server.get('/api/v1/news').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200); // Expecting status 200 for fetching news
    t.hasOwnProp(response.body, 'news'); // Ensure response contains news
    t.end();
});

tap.test('GET /api/v1/news without token', async (t) => {
    const response = await server.get('/api/v1/news');
    t.equal(response.status, 401); // Expecting status 401 for missing token
    t.end();
});

tap.teardown(() => {
    process.exit(0); // Ensure the process exits after the tests
});
