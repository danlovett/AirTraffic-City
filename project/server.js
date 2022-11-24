const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs'); 

const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt')

const passport = require('passport')

const flash = require('express-flash')
const session = require('express-session')

const initPassport = require('./passport-config');
const { profile } = require('console');
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
let users = []

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
        const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
            db.all(sql, [], err => { if(err) addlogging(err) } )
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/library', checkAuthenticated, (req, res) => {
    res.render('library', {pfp: req.user.pfp});
})

app.get('/leaderboard', checkAuthenticated, (req, res) => {
    let entries = []
    
    // get the right database
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
      
        if(err) throw err
        
        db.all(`SELECT * FROM leaderboard;`, [], (err, rows) => {
            if(rows != null) {
                rows.forEach(row => entries.push({name: row["name"], date: row["date"], score: row["score"], level: row["level"], id: row["personID"]}))
            }
            entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));
            
            fs.writeFile(`./db/leaderboard.json`, `{"entries": ${JSON.stringify(entries)}}`, err => {
                if(err) throw err
            })
        })
    });

    res.render('leaderboard');
})

app.get('/profile', checkAuthenticated, (req, res) => {
    let entries = []
    let profile_onboarding = {}
    if(req.query.id == 'current') req.query.id = req.user.id

    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        db.get(`SELECT * FROM users WHERE id = ${req.query.id}`, [], (err, user) => { 
            db.get(`SELECT * FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.query.id}`, [], (err, joins) => { 
                if(err) throw err
                if(joins != null) {
                    if(joins.length > 1) {
                        joins.forEach(join => entries.push({level: join["level"], date: join["date"], score: join["score"], id: join["personID"]}))
                    } else {
                        entries.push({level: joins["level"], date: joins["date"], score: joins["score"], id: joins["personID"]})
                    }
                }
                if(user != null) {
                    profile_onboarding["id"] = user["id"]
                    profile_onboarding["name"] = user["name"]
                    profile_onboarding["username"] = user["username"]
                    profile_onboarding["pfp"] = user["pfp"]
                    fs.writeFile(`./db/history/${user["id"]}.json`, `{"entries": ${JSON.stringify(entries)}}`, err => {
                        if(err) throw err
                    })
                    res.render('profile', { user: profile_onboarding, id: req.user.id })
                } else {
                    res.redirect(308, '/error?from=profile')
                }
            })
            if(err) throw err
        })
    })

}) 

app.get('/usr_leaderboard_submit', checkAuthenticated, (req, res) => {
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        
        let history_query = `INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`
        db.all(history_query, [], err => {
            if(err) throw err
        })

        let leaderboard_query = `INSERT INTO leaderboard(name, date, score, level, personID) VALUES('${req.user.name}', '${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`
        db.all(leaderboard_query, [], err => { 
            if(err) res.redirect(308, `/board?destination=${req.query.redirect}&err=exists`)
            if(!err) res.redirect(308, 'board?destination=leaderboard')
        })
        
    })
}) 

app.get('/usr_history_submit', checkAuthenticated, (req, res) => {
    let history_query = `INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        db.all(history_query, [], err => {
            if(err) throw err
            if(!err) res.redirect(308, '/library')
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
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        db.all(`DELETE FROM leaderboard;`, [], err => {
            // error? throw it mate
            if(err) {
                throw err
            } else {
                res.redirect(308, '/library?success')
            }
        })
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