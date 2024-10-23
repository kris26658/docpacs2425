const express = require('express');
const app = express();
const crypto = require('crypto');
const cipher = require('./cipher');
const { isNativeError } = require('util/types');
const sql = require('sqlite3').verbose();

const PORT = 3000;
const SECRET = 'iLoveTypescript!'; // MUST BE 16 BYTES

let db = new sql.Database('./database.db');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/home', (req, res) => {
    let user = req.query?.user;
    let email = req.query?.email;

    res.render('home', {user: user, email: email})

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/login', async (req, res) => {
    try {
        let username = req.body?.username;
        let password = req.body?.password;

        if(typeof username === 'undefined' || username === '') throw new Error("No Username");
        if(typeof password === 'undefined' || password === '') throw new Error("No Password");

        let getUser = new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?;", [username], (err, user) => {
                if(err) reject(err);
                resolve(user);
            });
        });

        let user = await getUser;

        if(!user) throw new Error("User not found");

        let decryptedPass = cipher.decrypt(user.password, SECRET);
        if(password !== decryptedPass) throw new Error("Invalid Password");

        res.redirect(`/home?user=${user.username}&email=${user.email}`);

    } catch(err) {
        res.render('error', {error: err.message});
    }
});

app.post('/signup', async (req, res) => {
    try {
        let username = req.body?.username;
        let email = req.body?.email;
        let password = req.body?.password;

        if(typeof username === 'undefined' || username === '') throw new Error("No Username");
        if(typeof email === 'undefined' || username === '') throw new Error("No Email");
        if(!email.includes('@') || !email.includes('.')) throw new Error("Email Invalid");
        if(typeof password === 'undefined' || password === '') throw new Error("No Password");

        let encryptedPass = cipher.encrypt(password, SECRET);

        let addUser = new Promise((resolve, reject) => {
            db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?);", [username, email, encryptedPass], (err) => {
                if(err) reject(err);
                resolve();
            });
        });

        let error = await addUser;

        if(isNativeError(error)){
            throw error;
        }

        res.redirect('/login');

    } catch(err) {
        res.render('error', {error: err.message});
    }
});