//In terminal:
//to install required modules: "npm i ejs express sqlite3 jsonwebtoken express-session"
//to start the server: "node app.js"

/*---------
HTTP Server
---------*/

//add required modules
const express = require("express");
const sqlite3 = require("sqlite3");
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express(); //turn express into object for furture usage

app.set("view engine", "ejs"); //set view engine
app.use(express.urlencoded({ extended: true })); //encode url

const PORT = 1000; //set port number

app.use(session({
    secret: "secretHere",
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect("/login?redirectURL=${}")
};

const FBJS_URL = 'http://172.16.3.212:420'; //oauth from formbar
const THIS_URL = 'http://localhost:1000/login' //redirect back to login

const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.log(err);
    } else {
        app.listen(PORT, () => {
            console.log("Server started on port", PORT)
        })
    };
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/login', (req, res) => {
    console.log(req.query.token)
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.username
        req.session.uid = tokenData.id
        //check if user is in the database
        db.get("SELECT * FROM users WHERE fb_name=?;", req.session.user, (err, row) => {
            if (err) {
                res.render("error", {error: "Selection error."});
            } else if (!row) {
                db.run("INSERT INTO users(fb_name, fb_id, profile_checked) VALUES(?, ?, ?);", [req.session.user, req.session.uid, null], (err) => {
                    if (err) {
                        res.render("error", {error: "Insertion error."});
                    } else {
                        console.log("Created new user");
                    };
                });
            };
        });
        //redirect to user's profile
        res.redirect('/profile');
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get("/profile", isAuthenticated, (req, res) => {
    try {
        res.render("profile", { user: req.session.user })
    }
    catch (error) {
        res.render("error", {error: "You are not logged in."});
    }
});

app.post("/profile", (req, res) => {
    db.get("UPDATE users SET profile_checked=? WHERE fb_id=?", [req.body.cb, req.session.uid], (err, row) => {
        if (err) {
            res.render("error", {error: "Selection error."});
        } else {
            console.log("Selection successful");
        };
    });
});