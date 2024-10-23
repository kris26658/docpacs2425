const sqlite3 = require('sqlite3');
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const AUTH_URL = 'http://172.16.3.212:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});


app.use(session({
    secret: 'make up a secret string here but never publish it!',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        db.get('SELECT * FROM users WHERE fb_id=?;', tokenData.id, (err, row) => {
            if (err) {
                console.err(err);
                res.send("There's an error!");

            } else if (!row) {
                db.run('INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, ?);', [tokenData.username, tokenData.Id, 0], (err) => {
                    if (err) {
                        console.err("Database error: " + err);
                        res.send("an error occured");
                    } else {
                        res.redirect("/profile");
                    };
                };
            } red.redirect('/profile');
        }

         res.redirect('/'));

    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});