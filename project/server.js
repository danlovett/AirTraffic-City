const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const clientDB = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })
const gameDB = new sqlite3.Database('./db/game.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })

const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')

const passport = require('passport')

const flash = require('express-flash')
const session = require('express-session')

const initPassport = require('./passport-config');
initPassport(passport)

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

app.get('/login', checkNotAuthenticated, (req, res, next) => {
    res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/library',
        failureRedirect: '/login',
        failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register');
});

app.post('/register', checkNotAuthenticated, async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const sql = `INSERT INTO users(name, username, password) VALUES ("${req.body.name}", "${req.body.email}", "${hashedPassword}")`
        clientDB.all(sql, [], err => { if(err) throw err } )
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/library', checkAuthenticated, (req, res) => {
    let levels_url = [], level_names = [], level_backgrounds = []
    clientDB.get(`SELECT best_played, last_played FROM users WHERE id = ${req.user.id}`, [], (err, plays) => {
        if(err) throw err
        gameDB.all('SELECT * FROM levels', [], (err, levels) => {
            levels.forEach(level => {
                levels_url.push(`${CryptoJS.AES.encrypt(level.airport_name, "level")}&${CryptoJS.AES.encrypt("2", "status-message")}&${CryptoJS.AES.encrypt(level.image_reference, "level-image")}`) 
                level_names.push(level.airport_name)
                level_backgrounds.push(level.image_reference)
            })
            res.render('library', {user: req.user, last_played: plays.last_played, best_played: plays.best_played, levels: levels, encrypted_url: levels_url, level_names: level_names, level_backgrounds: level_backgrounds });
        })
    })
})

app.get('/leaderboard', checkAuthenticated, (req, res) => {
    let encrypted_levels = []
    clientDB.all(`SELECT name, date, score, level, personID FROM leaderboard ORDER BY score DESC LIMIT 10;`, [], (err, rows) => {
        rows.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));
        if(rows != null) {
            rows.forEach(row => { encrypted_levels.push(`${CryptoJS.AES.encrypt(row.level, "level")}&${CryptoJS.AES.encrypt("2", "status-message")}`) })
        }
        res.render('leaderboard', { top_entries: rows, id_types: ['Name', 'Date', 'Score', 'Level'], encrypted_levels: encrypted_levels });
    })

})

app.get('/profile', checkAuthenticated, (req, res) => {
    if(req.query.id == 'current') req.query.id = req.session.passport.user
    clientDB.get(`SELECT * FROM users WHERE id = ${req.query.id}`, [], (err, user) => { 
        if(err) throw err
        clientDB.all(`SELECT * FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.query.id} ORDER BY history.date DESC`, [], (err, joins) => { 
            if(err) throw err
            if(user != null) {      
                clientDB.all(`SELECT * FROM leaderboard WHERE personID = ${user["id"]}`, [], (err, leaderboard) => {
                    leaderboard["id"] = CryptoJS.AES.encrypt(leaderboard["id"], "leaderboard-id")
                    res.render('profile', { load_user: user, current_user: req.user, history: joins, last: joins.sort( (a,b) => a.date.split(' ')[1] - b.date.split(' ')[1] )[0], best: joins.sort( (a,b) => b.score - a.score )[0], leaderboard_entry: leaderboard, id_types: ['Level', 'Date', 'Score'] })
                })
            } else {
                res.redirect(308, '/error?from=profile')
            }
        })
    })
}) 

app.get('/usr_leaderboard_submit', checkAuthenticated, (req, res) => { 
    clientSQLExecutionBasic(`INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`)
    clientSQLExecutionBasic(`UPDATE users SET last_played = "${req.query.level}" WHERE id = ${req.user.id};`)
    clientDB.get(`SELECT * FROM history WHERE personID = ${req.user.id} ORDER BY score DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET best_played = '${row.level}' WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err })
    })
    clientDB.all(`INSERT INTO leaderboard(name, date, score, level, personID) VALUES('${req.user.name}', '${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`, [], err => { 
        if(err) res.redirect(308, `/leaderboard?err=exists`)
        if(!err) res.redirect(308, '/leaderboard')
    })
}) 

app.get('/delete_leaderboard', checkAuthenticated, (req, res) => {
    clientDB.get('SELECT leaderboard.id FROM leaderboard LEFT JOIN users ON leaderboard.personID = users.id WHERE users.id = ?', req.user.id, (err, row) => {
        clientDB.all('DELETE FROM leaderboard WHERE id = ?', row.id, err => {
            if(err) throw err
        })
    })
    res.redirect('/logout')
})

app.get('/usr_history_submit', checkAuthenticated, (req, res) => {
    clientSQLExecutionBasic(`INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`)
    clientSQLExecutionBasic(`UPDATE users SET last_played = "${req.query.level}" WHERE id = ${req.user.id};`)
    clientDB.all(`SELECT * FROM history WHERE personID = '${req.user.id}' ORDER BY score DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET best_played = '${row.level}' WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err })
    })

    res.redirect(308, '/profile?id=current&updated_best_played=true')
})

app.get('/delete_history', checkAuthenticated, (req, res) => {
    clientDB.all('SELECT history.id FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ?', req.user.id, (err, rows) => {
        for(let row = 0; row < rows.length; row++) {
            clientDB.all('DELETE FROM history WHERE id = ?', rows[row].id, err => { if(err) throw err })
        }
    })
    resetPlays(req.user.id)
    res.redirect('/logout')
})

app.get('/level', checkAuthenticated, (req, res) => {
    res.render('level');
})

app.get('/gameEnded', checkAuthenticated, (req, res) => {
    res.render('endgame', { name: req.user.name });
})

app.get('/game', checkAuthenticated, (req, res) => {
    res.render('game');
})

app.get('/clear_clientDB', checkAuthenticated, (req, res) => {
    clientDB.all(`DELETE FROM leaderboard;`, [], err => {
        if(err) throw err
        res.redirect(308, '/library?result=true')
    })
})

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/');
    });
})

app.get('/error', (req, res) => {
    if(req.query.from == 'profile') res.render('errorDocument', { message: "User"})
    if(req.query.from == 'notfound') res.render('errorDocument', { message: "Page" })
})

function formatTime() {
    const date = new Date();
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`
    const hours = date.getHours()
    const mins = `${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return `${day} ${hours}:${mins}`
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return next() }
    res.redirect(`/login?${CryptoJS.AES.encrypt("noAuth", 'authentication-error')}`)
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) { return res.redirect('/library') }
    next()
}

function clientSQLExecutionBasic(sql_statement) {
    clientDB.all(sql_statement, [], err => { if(err) throw err })
}

function resetPlays(id) {
    clientDB.all('UPDATE users SET last_played = null WHERE id = ?', id, err => { if(err) throw err })
    clientDB.all('UPDATE users SET best_played = null WHERE id = ?', id, err => { if(err) throw err })
}

app.listen(4000);