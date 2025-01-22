
  





tap.test('POST /api/v1/users/register', async (t) => { 
    const response = await server.post('/api/v1/users/register').send(mockUser);
    t.equal(response.status, 201); // Status 201 for successful registration
    t.end();
});

tap.test('POST /api/v1/users/register with missing email', async (t) => {
    const response = await server.post('/api/v1/users/register').send({
        username: 'mockUser',  // Added missing username
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

// Further tests for other routes...

tap.teardown(() => {
    process.exit(0); // Ensure the process exits after the tests
});
