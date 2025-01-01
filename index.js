const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for data with timestamps
let dataStore = [];

// Middleware to handle JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Function to clean up data older than 10 days
const cleanOldData = () => {
    const now = Date.now();
    const tenDaysInMillis = 10 * 24 * 60 * 60 * 1000;
    dataStore = dataStore.filter(item => now - item.timestamp < tenDaysInMillis);
};

// Schedule cleanup every hour
setInterval(cleanOldData, 60 * 60 * 1000); // Every hour

// Handle form submissions
app.post('/', (req, res) => {
    const postData = req.body;
    const timestampedData = { ...postData, timestamp: Date.now() };
    dataStore.unshift(timestampedData); // Add the new data to the beginning of the array
    res.status(200).send("done");
});

// Clear all stored data
app.delete('/', (req, res) => {
    dataStore = [];
    res.status(200).send("All requests cleared");
});

// API endpoint to get the latest data
app.get('/api/data', (req, res) => {
    res.json(dataStore);
});

// Display stored data as a formatted and responsive HTML table
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    word-wrap: break-word;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                tr:hover {
                    background-color: #f1f1f1;
                }
                pre {
                    margin: 0;
                    font-family: monospace;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                @media screen and (max-width: 768px) {
                    table, thead, tbody, th, td, tr {
                        display: block;
                    }
                    thead tr {
                        display: none;
                    }
                    td {
                        border: none;
                        position: relative;
                        padding-left: 50%;
                    }
                    td:before {
                        content: attr(data-label);
                        position: absolute;
                        left: 10px;
                        font-weight: bold;
                    }
                }
                .button-container {
                    margin-bottom: 20px;
                }
                button {
                    padding: 10px 15px;
                    font-size: 16px;
                    color: white;
                    background-color: #007BFF;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <h1>Logged Data</h1>
            <div class="button-container">
                <button onclick="clearRequests()">Clear All Requests</button>
            </div>
            <table id="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Timestamp</th>
                        <th>Request Data</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="3">Loading...</td></tr>
                </tbody>
            </table>
            <script>
                async function fetchRequests() {
                    try {
                        const response = await fetch('/api/data');
                        const data = await response.json();
                        const tableBody = document.querySelector('#data-table tbody');
                        if (data.length === 0) {
                            tableBody.innerHTML = '<tr><td colspan="3">No data available</td></tr>';
                        } else {
                            tableBody.innerHTML = data.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${new Date(item.timestamp).toLocaleString()}</td>
                                    <td><pre>${JSON.stringify(item, null, 2)}</pre></td>
                                </tr>
                            `).join('');
                        }
                    } catch (error) {
                        console.error('Error fetching data:', error);
                    }
                }

                function clearRequests() {
                    if (confirm('Are you sure you want to clear all requests?')) {
                        fetch('/', { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    fetchRequests(); // Refresh the table
                                } else {
                                    alert('Failed to clear requests');
                                }
                            });
                    }
                }

                // Fetch requests every second
                setInterval(fetchRequests, 1000);
                fetchRequests(); // Initial fetch
            </script>
        </body>
        </html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
