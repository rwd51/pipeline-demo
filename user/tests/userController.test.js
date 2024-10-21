// tests/userController.test.js
const request = require('supertest');
const app = require('../src/app'); // Import the app
const { pool } = require('../src/db'); // Import the pool from db.js

describe('User Controller', () => {
  let testUserEmail = 'test@example.com';
  let testUserPassword = 'password123';
  let adminUserEmail = 'admin@example.com';
  let adminUserPassword = 'adminpassword';

  const cleanup = async () => {
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [testUserEmail, adminUserEmail]);
  };

  beforeAll(async () => {
    await cleanup(); // Ensure there's no existing test user
  });

  afterEach(async () => {
    await cleanup(); // Cleanup after each test
  });

  afterAll(async () => {
    await pool.end(); // Disconnect from the pool
  });

  test('Should Successfully Signup a New User', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testUserEmail, password: testUserPassword });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User created successfully');
  });

  test('Should Not Allow Signup with Existing Email', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testUserEmail, password: testUserPassword });

    const response = await request(app)
      .post('/api/users/signup')
      .send({ name: 'Another User', email: testUserEmail, password: testUserPassword });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Email already exists');
  });

  test('Should Successfully Login with Valid Credentials', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testUserEmail, password: testUserPassword });

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: testUserEmail, password: testUserPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.message).toBe('Login successful');
  });

  test('Should Not Allow Login with Invalid Credentials', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: testUserEmail, password: 'wrongpassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });

  test('Should Retrieve User Profile After Login', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({ name: 'Test User', email: testUserEmail, password: testUserPassword });

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: testUserEmail, password: testUserPassword });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(testUserEmail);
  });

  test('Should Retrieve All Users (Admin Only)', async () => {
    // Log in as the predefined admin to get the token
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: adminUserEmail, password: adminUserPassword });

    const adminToken = loginResponse.body.token;

    const response = await request(app)
      .get('/api/users/all-users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true); // Expect an array of users
  });
});
