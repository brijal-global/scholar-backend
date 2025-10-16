// This file serves as a serverless function entry point for Vercel
// Import the Express app instance from the server.js file
import app from "../server/server.js";

// Export a function that handles the serverless request
export default async function handler(req, res) {
  // Forward the request to your Express app
  return app(req, res);
}
