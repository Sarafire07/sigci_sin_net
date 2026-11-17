import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VentasScreen() {
  const router = useRouter();

  // Estados de la venta
  const [turno, setTurno] = useState('Mañana'); // Mañana, Tarde, Noche
  const [tipoBolet, setTipoBolet] = useState('Adulto'); // Adulto, Estudiante, Tercera Edad
  const [cantidad, setCantidad] = useState(1);
  const [total, setTotal] = useState(5000);

  // Precios fijados por tipo de boleto
  const precios: { [key: string]: number } = {
    'Adulto': 5000,
    'Estudiante': 3500,
    'Tercera Edad': 2500,
  };

  // Cada vez que cambia el tipo o la cantidad, calcula el total automáticamente
  useEffect(() => {
    setTotal(precios[tipoBolet] * cantidad);
  }, [tipoBolet, cantidad]);

  // Funciones para aumentar o disminuir cantidad
  const aumentarCantidad = () => {
    if (cantidad >= 5) {
      if (Platform.OS === 'web') {
        alert('Solo se puede 5 boletos por compra');
      } else {
        Alert.alert('Límite excedido', 'Solo se puede 5 boletos por compra');
      }
      return;
    }
    setCantidad(cantidad + 1);
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  // 🟢 CORRECCIÓN: Todo el proceso de venta ahora está dentro de su función
  const handleVender = async () => {
    // 1. Generador de código alfanumérico
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigoGenerado = '';
    for (let i = 0; i < 8; i++) {
      codigoGenerado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // 2. Variables ordenadas correctamente para MySQL
    const ventaData = {
      codigo_venta: codigoGenerado,
      bus: 'BF-23',          
      ruta: 'Ovalle - La Serena', 
      turno: turno,      
      boletos: cantidad,   // <-- Ahora envía la cantidad de pasajes (ej: 1)
      ingresos: total,     // <-- Ahora envía el dinero total (ej: 5000)
      estado: "Sincronizado"
    };

    try {
      // 3. Envío al servidor Node.js
      const respuesta = await fetch('http://192.168.1.25:3000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });
      
      // 4. Si la venta es exitosa, pasamos a la pantalla de Éxito
// 4. Si la venta es exitosa, pasamos a la pantalla de Éxito convirtiendo los números a texto
      if (respuesta.ok) {
        router.push({
          pathname: '/exito',
          params: { 
            codigo: codigoGenerado,
            turno: turno,
            tipo: tipoBolet,
            cantidad: cantidad.toString(), // <-- Transformamos el número a texto
            total: total.toString()        // <-- Transformamos el número a texto
          } 
        });
      } else {
        alert("Error al guardar la venta en la base de datos.");
      }
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el PC.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* MENÚ SUPERIOR QUE REDIRIGE AL RESUMEN INDEPENDIENTE */}
      <View style={styles.menuSuperior}>
        <TouchableOpacity style={styles.botonResumenMenu} onPress={() => router.push('/resumen')}>
          <Text style={styles.textoBotonResumenMenu}>📊 RESUMEN DEL DÍA</Text>
        </TouchableOpacity>
      </View>

      {/* Encabezado Corporativo */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>
        <Text style={styles.empresa}>Buses Cortés Flores</Text>
        
        {/* Info Fija del Bus y la Ruta */}
        <View style={styles.infoBusContainer}>
          <Text style={styles.busTexto}>BUS: BF-23</Text>
          <Text style={styles.rutaTexto}>RUTA: OVALLE - LA SERENA</Text>
        </View>
      </View>

      {/* Formulario de Ventas */}
      <View style={styles.bottomSection}>
        <View style={styles.card}>
          
          {/* SECCIÓN 1: SELECCIÓN DE TURNO */}
          <Text style={styles.label}>Selecciona Turno</Text>
          <View style={styles.rowBotones}>
            {['Mañana', 'Tarde', 'Noche'].map((t) => (
              <TouchableOpacity 
                key={t} 
                style={[styles.botonSeleccion, turno === t && styles.botonActivo]} 
                onPress={() => setTurno(t)}
              >
                <Text style={[styles.textoSeleccion, turno === t && styles.textoActivo]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECCIÓN 2: TIPO DE BOLETO */}
          <Text style={styles.label}>Tipo de Boleto</Text>
          <View style={styles.colBotones}>
            {[
              { id: 'Adulto', texto: 'Adulto $5.000' },
              { id: 'Estudiante', texto: 'Estudiante $3.500' },
              { id: 'Tercera Edad', texto: 'Tercera Edad $2.500' }
            ].map((b) => (
              <TouchableOpacity 
                key={b.id} 
                style={[styles.botonLargo, tipoBolet === b.id && styles.botonActivoLargo]} 
                onPress={() => setTipoBolet(b.id)}
              >
                <Text style={[styles.textoLargo, tipoBolet === b.id && styles.textoActivo]}>{b.texto}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECCIÓN 3: CONTADOR DE CANTIDAD */}
          <Text style={styles.label}>Cantidad</Text>
          <View style={styles.contadorContainer}>
            <TouchableOpacity style={styles.botonContador} onPress={disminuirCantidad}>
              <Text style={styles.textoContadorBoton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.numeroCantidad}>{cantidad}</Text>
            <TouchableOpacity style={styles.botonContador} onPress={aumentarCantidad}>
              <Text style={styles.textoContadorBoton}>+</Text>
            </TouchableOpacity>
          </View>

          {/* TOTAL Y BOTÓN DE VENTA */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalNumero}>${total.toLocaleString('es-CL')}</Text>
          </View>

          {/* Este botón ahora llama a la función corregida */}
          <TouchableOpacity style={styles.botonVender} onPress={handleVender}>
            <Text style={styles.textoBotonVender}>VENDER BOLETO</Text>
          </TouchableOpacity>

          {/* Botón sutil para regresar al Login */}
          <TouchableOpacity style={styles.volverBoton} onPress={() => router.replace('/')}>
            <Text style={styles.textoVolver}>Cerrar Sesión</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  menuSuperior: {
    backgroundColor: '#2D3748',
    paddingTop: Platform.OS === 'ios' ? 12 : 14,
    paddingBottom: 14,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  botonResumenMenu: {
    backgroundColor: '#fd7e00',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  textoBotonResumenMenu: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  topSection: {
    flex: 0.35,
    backgroundColor: '#f8dd74',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  logoContainer: { alignItems: 'center', marginBottom: 2 },
  logo: { width: 70, height: 70, resizeMode: 'contain' },
  empresa: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fd7e00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  infoBusContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fd7e00',
  },
  busTexto: { fontSize: 15, fontWeight: 'bold', color: '#2D3748' },
  rutaTexto: { fontSize: 13, fontWeight: '800', color: '#fd7e00', marginTop: 2 },
  bottomSection: {
    flex: 0.65,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  card: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: '#333333', marginBottom: 6, marginTop: 10 },
  rowBotones: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  botonSeleccion: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  botonLargo: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  botonActivo: { backgroundColor: '#fd7e00', borderColor: '#fd7e00' },
  botonActivoLargo: { backgroundColor: '#fd7e00', borderColor: '#fd7e00' },
  textoSeleccion: { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  textoLargo: { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  textoActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  colBotones: { marginBottom: 5 },
  contadorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  botonContador: {
    backgroundColor: '#2D3748',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoContadorBoton: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  numeroCantidad: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, color: '#2D3748' },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 15,
  },
  totalLabel: { fontSize: 14, fontWeight: 'bold', color: '#4A5568' },
  totalNumero: { fontSize: 20, fontWeight: '900', color: '#2D3748' },
  botonVender: {
    backgroundColor: '#fd7e00',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotonVender: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  volverBoton: { marginTop: 10, alignItems: 'center' },
  textoVolver: { fontSize: 12, color: '#718096', textDecorationLine: 'underline' },
});