// Imports express module and creates an express app 
const express = require('express');
const app = express();

// sets the view engine to ejs
app.set('view engine', 'ejs');

// sets the views directory
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// the root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to My App!!');
});

// the /endpoint endpoint
app.get('/endpoint', (req, res) => {
    let name = 'Guest';
    if (req.query.name) {
        name = req.query.name;
    }

    // renders the Hello.ejs file
    let Isabella = "Hello, Isabella!";

    res.render('Hello', { name: Isabella });
});
