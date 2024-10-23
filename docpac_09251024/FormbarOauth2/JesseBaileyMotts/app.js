// Sets up all the constants needed for the program
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const PORT = 3000;
const AUTH_URL = 'http://172.16.3.212:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

// Sets up the view engine, url encoded, and session
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    // I LOVE I HAVE NO MOUTH BUT I MUST SCREAM, THE 1967 POST-APOCALYPTIC SCIENCE FICTION SHORT STORY WRITTEN BY AMERICAN AUTHOR HARLAN ELLISON 
    secret: 'Hate. Let me tell you how much I\'ve come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word \'hate\' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.',
    resave: false,
    saveUninitialized: false
}))

// Sets up the database that will hold the users
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the database!');
    };
});

// Sets up the isAuthenticated function that checks if the session user exists
const isAuthenticated = (req, res, next) => {
    // If the session user exists, continue
    if (req.session.user) next();
    // Else, redirect to /login
    else res.redirect('/login');
};

// Renders the index page with the user variable assigned to the session user
app.get('/', isAuthenticated, (req, res) => {
    try {
        // Tries to render the home page with the user variable assigned to the session user
        res.render('index', {user: req.session.user});
    } catch (err) {
        // Catches any errors and sends the error message
        res.send(err.message);
    };
});

// Checks if the user is logged in
app.get('/login', (req, res) => {
    // If the user has a token
    if (req.query.token) { 
        // tokenData is assigned to the decoded web token
        let tokenData = jwt.decode(req.query.token);
        // Sets the session token and user to the corrosponding variables
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        // Redirects home
        res.redirect('/');
    // If the user does not have a token
    } else {
        // Redirects to the formbar oauth page with the redirectURL being the login page
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`)
    }
})

// Listen to the port
app.listen(PORT, console.log(`Connected to port ${PORT}`));