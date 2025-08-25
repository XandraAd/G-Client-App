// Import your Express app from the server
import app from '../../server/index.js';

// Export as Vercel serverless function
export default async function handler(req, res) {
  // Add Vercel-specific logging
  console.log(`API Request: ${req.method} ${req.url}`);
  
  // Return the Express app handler
  return app(req, res);
}