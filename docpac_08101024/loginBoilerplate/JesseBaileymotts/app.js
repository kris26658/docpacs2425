//////////////////////////////////////////////////////////////////////
//  _                   _          ____          _  _               //
// | |     ___    __ _ (_) _ __   | __ )   ___  (_)| |  ___  _ __   //
// | |    / _ \  / _` || || '_ \  |  _ \  / _ \ | || | / _ \| '__|  //
// | |___| (_) || (_| || || | | | | |_) || (_) || || ||  __/| |     //
// |_____|\___/  \__, ||_||_| |_| |____/  \___/ |_||_| \___||_|     //
//               |___/                                              //
//////////////////////////////////////////////////////////////////////

const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { ifError } = require('assert');
const app = express();
const PORT = 3000;

// Create a new salt for this user
const salt = crypto.randomBytes(16).toString('hex');
console.log(salt);

// Sets the view engine to EJS
app.set('view engine', 'ejs');
// I don't quite know
app.use(express.urlencoded({ extended: true }));
// Sets up the express session
app.use(session({
    // Makes the secret AM's hate speech from I Have No Mouth and I Must Scream
    secret: 'Hate. Let me tell you how much I\'ve come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word \'hate\' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.',
    resave: false,
    saveUninitialized: false
}));

// Check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    // If the user is authenticated, continue
    if (req.session.user) next()
    // Else, send them to the login page
    else res.redirect('/login')
};

// Set the db constant to the database in the data folder
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to Database');
    };
});

// Render the index page
app.get('/', (req, res) => {
   res.render('index'); 
});

// Render the login page
app.get('/login', (req, res) => {
   res.render('login'); 
});

// Handles the login submission
app.post('/login', (req, res) => {
    // If the username and password are filled out, continue
    if (req.body.user && req.body.pass) {
        // Get the row from the users table in the database where the submitted user is 
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("OOGA BOOGA BOOGA! THE GREMLIN FOUND AN ERROR:\n" + err);
            // If this user does not exist, then create one
            } else if (!row) {
                // Use the salt to hash a password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error Hashing Password: ' + err);
                    // If there is no error, continue
                    } else {
                        // Set the constant hashedPassword to the hashed password
                        const hashedPassword = derivedKey.toString('hex'); 
                        // Inserts the user's information into the database
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send('Database error:\n' + err);
                            } else {
                                res.send('Created new user');  
                            }; 
                        });
                    };
                });
            // If the user exists, continue
            } else {
                // Hashes the submitted password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error Hashing Password: ' + err)
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        // Compare the stored password with provided password
                        if (row.password == hashedPassword) {
                            // If the passwords match, set the session user to the username provided
                            req.session.user = row.username;
                            // Redirect the user home
                            res.redirect('/home');
                        } else {
                            res.send('Incorrect Password')
                        };
                    };
                });
            };
        });
    } else {
    res.send('You need a username and password');
    };
});

// Render the home page
app.get('/home', isAuthenticated, (req, res) => {
    try {
        res.render('home.ejs', {user : req.session.user});
    } catch (error) {
        res.send(error.message);
    };
});

// Listen to the port assigned to the PORT constant and log if it runs
app.listen(PORT, console.log(`Running on port ${PORT}`));

