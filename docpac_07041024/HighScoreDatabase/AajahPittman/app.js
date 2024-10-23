const sqlite3 = require(`sqlite3`).verbose();
const ejs = require('ejs');
const express = require('express')

const app = express();

app.set('view engine', 'ejs');

let db = new sqlite3.Database('./thedatabase.db', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log("Opened Databse Succefully!")
    }
});

app.get('/', (req, res) => {
 
    db.all(`SELECT * FROM cats INNER JOIN users ON users.uid = cats.owner WHERE color=?;`, 'brown', (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            res.render('index', { data: rows });
        }
    });
});

app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Running on port 3000');
    }
})