const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sql = require('sqlite3').verbose();

const PORT = 3000;
const FB_URL = 'http://172.16.3.212:420';
const AUTH_URL = FB_URL + '/oauth';
const THIS_URL = `http://localhost:3000`;

let db = new sql.Database('./database.db');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'guh',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.listen(PORT);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    console.log(req.query.token);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        db.get("SELECT * FROM users WHERE fb_id = ?", [tokenData.id], (err, row) => {
            if (err){ console.log(err); res.render('error'); return; }
            if(!row){
                db.run("INSERT INTO users (fb_id, fb_name, profile_checked) VALUES(?,?,?)", [tokenData.id, tokenData.username, 0], (err) => {
                    if(err) res.render('error');
                    res.redirect('/');
                });
            } else {
                res.redirect('/');
            }
        });

   } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}/login`);
   };
});

app.get('/profile', isAuthenticated, (req, res) => {
    db.get("SELECT * FROM users WHERE fb_id = ?", [req.session.token.id], (err, user) => {
        if (err){ res.render('error'); return; }
        console.log(user.profile_checked);
        res.render('profile', {user: user});
    });
});

app.post('/profile', isAuthenticated, (req, res) => {
    let fb_id = req.session.token.id;
    let checked = (req.body.checkbox === 'checked');
    db.run("UPDATE users SET profile_checked = ? WHERE fb_id = ?;", [String(checked), fb_id], (err) => {
        if (err){ res.render('error'); return; }
        res.redirect('/profile');
    });
});