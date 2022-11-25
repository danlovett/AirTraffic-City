const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs'); 

function initPassport(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        let user
        const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
            db.get('SELECT * FROM users WHERE username = ?', username, async (err, row) => {
                if (!row) return done(null, false);
                user = row
                if(user == null) return done(null, false, { message: 'No user with that email' })
            
                // password stuff
                try {
                    if(await bcrypt.compare(password, user.password)) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Password incorrect' })
                    }
                } catch (err) {
                    return done(err)
                }
            });
        })
    
    }))
    
    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })
    
    passport.deserializeUser((id, done) => {
        const db = new sqlite3.Database('./db/data.db', sqlite3.OPEN_READWRITE, err => {
            db.get('SELECT * FROM users WHERE id = ?', id, (err, row) => {
                if (!row) return done(null, false);
                fs.writeFile('./db/currentUser.json', `{"user":${JSON.stringify(row)}}`, err => {
                    if(err) throw err
                })
                return done(null, row);
            });
        })
    })
}

module.exports = initPassport