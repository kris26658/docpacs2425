const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const crypto = require('crypto');
const PORT = 3000;

var key = crypto.createCipher('aes-128-cbc', 'passywordy');
var str = key.update('abc', 'utf8', 'hex')
str += key.final('hex');


function encrypt(text) {
    str = key.update(text, 'utf8', 'hex')
    str += key.final('hex');
    return str;
}

function decrypt(text) {
    str = key.update(text, 'hex', 'utf8')
    str += key.final('utf8');
    return str;
}

let db = new sqlite3.Database('data/users.db', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log("connected to db")
    }
})

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/error', (req, res) => {
    res.render('error')
})
app.post('/login', (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        if (!username || !password) {
            throw new Error('Invalid user and password')
        }

        db.get("SELECT * FROM users WHERE username = ? ", [username], (err, row) => {
            if (err) {
                throw new Error(err)
            }
            if (!row) {
                throw new Error('User not found')
            }
        })

        const decPass = decrypt(password);
        if (decPass !== row.password) {
            throw new Error('Wrong password Bub')
        }

        res.redirect(`/home?user=${username}&email=${email}`)
    } catch (err) {
        redirect('/error')
    }
})


app.post('/signup', (req, res) => {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;
        if (!username || !email || !password) {
            throw new Error('I think you forgot something')
        }
        const encPass = encrypt(password);
        db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, encPass], (err) => {
            if (err) {
                res.redirect("/error")
            }
        })
    } catch (err) {
        res.redirect('/error')
    }
})


app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});
