const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const clientDB = new sqlite3.Database('../db/data.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })
const gameDB = new sqlite3.Database('../db/game.db', sqlite3.OPEN_READWRITE, err => { if(err) throw err })

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
    res.render('login');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/library',
        failureRedirect: `/login`,
        failureFlash: true
}));

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup', { reason: req.query.message });
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

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/library', checkAuthenticated, (req, res) => {
    gameDB.all('SELECT * FROM levels', [], (err, levels) => {
        res.render('library', {user: req.user, levels: levels, message: req.query.message });
    })
})

app.post('/search/:group', checkAuthenticated, (req, res) => {
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
        res.redirect(`/search/${req.params.group}?query=${words.toString().replace(',', ' ')}`)
    }
})

app.get('/search/:group', checkAuthenticated, (req, res) => {
    let query
    try { query = req.query.query } catch { query = 'none' }
    if(req.params.group == 'people') {
        if(req.query.query == 'All') {
            clientDB.all('SELECT users.id, users.name, users.username, users.pfp FROM users', [], (err, users) => {
                res.render('search.ejs', { query: query, foundUsers: users, group: req.params.group, user_id: req.user.id })
            }) 
        } else {
            clientDB.all(`SELECT users.id, users.name, users.username, users.pfp FROM users WHERE users.username LIKE '%${req.query.query}%' OR users.name LIKE '%${req.query.query}%'`, [], (err, users) => {
                res.render('search.ejs', { query: query, foundUsers: users, group: req.params.group, user_id: req.user.id })
            })
        }
    }

    if(req.params.group == 'levels') {
        if(req.query.query == 'All') {
            gameDB.all('SELECT airport_name, image_reference FROM levels', [], (err, levels) => {
                res.render('search.ejs', { query: query, foundLevels: levels, group: req.params.group })
            })

        } else {
            gameDB.all(`SELECT airport_name, image_reference FROM levels WHERE airport_name LIKE '%${req.query.query}%'`, [], (err, levels) => {
                res.render('search.ejs', { query: query, foundLevels: levels, group: req.params.group })
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

app.get("/profile/:id", checkAuthenticated, (req, res) => {
    if(req.params.id == 'my-account') req.params.id = req.user.id
    clientDB.get(`SELECT id, name, username, pfp FROM users WHERE id = ${req.params.id}`,(err, user) => {
        clientDB.all(`SELECT history.id, history.level, history.date, history.score FROM history LEFT JOIN users ON history.personID = users.id WHERE users.id = ${req.params.id} ORDER BY history.date DESC`, [], (err, joins) => { 
            if(user != null) {
                clientDB.all(`SELECT * FROM leaderboard WHERE personID = ${req.params.id}`, [], (err, leaderboard) => {
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
                            clientDB.all('SELECT friends.lead_user, friends.passive_user, friends.status, friends.creation_date, users.username, users.name, users.pfp FROM users LEFT JOIN friends ON users.id = friends.passive_user WHERE friends.lead_user = ? AND friends.status = ?', [req.params.id, "Requested"], (err, requested_followers) => {
                                clientDB.all('SELECT friends.lead_user, friends.passive_user, friends.status, friends.creation_date, users.username, users.name, users.pfp FROM users LEFT JOIN friends ON users.id = friends.lead_user WHERE friends.passive_user = ? AND friends.status = ?', [req.params.id, "Requested"], (err, follower_requests) => {
                                    clientDB.all(`SELECT friends.passive_user, friends.status, friends.creation_date, users.username, users.name, users.pfp FROM users LEFT JOIN friends ON users.id = friends.passive_user WHERE friends.lead_user = ? AND friends.status = ?`, [req.params.id, "Active"], (err, following) => {
                                        clientDB.all(`SELECT friends.lead_user, friends.status, friends.creation_date, users.username, users.name, users.pfp FROM users LEFT JOIN friends ON users.id = friends.lead_user WHERE friends.passive_user = ? AND friends.status = ?`, [req.params.id, "Active"], (err, followers) => {    
                                            console.log(following)
                                            res.render('profile', { load_user: user, current_user: req.user, history: joins, last: lastDB, best: bestDB, leaderboard_entry: leaderboard, leaderboard_length: entries.length,
                                                id_types: ['Level', 'Date', 'Score'], error: req.query.error, message: req.query.message, levels: levels, requested_followers: requested_followers, follower_requests: follower_requests, followers: followers, following: following })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            } else {
                res.redirect(308, '/error?from=profile')
            }
        })
    })
}) 

app.post('/add_friend', checkAuthenticated, (req,res) => {
    clientDB.get('SELECT id from users where id = ?', req.query.id, (err, user) => {
        clientDB.all("INSERT INTO friends(lead_user, passive_user, creation_date, status) VALUES(?, ?, DATETIME('now'), 'Requested');", [req.user.id, req.query.id], (err, row) => {
            res.redirect('/search/people?query=')
        })
    })
})

app.get('/accept_friend', checkAuthenticated, (req,res) => {
    clientDB.all('UPDATE friends SET status = ? WHERE passive_user = ? AND lead_user = ?', ['Active', req.query.passive, req.query.active], (err) => {
        res.redirect('/profile/my-account')
    })
})

app.get('/remove_friend', checkAuthenticated, (req, res) => {
    clientDB.all('DELETE FROM friends WHERE lead_user = ? AND passive_user = ?', [req.query.active, req.query.passive], () => {
        res.redirect('/profile/my-account')
    })
})

app.post('/change_pfp', checkAuthenticated, (req,res) => {
    if(isImage(req.body.url)) {
        clientDB.run(`UPDATE users SET pfp = '${req.body.url}' WHERE id = ${req.user.id}`, [], err => {
            if(!err) res.redirect('/profile?id=current&message=success')
        })
    } else {
        res.redirect('profile/my-account?message=fail')
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