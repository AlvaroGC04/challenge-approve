const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'approvals.db');

let db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            requester TEXT NOT NULL,
            approver TEXT NOT NULL,
            request_type TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            comments TEXT
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla requests:', err.message);
            } else {
                console.log('Tabla "requests" creada o ya existe.');
            }
        });
    }
});

module.exports = db;