const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for data
let dataStore = [];

// Middleware to handle JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// Handle form submissions
app.post('/track', (req, res) => {
    const postData = req.body;
    dataStore = [postData]; // Clear the previous data and add the new data
    res.status(200).send("done");
});

// Display stored data
app.get('/', (req, res) => {
    const formattedData = dataStore.length > 0 ? dataStore.map(item => JSON.stringify(item)).join('\n') : 'No data available';
    res.send(`
        <h1>Stored Data</h1>
        <pre>${formattedData}</pre>
       
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
