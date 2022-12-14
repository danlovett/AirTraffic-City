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

app.get('/login', checkNotAuthenticated, (req, res, next) => {
    res.render('login', {message: req.query.message});
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/library',
        failureRedirect: `/login`,
        failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register', { reason: req.query.message });
});

app.post('/register', checkNotAuthenticated, async (req,res) => {
    if(req.body.password.length < 8) {
        res.redirect('/register?message=password_length')
        return
    } 
    if(!req.body.name.includes(' ')) {
        res.redirect('/register?message=full_name')
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

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/library', checkAuthenticated, (req, res) => {
    gameDB.all('SELECT * FROM levels', [], (err, levels) => {
        res.render('library', {user: req.user, levels: levels, message: req.query.message });
    })
})

app.post('/search', checkAuthenticated, (req, res) => {
    if(req.body.query.includes('?') || req.body.query.includes('=')) {
        res.redirect('/search?message=fail')
    } else { 
        let words
        try { words = req.body.query.split(' ') } catch { words = req.body.query }
        if(words != '') {
            for (let i = 0; i < words.length; i++) {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }
        }
        res.redirect(`/search?q=${words.toString().replace(',', ' ')}&group=${req.query.group}`)
    }
})

app.get('/search', checkAuthenticated, (req, res) => {
    let query
    try { query = req.query.q } catch { query = 'none' }
    if(req.query.group == 'people') {
        if(req.query.q == 'All') {
            clientDB.all('SELECT id, name, username, pfp FROM users', [], (err, users) => {
                res.render('search.ejs', { query: query, foundUsers: users, group: req.query.group })
            }) 
        } else {
            clientDB.all(`SELECT id, name, username, pfp FROM users WHERE username LIKE '%${req.query.q}%' OR name LIKE '%${req.query.q}%'`, [], (err, users) => {
                res.render('search.ejs', { query: query, foundUsers: users, group: req.query.group })
            })
        }
    }

    if(req.query.group == 'levels') {
        if(req.query.q == 'All') {
            gameDB.all('SELECT airport_name, image_reference FROM levels', [], (err, levels) => {
                res.render('search.ejs', { query: query, foundLevels: levels, group: req.query.group })
            })

        } else {
            gameDB.all(`SELECT airport_name, image_reference FROM levels WHERE airport_name LIKE '%${req.query.q}%'`, [], (err, levels) => {
                res.render('search.ejs', { query: query, foundLevels: levels, group: req.query.group })
            })
        }
    }
})

app.get('/create_layout', isAdmin, (req, res) => {
    res.render('createLayout')
})

app.get('/create_airframe', isAdmin, (req, res) => {
    res.render('/admin/creatorAirframe')
})

app.get('/leaderboard', checkAuthenticated, (req, res) => {
    clientDB.all(`SELECT name, date, score, level, personID FROM leaderboard ORDER BY score DESC LIMIT 10;`, [], (err, rows) => {
        res.render('leaderboard', { top_entries: rows, id_types: ['Name', 'Date', 'Score', 'Level'], message: req.query.message });
    })

})

app.get('/profile', checkAuthenticated, (req, res) => {
    if(req.query.id == 'current') req.query.id = req.session.passport.user
    clientDB.get(`SELECT id, name, username, pfp FROM users WHERE id = ${req.query.id}`, [], (err, user) => { 
        clientDB.all(`SELECT history.id, history.level, history.date, history.score FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.query.id} ORDER BY history.date DESC`, [], (err, joins) => { 
            if(user != null) {
                clientDB.all(`SELECT * FROM leaderboard WHERE personID = ${user["id"]}`, [], (err, leaderboard) => {
                    gameDB.all('SELECT airport_name, image_reference FROM levels', [], (err, levels) => {
                        let lastDB = joins.sort( (a,b) => a.date.split(' ')[1] - b.date.split(' ')[1] )[0]
                        let bestDB = joins.sort( (a,b) => b.score - a.score )[0]
                        levels.forEach(level => {
                            try {
                                if(level["airport_name"] == lastDB.level) lastDB["image_reference"] = level["image_reference"]
                                if(level["airport_name"] == bestDB.level) bestDB["image_reference"] = level["image_reference"]
                                if(level["airport_name"] == leaderboard[0]["level"]) leaderboard[0]["image_reference"] = level["image_reference"]
                            } catch { 
                                
                            }
                        })
                        clientDB.all('SELECT id FROM leaderboard', [], (err, entries) => {
                            res.render('profile', { load_user: user, current_user: req.user, history: joins, last: lastDB, best: bestDB, leaderboard_entry: leaderboard, leaderboard_length: entries.length,
                                id_types: ['Level', 'Date', 'Score'], error: req.query.error, message: req.query.message, levels: levels })
                        })
                    })
                })
            } else {
                res.redirect(308, '/error?from=profile')
            }
        })
    })
}) 

app.get('/add_friend', checkAuthenticated, (req,res) => {
    clientDB.get('SELECT id, name, username, pfp FROM users WHERE id = ?', req.query.id, (err, user) => {
        res.render('addFriend', { addUser: user })
    })
})

app.post('/change_pfp', checkAuthenticated, (req,res) => {
    if(isImage(req.body.url)) {
        clientDB.run(`UPDATE users SET pfp = '${req.body.url}' WHERE id = ${req.user.id}`, [], err => {
            if(!err) res.redirect('/profile?id=current&message=success')
        })
    } else {
        res.redirect('profile?id=current&message=fail')
    }
})

app.get('/add_temp_leaderboard', checkAuthenticated, (req, res) => {
    clientDB.get('SELECT leaderboard_attempt FROM users WHERE id = ?', req.user.id, (err, row) => {
        let entries = JSON.stringify(row).split('"')[3].split(',')
        let name = entries[0], date = entries[1], score = entries[2], level = entries[3]
        if(score >= 0) {
            clientDB.all(`INSERT INTO leaderboard (name, date, score, level, personID) VALUES ('${name}', '${date}', ${score}, '${level}', ${req.user.id})`, [], err => {
                removeLeaderboardAttempt(req.user.id)
                if(err) throw err
                if(!err) res.redirect('/leaderboard?message=success')
            })
        } else {
            res.redirect(308, '/leaderboard?message=oor')
        }
    })
})

app.get('/usr_leaderboard_submit', checkAuthenticated, (req, res) => { 
    updateEntries(req)
    if(req.query.score >= 0) {
        clientDB.all('SELECT id FROM leaderboard;', [], (err, rows) => {
            if(rows.length < 3) {
                clientDB.all(`INSERT INTO leaderboard(name, date, score, level, personID) VALUES('${req.user.name}', '${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`, [], err => { 
                    if(err) {
                        clientDB.all(`UPDATE users SET leaderboard_attempt = "${req.user.name},${formatTime()},${req.query.score},${req.query.level}" WHERE id = ${req.user.id} `)
                        res.redirect(308, `/leaderboard?message=name_constrain`)
                    }
                    if(!err) res.redirect(308, '/leaderboard?message=success')
                })
            } else {
                clientDB.all(`UPDATE users SET leaderboard_attempt = "${req.user.name},${formatTime()},${req.query.score},${req.query.level}" WHERE id = ${req.user.id} `)
                res.redirect(308, '/leaderboard?message=oor')
            }
        })
    } else {
        res.redirect(308, '/leaderboard?message=score_constrain')
    }
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
    updateEntries(req)
    res.redirect(308, '/profile?id=current')
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
    gameDB.get(`SELECT * FROM levels WHERE airport_name = "${req.query.name}"`, [], (err, row) => {
        if(row == undefined) {
            res.redirect(308, 'error?from=level')
        } else {
            res.render('level', { data: row, displayType: req.query.type })
        }
    })
})

app.get('/gameEnded', checkAuthenticated, (req, res) => {
    clientDB.get('SELECT points FROM users WHERE id = ?', req.user.id, (err, row) => {
        clientDB.all('UPDATE users SET points = ? WHERE id = ?', parseInt(row.points) + parseInt(req.query.score), req.user.id, err => { if(err) throw err }) 
    })
    gameDB.get(`SELECT * FROM levels WHERE airport_name = '${req.query.level}'`, [], (err, row) => {
        res.render('endgame', { username: req.user.name, level: row, score: req.query.score, time: req.query.time, reason: req.query.reason });
    })
})

app.get('/game', checkAuthenticated, (req, res) => {
    removeLeaderboardAttempt(req.user.id)
    gameDB.get(`SELECT * from levels WHERE airport_name = '${req.query.level}';`, [], (err, level) => {
        gameDB.all('SELECT * from airlines LEFT JOIN airframes ON airlines.airframe = airframes.id;', [], (err, plane_data) => {
            res.render('game', { data: level, plane_data: plane_data });
        })
    })
})

app.get('/clear_leaderboard', isAdmin, (req, res) => {
    clientDB.all(`DELETE FROM leaderboard;`, [], () => {
        res.redirect(308, '/library?message=success')
    })
})

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err) }
        res.redirect('/login');
    });
})

