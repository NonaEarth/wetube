import "regenerator-runtime";

// Node : Get the module to read Environment Variables.
// require('dotenv').config();
import "dotenv/config";

// MongoDB : Import files.
import "./db";
import "./models/Video.js";
import "./models/User.js";
import "./models/Comment.js";

//* Import 
import app from "./server.js";

// Settings
const PORT = process.env.PORT || 4000;

// Handle Listening
const handleListening = function () {
    console.log(`Server listening on http://localhost:${PORT}.`);
}
app.listen(PORT, handleListening);
