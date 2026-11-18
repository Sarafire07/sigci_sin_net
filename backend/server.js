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
    if (err) {
        console.error('Error conectando a la BD:', err);
        return;
    }
    console.log('Conectado a MySQL - sigci_db (Modo Relacional)');
});

// ==========================================
// 1. ENDPOINTS DE BUSES (Para App y Panel Admin)
// ==========================================

// Obtener buses activos para el selector de la App
app.get('/api/buses', (req, res) => {
    const sql = 'SELECT id, numero_bus, patente, estado FROM buses WHERE estado = "Activo" ORDER BY numero_bus ASC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Crear un nuevo bus (Lo usará el Administrador desde la Web)
app.post('/api/buses', (req, res) => {
    const { numero_bus, patente } = req.body;
    const sql = 'INSERT INTO buses (numero_bus, patente, estado) VALUES (?, ?, "Activo")';
    
    db.query(sql, [numero_bus, patente || null], (err, result) => {
        if (err) {
            console.error('Error al crear bus:', err);
            return res.status(500).json({ error: 'No se pudo registrar el bus (verifica que no esté repetido)' });
        }
        res.status(201).json({ mensaje: 'Bus agregado con éxito', id: result.insertId });
    });
});

// ==========================================
// 2. ENDPOINTS DE RUTAS
// ==========================================

// Obtener rutas activas para el selector de la App
app.get('/api/rutas', (req, res) => {
    const sql = 'SELECT id, nombre_ruta FROM rutas WHERE estado = "Activo" ORDER BY id ASC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Crear una nueva ruta desde el Panel Admin
app.post('/api/rutas', (req, res) => {
    const { nombre_ruta } = req.body;
    const sql = 'INSERT INTO rutas (nombre_ruta, estado) VALUES (?, "Activo")';
    
    db.query(sql, [nombre_ruta], (err, result) => {
        if (err) {
            console.error('Error al crear ruta:', err);
            return res.status(500).json({ error: 'No se pudo registrar la ruta' });
        }
        res.status(201).json({ mensaje: 'Ruta agregada con éxito', id: result.insertId });
    });
});

// ==========================================
// 3. ENDPOINTS DE VENTAS (Con INNER/LEFT JOIN)
// ==========================================

// Obtener historial de ventas cruzando las tablas para mostrar nombres reales
app.get('/api/ventas', (req, res) => {
    const sql = `
        SELECT 
            v.id,
            v.codigo_venta,
            IFNULL(u.nombre, 'Sin asignar') AS nombre_vendedor,
            b.patente AS patente,
            b.numero_bus AS bus,
            r.nombre_ruta AS ruta,
            v.tipo_boleto,
            v.boletos,
            v.ingresos,
            DATE_FORMAT(v.fecha_hora, '%H:%i') AS hora,
            DATE_FORMAT(v.fecha_hora, '%d-%m-%Y %H:%i') AS fecha_completa,
            v.estado
        FROM ventas v
        LEFT JOIN usuarios u ON v.vendedor_id = u.id
        INNER JOIN buses b ON v.bus_id = b.id
        INNER JOIN rutas r ON v.ruta_id = r.id
        ORDER BY v.fecha_hora DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Registrar una nueva venta desde la App Móvil
app.post('/api/ventas', (req, res) => {
    const { codigo_venta, vendedor_id, bus_id, ruta_id, tipo_boleto, boletos, ingresos, estado } = req.body;
    
    const sql = `
        INSERT INTO ventas (codigo_venta, vendedor_id, bus_id, ruta_id, tipo_boleto, boletos, ingresos, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
        sql, 
        [
            codigo_venta, 
            vendedor_id || null, 
            bus_id, 
            ruta_id, 
            tipo_boleto, 
            boletos, 
            ingresos, 
            estado || 'Sincronizado'
        ], 
        (err, result) => {
            if (err) {
                console.error('Error exacto en MySQL:', err);
                return res.status(500).json({ error: 'Falla al guardar en la base de datos' });
            }
            res.status(201).json({ mensaje: 'Venta registrada con éxito', id: result.insertId });
        }
    );
});

// ==========================================
// 4. ENDPOINTS DE USUARIOS (Login y Admin)
// ==========================================

// Obtener todos los usuarios (para la tabla del panel admin)
app.get('/api/usuarios', (req, res) => {
    const sql = 'SELECT id, nombre, username, rol FROM usuarios ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Validar login (Para la App Móvil)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const sql = 'SELECT id, nombre, username, rol FROM usuarios WHERE username = ? AND password = ?';
    
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Error en login:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                mensaje: 'Bienvenido',
                usuario: results[0]
            });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    });
});

// Crear usuario desde el Panel Administrador
app.post('/api/usuarios', (req, res) => {
    const { nombre, username, password, rol } = req.body;
    const sql = 'INSERT INTO usuarios (nombre, username, password, rol) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nombre, username, password, rol || 'Conductor'], (err, result) => {
        if (err) {
            console.error('Error al crear usuario:', err);
            return res.status(500).json({ error: 'El usuario o RUT ya se encuentra registrado' });
        }
        res.status(201).json({ mensaje: 'Usuario creado con éxito', id: result.insertId });
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});