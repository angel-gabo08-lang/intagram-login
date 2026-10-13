const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para procesar datos JSON y permitir conexiones
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la base de datos SQLite local
const dbFile = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite correctamente.');
    }
});

// Crear la tabla "users" automáticamente si no existe
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err) => {
    if (err) {
        console.error('Error al crear la tabla:', err.message);
    } else {
        console.log('Tabla de usuarios lista.');
    }
});

// Ruta que recibe los datos del formulario y los guarda en la base de datos
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    
    db.run(query, [username, email, password], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'Error al guardar en la base de datos.' });
        }
        res.json({ 
            success: true, 
            message: '¡Datos guardados exitosamente en la base de datos!',
            userId: this.lastID 
        });
    });
});

// Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});