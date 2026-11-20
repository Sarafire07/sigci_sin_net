const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const app = express();
app.use(cors());
app.use(express.json());

console.log('Conectado a Cloud Firestore - SIGCI (Modo Nube)');

// ==========================================
// 1. ENDPOINTS DE BUSES
// ==========================================

app.get('/api/buses', async (req, res) => {
    try {
        const snapshot = await db.collection('buses').where('estado', '==', 'Activo').get();
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => String(a.numero_bus).localeCompare(String(b.numero_bus)));
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/buses', async (req, res) => {
    try {
        const { numero_bus, patente } = req.body;
        const existe = await db.collection('buses').where('numero_bus', '==', numero_bus).get();
        if (!existe.empty) {
            return res.status(500).json({ error: 'No se pudo registrar el bus (verifica que no esté repetido)' });
        }
        const docRef = await db.collection('buses').add({
            numero_bus,
            patente: patente || null,
            estado: 'Activo'
        });
        res.status(201).json({ mensaje: 'Bus agregado con éxito', id: docRef.id });
    } catch (err) {
        res.status(500).json({ error: 'No se pudo registrar el bus' });
    }
});

// ==========================================
// 2. ENDPOINTS DE RUTAS
// ==========================================

app.get('/api/rutas', async (req, res) => {
    try {
        const snapshot = await db.collection('rutas').where('estado', '==', 'Activo').get();
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rutas', async (req, res) => {
    try {
        const { nombre_ruta } = req.body;
        const docRef = await db.collection('rutas').add({
            nombre_ruta,
            estado: 'Activo'
        });
        res.status(201).json({ mensaje: 'Ruta agregada con éxito', id: docRef.id });
    } catch (err) {
        res.status(500).json({ error: 'No se pudo registrar la ruta' });
    }
});

// ==========================================
// 3. ENDPOINTS DE VENTAS
// ==========================================

app.get('/api/ventas', async (req, res) => {
    try {
        const [ventasSnap, usuariosSnap, busesSnap, rutasSnap] = await Promise.all([
            db.collection('ventas').orderBy('fecha_timestamp', 'desc').get(),
            db.collection('usuario').get(),
            db.collection('buses').get(),
            db.collection('rutas').get()
        ]);

        const usuariosMap = {};
        usuariosSnap.forEach(d => { usuariosMap[d.id] = d.data(); });

        const busesMap = {};
        busesSnap.forEach(d => { busesMap[d.id] = d.data(); });

        const rutasMap = {};
        rutasSnap.forEach(d => { rutasMap[d.id] = d.data(); });

        const results = ventasSnap.docs.map(doc => {
            const v = doc.data();
            const usuario = usuariosMap[v.vendedor_id] || {};
            const bus = busesMap[v.bus_id] || {};
            const ruta = rutasMap[v.ruta_id] || {};

            return {
                id: doc.id,
                codigo_venta: v.codigo_venta,
                nombre_vendedor: usuario.nombre || 'Sin asignar',
                patente: bus.patente || '',
                bus: bus.numero_bus || '',
                ruta: ruta.nombre_ruta || '',
                tipo_boleto: v.tipo_boleto,
                boletos: v.boletos,
                ingresos: v.ingresos,
                hora: v.hora || '',
                fecha_completa: v.fecha_completa || '',
                estado: v.estado
            };
        });

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/ventas', async (req, res) => {
    try {
        const { codigo_venta, vendedor_id, bus_id, ruta_id, tipo_boleto, boletos, ingresos, estado } = req.body;
        const ahora = new Date();
        const pad = n => String(n).padStart(2, '0');
        const hora = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
        const fecha_completa = `${pad(ahora.getDate())}-${pad(ahora.getMonth() + 1)}-${ahora.getFullYear()} ${hora}`;

        const docRef = await db.collection('ventas').add({
            codigo_venta,
            vendedor_id: vendedor_id || null,
            bus_id,
            ruta_id,
            tipo_boleto,
            boletos,
            ingresos,
            estado: estado || 'Sincronizado',
            hora,
            fecha_completa,
            fecha_timestamp: FieldValue.serverTimestamp()
        });

        res.status(201).json({ mensaje: 'Venta registrada con éxito', id: docRef.id });
    } catch (err) {
        console.error('Error exacto en Firestore:', err);
        res.status(500).json({ error: 'Falla al guardar en la base de datos' });
    }
});

// ==========================================
// 4. ENDPOINTS DE USUARIOS
// ==========================================

app.get('/api/usuarios', async (req, res) => {
    try {
        const snapshot = await db.collection('usuario').get();
        const results = snapshot.docs.map(doc => {
            const { password, ...sinPassword } = doc.data();
            return { id: doc.id, ...sinPassword };
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const snapshot = await db.collection('usuario')
            .where('username', '==', username)
            .where('password', '==', password)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const { password: _, ...usuarioData } = doc.data();
            res.json({
                success: true,
                mensaje: 'Bienvenido',
                usuario: { id: doc.id, ...usuarioData }
            });
        } else {
            res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre, username, password, rol } = req.body;
        const existe = await db.collection('usuario').where('username', '==', username).get();
        if (!existe.empty) {
            return res.status(500).json({ error: 'El usuario o RUT ya se encuentra registrado' });
        }
        const docRef = await db.collection('usuario').add({
            nombre,
            username,
            password,
            rol: rol || 'Conductor'
        });
        res.status(201).json({ mensaje: 'Usuario creado con éxito', id: docRef.id });
    } catch (err) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
