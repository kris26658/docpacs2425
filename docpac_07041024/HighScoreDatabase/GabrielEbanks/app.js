const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

const db = new sqlite3.Database('07database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh');
    }
});


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/error', (req, res) => {
    const errorCode = req.query.errorCode || 500;
    res.render('error', { errorCode: errorCode });
});

app.get('/hiscores', (req, res) => {
    db.all(`SELECT name, score FROM scores`, (err, rows) => {
        if (err) {
            return res.render('error', { errorCode: 500 });
        }
        rows.sort((a, b) => b.score - a.score);
        const topScores = rows.slice(0, 10); // Get the top 10 scores
        res.render('hiscores', { scores: topScores });
    });
});

app.post('/hiscores', (req, res) => {
    const { name, score } = req.body;
    if (!name || isNaN(score)) {
        return res.render('error', { errorCode: 400 });
    }

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const query = `INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)`;
    db.run(query, [ip, name, score], (err) => {
        if (err) {
            return res.render('error', { errorCode: 500 });
        }
        res.redirect('/hiscores')
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});