const sqlite3 = require('sqlite3')
const express = require('express')
const crypto = require('crypto')
const session = require('express-session');
const jwt = require('jsonwebtoken');
const { CLIENT_RENEG_WINDOW } = require('tls');
const port = 6969
const app = express()

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'ThisIsMySecretThatNobodyWouldEverGuessSODAIsTheBestDrinkInTheWorldSoTastyAndRefreshingLoveThatBubblySensationGivesMeLifeAndEnergyAndMakesMeFeelLikeImOnTopOfTheWorldMakesMeHaveAPurpose',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Connected to the database.')
    }
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username = ?;', req.body.user, (err, row) => {
            if (err) {
                res.send("whoopsie daisy a silly lil error occured:\n" + err)
                console.error(err);
            } else if (!row) {
                //create new salt for user
                const salt = crypto.randomBytes(16).toString('hex');

                //use the salt to hash the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedkey) => {
                    if (err) {
                        res.send("i suck at hashing i dided it bad" + err)
                    } else {
                        const hashedPass = derivedkey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPass, salt], (err) => {
                            if (err) {
                                res.send("Databease error:\n" + err)
                            } else {
                                res.send("User created")
                            }
                        })
                    }
                });
            } else {
                //compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedkey) => {
                    if (err) {
                        res.send("i suck at hashing i dided it bad" + err)
                    } else {
                        const hashedPass = derivedkey.toString('hex');
                        if (row.password === hashedPass) {
                            req.session.user = req.body.user;
                            res.redirect('/home');
                        } else {
                            res.send("wrong password bucko")
                        }
                    }
                });
            }})
    } else {
        res.send("hey pal you need to fill in the user and pass")
    }
})

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs', { user: req.session.user })
});


app.get('/home', (req, res) => {
    res.send("look at that console pal")
})

app.listen(port)