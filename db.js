const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('tel.db');

db.serialize(() => {
    db.run(`
    CREATE TABLE  IF NOT EXISTS tel (
        id INTEGER PRIMARY KEY,
        time TIMESTAMP,
        number NUMERIC NOT NULL,
        name TEXT,
        detail TEXT,
        checked numeric default 0
    )
    `)
})

module.exports = db;