app.get('/error', (req, res) => {
    if(req.query.from == 'profile') res.render('errorDocument', { message: "User"})
    if(req.query.from == 'notfound') res.render('errorDocument', { message: "Page" })
    if(req.query.from == 'level') res.render('errorDocument', { message: "Level" })
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

function isAdmin(req, res, next) {
    if(req.user.is_admin) { return next() }
    res.redirect('library?message=access_denied')
}

// basic sql execution. Nothing returned so just INSERT
function SQLUpdateInsert(sql_statement) {
    clientDB.all(sql_statement, [], err => { if(err) throw err })
}

function updateEntries(req) {
    SQLUpdateInsert(`INSERT INTO history (date, score, level, personID) VALUES('${formatTime()}', ${req.query.score}, '${req.query.level}', ${req.user.id});`)
    clientDB.get(`SELECT level, score FROM history WHERE personID = ${req.user.id} ORDER BY score DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET best_played = "${row.level}" WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err }) // undefined FIX THIS
    })
    clientDB.get(`SELECT level, date FROM history WHERE personID = ${req.user.id} ORDER BY date DESC;`, [], (err, row) => {
        clientDB.all(`UPDATE users SET last_played = "${row.level}" WHERE id = ${req.user.id}`, [], (err) => { if(err) throw err }) // undefined FIX THIS
    })
}

function isImage(url) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

function removeLeaderboardAttempt(id) {
    clientDB.all('UPDATE users SET leaderboard_attempt = null WHERE id = ?', id, err => { if(err) throw err })
}

function resetPlays(id) {
    clientDB.all('UPDATE users SET last_played = null WHERE id = ?', id, err => { if(err) throw err })
    clientDB.all('UPDATE users SET best_played = null WHERE id = ?', id, err => { if(err) throw err })
}

app.listen(4000);