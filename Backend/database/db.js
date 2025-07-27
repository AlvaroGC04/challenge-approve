const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');


const DB_PATH = path.join(dataDir, 'approvals.db');


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Directorio de datos creado para la DB en: ${dataDir}`);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        
        console.error('Error al conectar a la base de datos:', err.message);
    } else {

        console.log('Conectado a la base de datos SQLite en:', DB_PATH);
        db.run(`CREATE TABLE IF NOT EXISTS requests (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            requester TEXT NOT NULL,
            approver TEXT NOT NULL,
            request_type TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT,
            updated_at TEXT,
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