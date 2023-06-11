const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const clientDB = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })
const gameDB = new sqlite3.Database('./db/game.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })

const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')

const fs = require('fs'); 

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const flash = require('express-flash')
const session = require('express-session')

const initPassport = require('./passport-config');
initPassport(passport, LocalStrategy, clientDB, bcrypt, fs)

app.use(express.static(__dirname))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: `${Math.random().toString()}`,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 12},
    saveUninitialized: false
}));

app.use(passport.initialize())
app.use(passport.session())

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');

app.get('/', checkNotAuthenticated, (req, res) => {
    res.render('public/home.ejs')
})

app.get('/login', checkNotAuthenticated, (req, res, next) => {
    res.render('public/login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: `/login`,
        failureFlash: true
}));

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('public/signup', { reason: req.query.message });
});

app.post('/signup', checkNotAuthenticated, async (req,res) => {
    if(req.body.password.length < 8) {
        res.redirect('/signup?message=password_length')
        return
    } 
    if(!req.body.name.includes(' ')) {
        res.redirect('/signup?message=full_name')
        return
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const sql = `INSERT INTO users(name, username, password) VALUES ("${req.body.name}", "${req.body.email}", "${hashedPassword}")`
    clientDB.all(sql, [], err => { 
        if(err) {
            if(err.errno == 19) res.redirect('/login?message=aid') 
        }
        if(req.body.password.length >= 8 && req.body.name.includes(' ') && !err) res.redirect('/login')
    })
})

//PRIVATE
app.get('/home', (req, res) => { // to add checkAuthenticated
    console.log(req.user.id)
    gameDB.all('SELECT image_reference, airport_name, airport_icao FROM levels', [], (err, levels) => {
        clientDB.all(`SELECT name, date, score, level, personID FROM leaderboard ORDER BY score DESC LIMIT 3;`, [], (err, leaderboard) => {
            clientDB.all(`SELECT users.name, users.username, users.pfp, users.last_played FROM users LEFT JOIN friends ON users.id = friends.passive_user WHERE friends.lead_user = ? AND friends.status = ?`, [req.user.id, "Active"], (err, following) => { // change 30 to current user
                res.render('private/home.ejs', { levels: levels, leaderboard: leaderboard, following: following });
            })
        })
    })
})

app.get('/leaderboard', checkAuthenticated, (req, res) => { // to add checkAuthenticated
    clientDB.all(`SELECT name, date, score, level, personID FROM leaderboard ORDER BY score DESC;`, [], (err, leaderboard) => {
        res.render('private/leaderboard.ejs', { leaderboard: leaderboard });
    })
})

app.get('/settings', checkAuthenticated, (req, res) => { // to add checkAuthenticated
    res.render('private/settings.ejs')
})

app.post('/search', checkAuthenticated, (req, res) => {
    if(req.body.query.includes('?') || req.body.query.includes('=')) {
        res.redirect('/search')
    } else { 
        let words
        try { words = req.body.query.split(' ') } catch { words = req.body.query }
        if(words != '') {
            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }
        }
        res.redirect(`/search?query=${words.toString().replace(',', ' ')}`)
    }
})

app.get('/search', checkAuthenticated, (req, res) => {
    if(req.query.query != undefined) {
        gameDB.all(`SELECT airport_name, airport_icao, image_reference FROM levels WHERE airport_name LIKE '%${req.query.query}%'`, [], (err, levels) => {
            clientDB.all(`SELECT id, name, username, pfp FROM users WHERE name LIKE '%${req.query.query}%'`, [], (err, users) => {
                res.render('private/search.ejs', { query: req.query.query, levels: levels, users: users })
            })
        })
    } else {
        res.render('private/search.ejs', { query: 'none', levels: undefined, users: undefined })
    }
})

app.get('/friends', checkAuthenticated, (req, res) => {
    clientDB.all(`SELECT users.id, users.name, users.username, users.pfp, users.last_played, friends.creation_date FROM users LEFT JOIN friends ON users.id = friends.passive_user WHERE friends.lead_user = ? AND friends.status = ?`, [req.user.id, "Active"], (err, following) => { // change 30 to current user
        console.log(following)
        res.render('private/friends.ejs', { following: following });
    })
})

