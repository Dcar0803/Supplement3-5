const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');



/**
 * Initializes and starts the Express server.
 * @function startServer
 * @param {number} port - The port on which the server will run.
 * @returns {Object} The Express app instance.
 */

function startServer(port = 3000) {
  const app = express();
  app.use(express.json());

  // MongoDB Configuration
  const mongoUrl = 'mongodb://localhost:27017';
  const dbName = 'test_db';
  const collectionName = 'test_collection';

 


  /**
   * POST /
   * Handles POST requests to the root endpoint.
   * @summary Processes a JSON body.
   * @param {Object} req - The request object.
   * @param {Object} req.body - The body of the request.
   * @param {string} req.body.content - The content to be processed.
   * @param {Object} res - The response object.
   * @returns {string} Responds with the value of the "content" field from the request body.
   * @throws {Error} Responds with a 500 status code in case of server errors.
   */

  
  app.post('/', async (req, res) => {
    const { content } = req.body;

    if (!content) {
      return res.status(400).send('Content field is required');
    }

    try {
      // Write content to a file
      const filePath = path.join(__dirname, './data/output.txt');
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content);

      // Save entire JSON body to MongoDB
      const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      await collection.insertOne(req.body);
      await client.close();

      res.status(200).send(content);
    } catch (err) {
      res.status(500).send('Internal Server Error');
      console.error(err);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  return app;
}

// Exporting for testing
module.exports = startServer;

// Start the server if this script is executed directly
if (require.main === module) {
  startServer(3000);
}
