const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

let db = new sqlite3.Database('data/data.db', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Connected to the highscore database.");
    }
});

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/game", (req, res) => {
    res.render('game');
});

app.get("/errors", (req, res) => {
    res.render('errors');
});


app.get("/highscore", (req, res) => {
    try {
        db.all("SELECT * FROM users ORDER BY score DESC", (err, rows) => {
            if (err) {
                console.error(err);
            } else {
                rows = rows.slice(0, 10);
                res.render('highscore', { users: rows });
            }
            
        });
    } catch (err) {
        console.error('error', { error: err.message });
    }
});

app.post("/highscore", (req, res) => {
    try {
        let name = req.body.name;
        let score = req.body.score;
        if (score === null || name === null) {
            console.error('Score or Userame is null.')
        };
        db.run(
            'INSERT INTO users (ip, username, score) VALUES (?, ?, ?)',
            [req.ip, name, score], 
            (err) => {
            if (err) {
                console.error(err)
            };
        });
    } catch (err) {
        console.error('error', { error: err.message });
    }
});



app.listen(PORT, console.log(`Server is running on port ${PORT}`));
