const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

// In-memory storage for data with timestamps
let dataStore = []

// Middleware to handle JSON and URL-encoded form data
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

// Function to clean up data older than 10 days
const cleanOldData = () => {
  const now = Date.now()
  const tenDaysInMillis = 10 * 24 * 60 * 60 * 1000
  dataStore = dataStore.filter(item => now - item.timestamp < tenDaysInMillis)
}

// Schedule cleanup every hour
setInterval(cleanOldData, 60 * 60 * 1000) // Every hour

// Handle form submissions
app.post('/', (req, res) => {
  const postData = req.body
  const timestampedData = { ...postData, timestamp: Date.now() }
  dataStore.push(timestampedData) // Append the new data with a timestamp
  res.status(200).send('done')
})

// Display stored data as a formatted HTML table
app.get('/', (req, res) => {
  if (dataStore.length > 0) {
    const tableRows = dataStore
      .map(
        (item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${new Date(item.timestamp).toLocaleString()}</td>
                <td><pre>${JSON.stringify(item, null, 2)}</pre></td>
            </tr>
        `
      )
      .join('')

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
                </style>
            </head>
            <body>
                <h1>Logged Data</h1>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Timestamp</th>
                            <th>Request Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </body>
            </html>
        `)
  } else {
    res.send(`
            <h1>Logged Data</h1>
            <p>No data available</p>
        `)
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

module.exports = app
