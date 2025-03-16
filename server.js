import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Store images in memory (in a production environment, you'd use a proper database)
const images = new Map();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the dist directory
app.use(express.static('dist'));

// Endpoint to save an image
app.post('/api/images', (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const id = Math.random().toString(36).substring(7);
    images.set(id, imageData);

    // Delete the image after 1 hour
    setTimeout(() => {
      images.delete(id);
    }, 3600000);

    res.json({ id });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// Endpoint to get an image
app.get('/api/images/:id', (req, res) => {
  try {
    const { id } = req.params;
    const imageData = images.get(id);

    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Send image as HTML page with proper meta tags
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Life in Weeks - Shared Visualization</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta property="og:title" content="Life in Weeks Visualization" />
          <meta property="og:description" content="View my life journey visualization" />
          <meta property="og:image" content="${imageData}" />
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f5f5f5;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              max-width: 1000px;
              width: 100%;
            }
            img {
              width: 100%;
              height: auto;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageData}" alt="Life in Weeks Visualization" />
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 