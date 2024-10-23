//import sqlite3 module
const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const app = express();

app.set('view engine', 'ejs');

//create a database object
let db = new sqlite3.Database('thedatabase.db', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log("Opened database successfully!");
    }
});

app.get('/', (req, res) => {
    db.all(`SELECT * FROM cats INNER JOIN users ON users.uid = cats.owner WHERE color=?;`, 'brown', (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(rows);

            res.render('index', { data: rows });
        }
    });
});


app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Server is running on port 3000");
    }
})