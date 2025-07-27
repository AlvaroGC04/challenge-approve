const express = require('express');
const app = express();
const db = require('./database/db');
const { v4: uuidv4 } = require('uuid'); // Generates uuid
const cors = require('cors');
const PORT = process.env.PORT || 3000;


app.use(express.json());
//to avoid fetching errors due to http-server.
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

// server test
app.get('/', (req, res) => {
    res.send('¡Servidor de Aprobaciones funcionando!');
});

//to avoid server errores between back and frontend
app.get('/requests', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener las solicitudes:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor al obtener las solicitudes.' });
        }
        res.status(200).json(rows);
    });
});

// create a request
app.post('/requests', (req, res) => {
    const { title, description, requester, approver, request_type } = req.body;

    // data validation
    if (!title || !description || !requester || !approver || !request_type) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    const id = uuidv4(); // creates a new uuid
    const status = 'pending'; // initial status
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const comments = 'Solicitud creada.'; // comment

    const stmt = db.prepare(`INSERT INTO requests (id, title, description, requester, approver, request_type, status, created_at, updated_at, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(id, title, description, requester, approver, request_type, status, createdAt, updatedAt, comments, function(err) {
        if (err) {
            console.error('Error al insertar solicitud:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor al crear la solicitud.' });
        }
        res.status(201).json({ message: 'Solicitud creada exitosamente', id: id, request: { id, title, description, requester, approver, request_type, status, createdAt, updatedAt, comments } });
    });
    stmt.finalize();
});

app.get('/requests/:id', (req, res) => {
    const { id } = req.params; //getting the id from URL

    db.get(`SELECT * FROM requests WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error('Error al obtener solicitud por ID', err.message);
            return res.status(500).json({ error: 'Error interno del servidor al obtener la información'})
        }
        if (!row) {
            return res.status(400).json({ error: 'Solicitud no encontrada'});
        }
        res.status(200).json(row)
    });
});

app.patch('/requests/:id', (req,res) =>{ // CAMBIO 1: AGREGAR LA 'S'
    const { id } = req.params;
    const { status, comment } = req.body; // status and comment are expected.
    console.log('Status recibido: ', status); //debugging
    console.log('Comment recibido: ', comment); //debugging
    const updatedAt = new Date().toISOString();

    //validation flow (Approved or Rejected)
    if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(400).json({error: 'El estado debe ser "approved" o "rejected"'});
    }
    //building
    let updateFields = 'status = ?, updated_at = ?';
    let params = [status, updatedAt]

    if (comment !== undefined) {
        updateFields += ', comments = ?';
        params.push(comment); // CAMBIO 3: USAR 'comment' (singular) si quieres que se guarde
    }

    //Add ID to perform query sentences
    params.push(id);

    db.run(`UPDATE requests SET ${updateFields} WHERE id = ?`, params, function(err){ // CAMBIO 2: AGREGAR LA 'S'
       if (err) {
        console.error('Error al actualizar la solicitud:', err.message);
        return res.status(500).json({error: 'Error interno del servidor al actualizar la solicitud'});
       }
       if (this.changes === 0){ //if no row was modified
        return res.status(404).json({message: 'Solicitud no encontrada'});
       }
       res.status(200).json({ message: `Solicitud ${status} exitosamente`, changes: this.changes });
    });
});

// run server
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
//for testing pourposes.
module.exports = app;