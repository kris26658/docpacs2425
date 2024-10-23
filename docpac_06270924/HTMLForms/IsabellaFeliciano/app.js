const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
//set engine to view ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//load index.ejs
app.get('/', (req, res) => {
    res.render('index');
});

//load view.ejs
app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;

    res.render('view', { orders: data });
});

//load add.ejs
app.get('/add', (req, res) => {
    res.render('add');
});
//results from add
app.post('/add', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('./data.json')).data;
        const orderData = {
            brand: req.body.brand,
            quantity: req.body.quantity,
        };
        if (orderData.brand === '') throw new Error('Brand is required');
        if (!orderData.quantity) throw new Error('Quantity required');
        if (orderData.quantity > 2000) throw new Error('Too much soda');
        data.push(orderData);
        fs.writeFileSync('./data.json', JSON.stringify({ data: data }));
        res.redirect('/');
    } catch (err) {
        res.render('error', { error: err.message });
    }
});

//start server
app.listen(PORT);