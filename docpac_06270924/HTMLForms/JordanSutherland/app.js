var express = require('express')
var fs = require('fs')
var app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(__dirname + "/public"))

var credentials = JSON.parse(fs.readFileSync(__dirname + '/public/data.json'))

app.get('/add', (req, res) => {
    res.render('add')
})

app.post('/add', (req, res) => {
    try {
        if (!req.body.textbox) {
            throw 'No username found'
        }
        if (!req.body.password) {
            throw 'No password found'
        }
        credentials.data.push({name: req.body.textbox, password: req.body.password})
        fs.writeFileSync(__dirname + '/public/data.json', JSON.stringify(credentials))
        res.redirect('/')
    } catch(err) {
        res.render('errors', {err: err})
    }
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/view', (req, res) => {
    var users = JSON.parse(fs.readFileSync(__dirname + "/public/data.json"))
    console.log(users)
    res.render('view', {users: users.data})
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server running on port 3000')
    }
})