// USER CONFIG of database
// GET LOGIN DETAILS by parsing in functions
// SET UP NEW USERS by parsing data in function as args
// FUTURE: delete users

// set up the module and assign to const
const sqlite3 = require('sqlite3').verbose();

// get the right database
const db = new sqlite3.Database('../../config/user/data.db', sqlite3.OPEN_READWRITE, err => {
  if(err) throw err;
});

// set the query
let sql = 'SELECT * FROM users'
// let sql = 'INSERT INTO users(username, first_name, last_name, email_address, password, pfp, skill_level, last_played, best_played) VALUES("danlovett1", "Daniel", "Lovett", "dlovett@test.com", "123456", "test", 332, "undefined", "undefined")';

// do this to all the database -> parses sql query, error, and rows to use
db.all(sql, [], (err, rows) => {
  // error? throw it mate
  if(err) throw err;

  // select all roaws and do stuff with it
  rows.forEach(row => {
    // log it mannn -> DEV ONLY for now
    console.log(row)
  })
})