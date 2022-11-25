const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })
const fs = require('fs'); 

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
    secret: 'secret',
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
        db.all(sql, [], err => { if(err) throw err } )
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/library', checkAuthenticated, (req, res) => {
    res.render('library', {user: req.user});
})

app.get('/leaderboard', checkAuthenticated, (req, res) => {
    let entries = []

    db.all(`SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10;`, [], (err, rows) => {
        if(rows != null) {
            rows.forEach(row => entries.push({name: row["name"], date: row["date"], score: row["score"], level: row["level"], id: row["personID"]}))
        }
        entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));
        
        fs.writeFile(`./db/localStorage/leaderboard.json`, `{"entries": ${JSON.stringify(entries)}}`, err => {
            if(err) throw err
        })
    })

    res.render('leaderboard');
})

app.get('/profile', checkAuthenticated, (req, res) => {
    if(req.query.id == 'current') req.query.id = req.user.id

    db.get(`SELECT * FROM users WHERE id = ${req.query.id}`, [], (err, user) => { 
        db.all(`SELECT * FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.query.id} ORDER BY history.date DESC`, [], (err, joins) => { 
            if(err) throw err
            if(user != null) {      
                db.all(`SELECT * FROM leaderboard WHERE personID = ${user["id"]}`, [], (err, leaderboard) => {
                    fs.writeFile(`./db/localStorage/history/${user["id"]}.json`, `{"entries": ${JSON.stringify(joins)}, "leaderboard_entry": ${JSON.stringify(leaderboard == null ? 'undefined' : leaderboard)}}`, err => {
                        if(err) throw err
                    })
                    res.render('profile', { load_user: user, current_user: req.user, history: joins, last: joins.sort( (a,b) => a.date.split(' ')[1] - b.date.split(' ')[1] )[0], best: joins.sort( (a,b) => b.score - a.score )[0], leaderboard_entry: leaderboard, id_types: ['Level', 'Date', 'Score'] })
                })
            } else {
                res.redirect(308, '/error?from=profile')
            }
        })
        if(err) throw err
    })
}) 

app.get('/usr_leaderboard_submit', checkAuthenticated, (req, res) => { 
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        let history_query = `INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`
        db.all(history_query, [], err => {
            if(err) throw err
        })

        let SQL_update_user = `UPDATE users SET last_played = "${req.query.level}" WHERE id = ${req.user.id}`
        db.all(SQL_update_user, [], err => {
            if(err) throw err
        })
    
        let leaderboard_query = `INSERT INTO leaderboard(name, date, score, level, personID) VALUES('${req.user.name}', '${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`
        db.all(leaderboard_query, [], err => { 
            if(err) res.redirect(308, `/leaderboard?err=exists`)
            if(!err) res.redirect(308, '/leaderboard')
        })
    })
}) 

app.get('/usr_history_submit', checkAuthenticated, (req, res) => {
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        // add to history
        db.all(`INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`, [], err => {
            if(err) throw err
        })

        // update last play
        db.all(`UPDATE users SET last_played = "${req.query.level}" WHERE id = ${req.user.id}`, [], err => {
            if(err) throw err
        })

        // update best play
        db.get(`SELECT * FROM history WHERE history.personID = ${req.user.id} ORDER BY history.score DESC;`, [], (err, row) => {
            db.all(`UPDATE users SET best_played = "${row.level}" WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err; if(!err) res.redirect(308, '/profile?id=current') })
        })
    })
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

app.get('/clear_db', checkAuthenticated, (req, res) => {
    db.all(`DELETE FROM leaderboard;`, [], err => {
        // error? throw it mate
        if(err) {
            throw err
        } else {
            res.redirect(308, '/library?success')
        }
    })
})

app.get('/delete_leaderboard', checkAuthenticated, (req, res) => {
    db.run(`DELETE FROM leaderboard WHERE personID = ?;`, req.user.id, err => {
        if(err) throw err
        res.redirect(308, '/profile?id=current&leaderboard=success')
    })
})
app.get('/delete_your_history', checkAuthenticated, (req, res) => {
    db.run(`DELETE FROM history WHERE personID = ?;`, req.user.id, err => { if(err) throw err })
    db.run(`UPDATE users SET last_played = 'null', SET best_played = 'null', WHERE id = ?;`, req.user.id, err => {
        res.redirect(308, '/profile?id=current')
    })
    
})

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
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
    const mins = date.getMinutes()
    return `${day} ${hours}:${mins}`
}

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect(`/login?${CryptoJS.AES.encrypt("noAuth", 'authentication-error')}`)
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/library')
    }
    next()
}

app.listen(4000);