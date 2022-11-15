const express = require('express');
const url = require('url')
const app = express();
app.use(express.static(__dirname))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/library', (req, res) => {
    res.sendFile(__dirname + '/private/library.html')
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/private/auth/login.html')
})

app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/private/auth/signup.html')
})

app.get('/board', (req, res) => {
    res.sendFile(__dirname + '/private/board.html')
})

app.get('/level', (req, res) => {
    res.sendFile(__dirname + '/private/level.html')
    URLquery = req.query.id
})

app.get('/?404', (req, res) => {
    res.sendFile(__dirname + '/private/errorDoc.html')
})

app.listen(4000);