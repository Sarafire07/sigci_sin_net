import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  Alert, 
  FlatList, 
  Image, 
  Modal, 
  Platform, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.64:3000';

export default function VentasScreen() {
  const router = useRouter();
  const { vendedorIdParam } = useLocalSearchParams();

  const [listaBuses, setListaBuses] = useState<any[]>([]);
  const [listaRutas, setListaRutas] = useState<any[]>([]);
  const [busIdSeleccionado, setBusIdSeleccionado] = useState<string>('');
  const [rutaIdSeleccionada, setRutaIdSeleccionada] = useState<string>('');
  const [vendedorId, setVendedorId] = useState<number | null>(null);

  const [modalBusVisible, setModalBusVisible] = useState(false);
  const [modalRutaVisible, setModalRutaVisible] = useState(false);

  const [tipoBolet, setTipoBolet] = useState<string>('Adulto'); 
  const [cantidad, setCantidad] = useState<number>(1);
  const [total, setTotal] = useState<number>(5000);

  const precios: { [key: string]: number } = {
    'Adulto': 5000,
    'Estudiante': 3500,
    'Tercera Edad': 2500,
  };

  useEffect(() => {
    async function obtenerVendedor() {
      // 1. Revisar si viene por parámetro de navegación
      if (vendedorIdParam) {
        const num = Number(vendedorIdParam);
        if (!isNaN(num) && num > 0) {
          setVendedorId(num);
          (globalThis as any).vendedorIdGlobal = num;
          return;
        }
      }

      // 2. Revisar si está en la memoria global de la app
      if ((globalThis as any).vendedorIdGlobal) {
        setVendedorId(Number((globalThis as any).vendedorIdGlobal));
        return;
      }

      // 3. Revisar en almacenamiento local
      try {
        const guardado = Platform.OS === 'web'
          ? localStorage.getItem('vendedor_id')
          : await AsyncStorage.getItem('vendedor_id');
        if (guardado) {
          const num = Number(guardado);
          setVendedorId(num);
          (globalThis as any).vendedorIdGlobal = num;
        }
      } catch (e) {
        console.error("Error leyendo storage:", e);
      }
    }
    obtenerVendedor();
  }, [vendedorIdParam]);

  useEffect(() => {
    fetch(`${API_URL}/api/buses`)
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) {
          setListaBuses(datos);
          if (datos.length > 0) setBusIdSeleccionado(String(datos[0].id));
        }
      })
      .catch(error => console.error("Error buses:", error));

    fetch(`${API_URL}/api/rutas`)
      .then(res => res.json())
      .then(datos => {
        if (Array.isArray(datos)) {
          setListaRutas(datos);
          if (datos.length > 0) setRutaIdSeleccionada(String(datos[0].id));
        }
      })
      .catch(error => console.error("Error rutas:", error));
  }, []);

  useEffect(() => {
    setTotal((precios[tipoBolet] || 5000) * cantidad);
  }, [tipoBolet, cantidad]);

  const busActual = listaBuses.find(b => String(b.id) === String(busIdSeleccionado));
  const rutaActual = listaRutas.find(r => String(r.id) === String(rutaIdSeleccionada));

  const aumentarCantidad = () => {
    if (cantidad >= 5) {
      Platform.OS === 'web'
        ? alert('Solo se puede 5 boletos por compra')
        : Alert.alert('Límite excedido', 'Solo se puede 5 boletos por compra');
      return;
    }
    setCantidad(cantidad + 1);
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const handleVender = async () => {
    if (!busIdSeleccionado || !rutaIdSeleccionada) {
      const msg = 'Selecciona un bus y una ruta antes de vender.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Faltan datos', msg);
      return;
    }

    // Buscamos el ID por las 3 vías posibles antes de armar la venta
    let idFinal: number | null = vendedorId || (globalThis as any).vendedorIdGlobal || (vendedorIdParam ? Number(vendedorIdParam) : null);

    if (!idFinal) {
      try {
        const guardado = Platform.OS === 'web'
          ? localStorage.getItem('vendedor_id')
          : await AsyncStorage.getItem('vendedor_id');
        if (guardado) idFinal = Number(guardado);
      } catch (e) {}
    }

    const ahora = new Date();
    const horaExacta = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigoGenerado = '';
    for (let i = 0; i < 8; i++) {
      codigoGenerado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    const ventaData = {
      codigo_venta: codigoGenerado,
      vendedor_id: idFinal,
      bus_id: Number(busIdSeleccionado),
      ruta_id: Number(rutaIdSeleccionada),
      tipo_boleto: tipoBolet,
      boletos: cantidad,
      ingresos: total,
      estado: 'Sincronizado'
    };

    try {
      const respuesta = await fetch(`${API_URL}/api/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });
      
      if (respuesta.ok) {
        router.push({
          pathname: '/exito',
          params: { 
            codigo: codigoGenerado,
            bus: busActual ? String(busActual.patente || busActual.numero_bus) : '',
            ruta: rutaActual ? String(rutaActual.nombre_ruta) : '',
            turno: horaExacta,
            tipo: tipoBolet,
            cantidad: cantidad.toString(), 
            total: total.toString()        
          } 
        });
      } else {
        Alert.alert('Error', 'Error al guardar la venta en la base de datos.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menuSuperior}>
        <Text style={{ color: '#A0AEC0', fontSize: 11 }}>
          Vendedor ID: {vendedorId ?? 'No detectado'}
        </Text>
        <TouchableOpacity style={styles.botonResumenMenu} onPress={() => router.push('/resumen')}>
          <Text style={styles.textoBotonResumenMenu}>📊 RESUMEN DEL DÍA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>
        <Text style={styles.empresa}>Buses Cortés Flores</Text>
        
        <View style={{ gap: 8 }}>
          <TouchableOpacity 
            style={styles.selectorBox} 
            onPress={() => setModalBusVisible(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>🚌 BUS ASIGNADO</Text>
              <Text style={styles.selectorValue} numberOfLines={1}>
                {busActual ? `Patente: ${busActual.patente || busActual.numero_bus}` : 'Sin buses activos (Agrega uno en BD)'}
              </Text>
            </View>
            <Text style={styles.flecha}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.selectorBox} 
            onPress={() => setModalRutaVisible(true)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>📍 RUTA / RECORRIDO</Text>
              <Text style={styles.selectorValueRuta} numberOfLines={1}>
                {rutaActual ? rutaActual.nombre_ruta : 'Seleccionar ruta...'}
              </Text>
            </View>
            <Text style={styles.flecha}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.card}>
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

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalNumero}>${total.toLocaleString('es-CL')}</Text>
          </View>

          <TouchableOpacity style={styles.botonVender} onPress={handleVender}>
            <Text style={styles.textoBotonVender}>VENDER BOLETO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.volverBoton} onPress={() => router.replace('/')}>
            <Text style={styles.textoVolver}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalBusVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Selecciona un Bus</Text>
            {listaBuses.length === 0 ? (
              <Text style={styles.vacioTexto}>No hay buses registrados en la tabla "buses".</Text>
            ) : (
              <FlatList
                data={listaBuses}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOpcion,
                      String(item.id) === busIdSeleccionado && styles.modalOpcionActiva
                    ]}
                    onPress={() => {
                      setBusIdSeleccionado(String(item.id));
                      setModalBusVisible(false);
                    }}
                  >
                    <Text style={styles.modalOpcionTexto}>🚌 Patente: {item.patente || item.numero_bus}</Text>                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.modalCerrar} onPress={() => setModalBusVisible(false)}>
              <Text style={styles.modalCerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalRutaVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Selecciona una Ruta</Text>
            <FlatList
              data={listaRutas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOpcion,
                    String(item.id) === rutaIdSeleccionada && styles.modalOpcionActiva
                  ]}
                  onPress={() => {
                    setRutaIdSeleccionada(String(item.id));
                    setModalRutaVisible(false);
                  }}
                >
                  <Text style={styles.modalOpcionTexto}>📍 {item.nombre_ruta}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCerrar} onPress={() => setModalRutaVisible(false)}>
              <Text style={styles.modalCerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonResumenMenu: { backgroundColor: '#fd7e00', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  textoBotonResumenMenu: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  topSection: {
    backgroundColor: '#f8dd74',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  logoContainer: { alignItems: 'center', marginBottom: 4 },
  logo: { width: 65, height: 65, resizeMode: 'contain' },
  empresa: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fd7e00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  selectorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#fd7e00',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLabel: { fontSize: 10, fontWeight: '800', color: '#718096', marginBottom: 2 },
  selectorValue: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  selectorValueRuta: { fontSize: 13, fontWeight: '700', color: '#fd7e00' },
  flecha: { fontSize: 14, color: '#fd7e00', marginLeft: 8, fontWeight: 'bold' },
  bottomSection: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 12 },
  card: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: '#333333', marginBottom: 6, marginTop: 8 },
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
  botonActivoLargo: { backgroundColor: '#fd7e00', borderColor: '#fd7e00' },
  textoLargo: { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  textoActivo: { color: '#FFFFFF', fontWeight: 'bold' },
  colBotones: { marginBottom: 4 },
  contadorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
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
    marginBottom: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '65%',
  },
  modalTitulo: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 12, textAlign: 'center' },
  modalOpcion: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderRadius: 6,
  },
  modalOpcionActiva: { backgroundColor: '#FFF5EB' },
  modalOpcionTexto: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  vacioTexto: { textAlign: 'center', color: '#718096', marginVertical: 20, fontSize: 14 },
  modalCerrar: {
    marginTop: 14,
    backgroundColor: '#2D3748',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCerrarTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});