import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';

//const axios = require('axios');
// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// Endpoint to filter an image from a public URL
app.get('/filteredimage', async (req, res) => {
  const { image_url } = req.query;

  // Validate the image_url query
  if (!image_url) {
    return res.status(400).send('Image URL must not be empty!');
  }

  // Check if the image_url is a valid URL
  try {
    new URL(image_url);
  } catch (error) {
    return res.status(400).send({ message: 'The image_url is not valid.' });
  }

  // Attempt to fetch and process the image
  try {
    // Fetch the image data using axios
    const response = await axios.get(image_url, { responseType: 'arraybuffer' });
    
	// Pass the fetched data to Jimp for processing
    const filteredImage = await filterImageFromURL(response.data);
    
    // Send the resulting file in the response
    res.sendFile(filteredImage, () => deleteLocalFiles([filteredImage]));
  } catch (error) {
    console.error(error);
    res.status(422).send({ message: 'Unable to process image at the provided URL.' });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log('press CTRL+C to stop server');
});