app.get('/profile/:id', checkAuthenticated, (req, res) => {
    if(req.params.id == "current") req.params.id = req.user.id
    clientDB.get(`SELECT id, name, username, pfp FROM users WHERE id = ${req.params.id}`,(err, user) => {
        clientDB.all(`SELECT score, level, date FROM leaderboard WHERE personID = ${req.params.id}`, [], (err, leaderboard) => {
            clientDB.all(`SELECT friends.lead_user, friends.status, friends.creation_date, users.username, users.name, users.pfp FROM users LEFT JOIN friends ON users.id = friends.lead_user WHERE friends.passive_user = ? AND friends.status = ?`, [req.params.id, "Active"], (err, followers) => {
                clientDB.all(`SELECT history.level, history.date, history.score FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.params.id} ORDER BY history.date DESC`, [], (err, history) => {
                    res.render('private/profile', { user: user, history: history, leaderboard: leaderboard, followers: followers, current_user: req.user.id })
                })
            })
        })
    })
})

app.get('/play/:id', checkAuthenticated, (req, res) => { // to add checkAuthenticated
    gameDB.get(`SELECT * from levels WHERE airport_icao = "${req.params.id}";`, [], (err, level) => {
        gameDB.all('SELECT * from airlines LEFT JOIN airframes ON airlines.airframe = airframes.id;', [], (err, plane_data) => {
            res.render('private/play.ejs', { data: level, plane_data: plane_data });
        })
    })
})

app.get('/levels', checkAuthenticated, (req, res) => { // to add checkAuthenticated
    gameDB.all('SELECT airport_name, airport_icao, text_waffle, text_instructions, image_reference, author FROM levels', [], (err, levels) => {
        res.render('private/levels.ejs', { levels: levels })
    })
})

app.get('/play-ended', checkAuthenticated, (req,res) => {
    clientDB.get('SELECT points FROM users WHERE id = ?', req.user.id, (err, row) => {
        clientDB.all('UPDATE users SET points = ? WHERE id = ?', parseInt(row.points) + parseInt(req.query.score), req.user.id, err => { if(err) throw err }) 
    })
    clientDB.get(`SELECT * FROM history WHERE personID = ${req.user.id} ORDER BY score DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET best_played = '${row.level}' WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err }) // undefined FIX THIS
    })
    clientDB.get(`SELECT * FROM history WHERE personID = ${req.user.id} ORDER BY date DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET last_played = '${row.level}' WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err }) // undefined FIX THIS
    })
    clientDB.all(`INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`, [], err => {if(err) throw err})
    
    if(req.query.score >= 0) {
        clientDB.all('SELECT * FROM leaderboard WHERE personID = ?;', req.user.id, (err, rows) => {
            if(rows) clientDB.all('DELETE leaderboard WHERE personID = ?', rows.personID, (err, row) => { if(err) throw err })
            clientDB.all(`INSERT INTO leaderboard(name, date, score, level, personID) VALUES('${req.user.name}', '${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`, [], err => { 
                if(!err) res.redirect(308, '/leaderboard')
            })
        })
    } else {
        res.redirect(308, '/leaderboard')
    }

    gameDB.all('SELECT image_reference FROM levels WHERE airport_name=?', req.query.level, (err, image) => {
        res.render('private/terminate_play.ejs', { level: req.query.level, image: image, score: req.query.score, time: req.query.time, reason: req.query.reason })
    })
})

// FROM HERE

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/login');
    });
})

app.get('/error', (req, res) => {
    if(req.query.from == 'profile') res.render('private/error', { message: "user"})
    if(req.query.from == 'notfound') res.render('private/error', { message: "page" })
    if(req.query.from == 'level') res.render('private/error', { message: "level" })
})

// Get date now and format it to custom
function formatTime() {
    const date = new Date();
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`
    const hours = date.getHours()
    const mins = `${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return `${day} ${hours}:${mins}`
}

// checking if current session is active
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return next() }
    res.redirect(`/login?message=repeat`)
}

// checking if theres a session
function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return res.redirect('/library') }
    next()
}

app.listen(4000);