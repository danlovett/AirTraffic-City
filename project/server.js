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

app.get('/board', checkAuthenticated, (req, res) => {
    let entries = []
    
    // get the right database
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
      
        if(err) throw err
        
        db.all(`SELECT * FROM ${req.query.destination}`, [], (rows, err) => {
            if(rows != null) {
                rows.forEach(row => {
                    entries.push({name: row["name"], date: row["date"], 
                    score: row["score"], errors: row["errors"], level: row["level"]})
                })
                entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));
            }
            
            fs.writeFile(`./db/${req.query.destination}.json`, `{"entries": ${JSON.stringify(entries)}}`, err => {
                if(err) throw err
            })

        })

    });

    res.render('board');
})

app.get('/profile', checkAuthenticated, (req, res) => {
    res.render('profile', {user: req.user})
})

app.get('/results', checkAuthenticated, (req, res) => {
    let leaderboard_query = `INSERT INTO "leaderboard" (name, date, score, errors, level, personID) VALUES("${req.user.name}", DATE('now'), ${req.query.score}, ${req.query.errors}, '${req.query.level}, ${req.user.id}');`
    let history_query = `INSERT INTO "history" (level_name, date, score, errors, personID) VALUES("${req.query.level}", DATE('now'), ${req.query.score}, ${req.query.errors}, ${req.user.id});`
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
        db.all(leaderboard_query, [], err => { if(err) throw err })
        db.all(history_query, [], err => { if(err) throw err })
    })
    res.redirect(308, `/board?destination=${req.query.redirect}`)
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
                getBoard(req.query.redirect, null)
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

function getBoard(destination) {
    // declare array to push entries of each queried row using sqlite3
    let entries = []
    
    // get the right database
    const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
      
        if(err) throw err
        
        db.all(`SELECT * FROM ${destination}`, [], (rows, err) => {
            if(err) throw err
            rows.forEach(row => {
                entries.push({name: row["name"], date: row["date"], 
                score: row["score"], errors: row["errors"], level: row["level"]})
            })
            entries.sort((a,b) => (b.score/b.errors) - (a.score/a.errors));

            fs.writeFile(`./db/${destination}.json`, `{"entries": ${JSON.stringify(entries)} }`, err => {
                if(err) throw err
            })
        })

    });

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
