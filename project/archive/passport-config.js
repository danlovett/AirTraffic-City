function initPassport(passport, LocalStrategy, clientDB, bcrypt, fs) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        clientDB.get('SELECT * FROM users WHERE username = ?', username, async (err, row) => {
            if (!row) return done(null, false, { message: 'Incorrect username. Try again' })
            if(row == null) return done(null, false);
            try {
                if(await bcrypt.compare(password, row.password)) {
                    return done(null, row)
                } else {
                    return done(null, false, { message: 'Incorrect password. Try again' })
                }
            } catch (err) { return done(null, false, { message: 'An error occured whilst accessing the database. Try again later.'}) }
        });
    }))
    
    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })
    
    passport.deserializeUser((id, done) => {
        clientDB.get('SELECT * FROM users WHERE id = ?', id, (err, row) => {
            if (!row) return done(null, false);
            fs.writeFile('../db/currentUser.json', `${JSON.stringify(row.pfp)}`, err => {
                if (err) throw err
            })
            return done(null, row);
        });
    })
}

module.exports = initPassport

