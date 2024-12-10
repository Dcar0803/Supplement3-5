const request = require('supertest');
const startServer = require('../server');

describe('POST /', () => {
  let app;

  beforeAll(() => {
    app = startServer(4000); 
  });

  it('should respond with the "content" field from the request body', async () => {
    const payload = { content: 'Hello, World!', additionalData: 'Test Data' };

    const response = await request(app).post('/').send(payload);

    expect(response.status).toBe(200);
    expect(response.text).toBe(payload.content); // Verifying the response matches the content
  });

  it('should create a file with the content provided', async () => {
    const fs = require('fs');
    const path = require('path');

    const payload = { content: 'Hello, File!', additionalData: 'File Test' };
    const filePath = path.join(__dirname, '../data/output.txt'); // File path

    await request(app).post('/').send(payload);

    const fileExists = fs.existsSync(filePath); // Check if file exists
    expect(fileExists).toBe(true);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    expect(fileContent).toBe(payload.content); // Verifying the file content
  });

  it('should save the entire JSON body into the MongoDB database', async () => {
    const MongoClient = require('mongodb').MongoClient;
    const payload = { content: 'Hello, MongoDB!', additionalData: 'Database Test' };

    await request(app).post('/').send(payload);

    const client = await MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true });
    const db = client.db('test_db');
    const collection = db.collection('test_collection');

    const savedDoc = await collection.findOne({ content: payload.content });
    expect(savedDoc).toEqual(expect.objectContaining(payload));

    await collection.deleteOne({ content: payload.content }); // Clean up
    await client.close();
  });
});
