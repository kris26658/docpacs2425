const express = require("express");
const app = express();
const port = 4000;

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    res.render('index.ejs')
})

app.get("/guest", (req,res) =>{
    const name = req.query.name || "Guest"
    res.render('guest.ejs', {name})
})



app.listen(port);
