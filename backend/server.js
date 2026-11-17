const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sigci_db'
});

db.connect(err => {
    if(err) { console.error('Error conectando a la BD:', err); return; }
    console.log('Conectado a MySQL - sigci_db');
});

app.get('/api/ventas', (req, res) => {
    db.query("SELECT * FROM ventas", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/api/ventas', (req, res) => {
    const { codigo_venta, bus, ruta, turno, boletos, ingresos, estado } = req.body;
    
    // Imprimimos en la consola del PC lo que está llegando del celular para revisar
    console.log("Recibiendo venta:", req.body);

    // 7 columnas = 7 signos de interrogación (?)
    const query = "INSERT INTO ventas (codigo_venta, bus, ruta, turno, boletos, ingresos, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(query, [codigo_venta, bus, ruta, turno, boletos, ingresos, estado], (err, results) => {
        if (err) {
            console.error("Error exacto en MySQL:", err); // Esto te dirá exactamente por qué falla
            return res.status(500).json({ error: "Falla al guardar en la base de datos" });
        }
        res.json({ mensaje: "Venta registrada con éxito", id: results.insertId });
    });
});

// Así se verá tu servidor:
const query = `
  SELECT ventas.*, usuarios.nombre AS nombre_conductor 
  FROM ventas 
  LEFT JOIN usuarios ON ventas.conductor_id = usuarios.id
`;

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});