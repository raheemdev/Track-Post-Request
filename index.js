const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.post('/track', (req, res) => {
    const postData = req.body;
    fs.appendFile('data.txt', JSON.stringify(postData) + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Server Error');
            return;
        }
        res.status(200).send("done");
    });
});

app.get('/', (req, res) => {
    fs.readFile('data.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading from file', err);
            res.status(500).send('Server Error');
            return;
        }
        res.send(`
            <h1>Stored Data</h1>
            <pre>${data}</pre>
          
        `);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
