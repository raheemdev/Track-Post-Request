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

// Display stored data
app.get('/', (req, res) => {
  if (dataStore.length > 0) {
    res.send(`
            <h1>Logged Data</h1>
            <pre>${JSON.stringify(dataStore, null, 2)}</pre>
        `)
  } else {
    res.send(`
            <h1>Logged Data</h1>
            <pre>No data available</pre>
        `)
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

module.exports = app
