import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.64:3000/api/ventas';
const KEY_ULTIMO_CIERRE = 'ultimo_id_cierre_turno';

interface Venta {
  id: number;
  codigo_venta: string;
  nombre_vendedor: string;
  patente: string | null;
  bus: string;
  ruta: string;
  tipo_boleto: string;
  boletos: number;
  ingresos: number;
  hora: string;
  fecha_completa: string;
  estado: string;
}

export default function ResumenScreen() {
  const router = useRouter();

  const [ventasHoy, setVentasHoy] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalHistorial, setModalHistorial] = useState(false);

  const leerUltimoIdCierre = async (): Promise<number> => {
    try {
      const guardado =
        Platform.OS === 'web'
          ? localStorage.getItem(KEY_ULTIMO_CIERRE)
          : await AsyncStorage.getItem(KEY_ULTIMO_CIERRE);
      return guardado ? Number(guardado) : 0;
    } catch {
      return 0;
    }
  };

  const guardarUltimoIdCierre = async (ultimoId: number) => {
    try {
      const valor = String(ultimoId);
      if (Platform.OS === 'web') {
        localStorage.setItem(KEY_ULTIMO_CIERRE, valor);
      } else {
        await AsyncStorage.setItem(KEY_ULTIMO_CIERRE, valor);
      }
    } catch (e) {
      console.error('Error guardando cierre de turno:', e);
    }
  };

  const cargarResumen = async (mostrarAlerta = false) => {
    try {
      setCargando(true);
      const [respuesta, ultimoIdCierre] = await Promise.all([
        fetch(API_URL),
        leerUltimoIdCierre(),
      ]);

      if (!respuesta.ok) throw new Error('Error al conectar con el servidor');
      const data: Venta[] = await respuesta.json();

      // Filtra solo las ventas de hoy posteriores al último cierre de turno
      const ahora = new Date();
      const dd = String(ahora.getDate()).padStart(2, '0');
      const mm = String(ahora.getMonth() + 1).padStart(2, '0');
      const yyyy = ahora.getFullYear();
      const prefijoHoy = `${dd}-${mm}-${yyyy}`;

      const soloTurnoActual = data.filter(
        (v) =>
          v.fecha_completa &&
          v.fecha_completa.startsWith(prefijoHoy) &&
          Number(v.id) > ultimoIdCierre
      );

      setVentasHoy(soloTurnoActual);

      if (mostrarAlerta) {
        Alert.alert('Sincronizado', `Datos actualizados (${soloTurnoActual.length} registros en este turno).`);
      }
    } catch (error) {
      console.error('Error cargando resumen:', error);
      Alert.alert('Error de conexión', 'No se pudo obtener el resumen desde el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarResumen(false);
    }, [])
  );

  const totalVentas = ventasHoy.reduce((acc, v) => acc + Number(v.ingresos || 0), 0);
  const boletosVendidos = ventasHoy.reduce((acc, v) => acc + Number(v.boletos || 0), 0);

  const calcularPorTipo = (filtro: (tipo: string) => boolean) => {
    return ventasHoy.reduce(
      (acc, v) => {
        const tipo = (v.tipo_boleto || '').toLowerCase();
        if (filtro(tipo)) {
          acc.cantidad += Number(v.boletos || 0);
          acc.monto += Number(v.ingresos || 0);
        }
        return acc;
      },
      { cantidad: 0, monto: 0 }
    );
  };

  const adulto = calcularPorTipo((t) => t.includes('adulto') && !t.includes('mayor'));
  const estudiante = calcularPorTipo((t) => t.includes('estudiante'));
  const terceraEdad = calcularPorTipo((t) => t.includes('tercera') || t.includes('mayor'));

  // Muestra solo la patente del bus activo
  const ultimaVenta = ventasHoy[0];
  const subtituloActivo = ultimaVenta
    ? `Patente: ${ultimaVenta.patente || ultimaVenta.bus}`
    : 'Sin ventas en este turno';

  const cerrarTurno = async () => {
    if (ventasHoy.length > 0) {
      const maxId = Math.max(...ventasHoy.map((v) => Number(v.id)));
      await guardarUltimoIdCierre(maxId);
    }
    setVentasHoy([]);
    router.replace('/');
  };

  const handleFinalizarDia = () => {
    const mensaje = `Se cerrará tu turno con $${totalVentas.toLocaleString('es-CL')} recaudados (${boletosVendidos} pasajes) y el contador volverá a $0. ¿Deseas continuar?`;

    if (Platform.OS === 'web') {
      if (confirm(mensaje)) cerrarTurno();
      return;
    }

    Alert.alert('Finalizar Turno', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Caja',
        style: 'destructive',
        onPress: cerrarTurno,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Resumen del Turno</Text>
        <Text style={styles.subtitulo}>{subtituloActivo}</Text>
      </View>

      <View style={styles.cardContable}>
        {cargando ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#fd7e00" />
            <Text style={styles.loaderText}>Actualizando caja...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.labelPrincipal}>TOTAL VENTAS</Text>
            <Text style={styles.valorPrincipal}>${totalVentas.toLocaleString('es-CL')}</Text>

            <Text style={styles.labelSecundario}>Cantidad de boletos vendidos</Text>
            <Text style={styles.valorSecundario}>{boletosVendidos} pasajes</Text>

            <View style={styles.divisor} />

            <Text style={styles.labelSeccion}>Detalle por Tipo:</Text>

            <View style={styles.filaDetalle}>
              <Text style={styles.tipoTexto}>Adulto:</Text>
              <Text style={styles.valoresTexto}>
                {adulto.cantidad} vendidos • ${adulto.monto.toLocaleString('es-CL')}
              </Text>
            </View>

            <View style={styles.filaDetalle}>
              <Text style={styles.tipoTexto}>Estudiante:</Text>
              <Text style={styles.valoresTexto}>
                {estudiante.cantidad} vendidos • ${estudiante.monto.toLocaleString('es-CL')}
              </Text>
            </View>

            <View style={styles.filaDetalle}>
              <Text style={styles.tipoTexto}>Tercera Edad:</Text>
              <Text style={styles.valoresTexto}>
                {terceraEdad.cantidad} vendidos • ${terceraEdad.monto.toLocaleString('es-CL')}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.bloqueBotones}>
        <TouchableOpacity
          style={styles.botonSincronizar}
          onPress={() => cargarResumen(true)}
          disabled={cargando}
        >
          <Text style={styles.textoBoton}>
            {cargando ? 'SINCRONIZANDO...' : '🔄 SINCRONIZAR'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonHistorial}
          onPress={() => setModalHistorial(true)}
        >
          <Text style={styles.textoBoton}>📋 HISTORIAL ({ventasHoy.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonFinalizar} onPress={handleFinalizarDia}>
          <Text style={styles.textoBoton}>🛑 FINALIZAR TURNO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.textoVolver}>Volver al Panel de Ventas</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalHistorial}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalHistorial(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Historial del Turno</Text>

            {ventasHoy.length === 0 ? (
              <Text style={styles.vacioTexto}>Aún no hay ventas en este turno.</Text>
            ) : (
              <FlatList
                data={ventasHoy}
                keyExtractor={(item) => String(item.id)}
                style={styles.listaHistorial}
                renderItem={({ item }) => (
                  <View style={styles.itemHistorial}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTipo}>
                        {item.tipo_boleto} (x{item.boletos})
                      </Text>
                      <Text style={styles.itemMeta}>
                        {item.hora} • {item.ruta} • {item.codigo_venta}
                      </Text>
                    </View>
                    <Text style={styles.itemMonto}>
                      ${Number(item.ingresos).toLocaleString('es-CL')}
                    </Text>
                  </View>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setModalHistorial(false)}
            >
              <Text style={styles.textoBoton}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2D3748',
  },
  subtitulo: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
    textAlign: 'center',
  },
  cardContable: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 25,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  loaderBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loaderText: {
    marginTop: 10,
    color: '#718096',
    fontSize: 13,
  },
  labelPrincipal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#A0AEC0',
    letterSpacing: 1,
  },
  valorPrincipal: {
    fontSize: 32,
    fontWeight: '900',
    color: '#2D3748',
    marginTop: 4,
  },
  labelSecundario: {
    fontSize: 13,
    color: '#718096',
    marginTop: 12,
  },
  valorSecundario: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fd7e00',
    marginTop: 2,
  },
  divisor: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  labelSeccion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  filaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  tipoTexto: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  valoresTexto: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '700',
  },
  bloqueBotones: {
    width: '100%',
    maxWidth: 340,
  },
  botonSincronizar: {
    backgroundColor: '#3182CE',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  botonHistorial: {
    backgroundColor: '#4A5568',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  botonFinalizar: {
    backgroundColor: '#E53E3E',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  botonVolver: {
    alignItems: 'center',
    marginTop: 5,
  },
  textoVolver: {
    color: '#718096',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 12,
    textAlign: 'center',
  },
  listaHistorial: {
    marginBottom: 15,
  },
  vacioTexto: {
    textAlign: 'center',
    color: '#718096',
    marginVertical: 25,
  },
  itemHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  itemTipo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  itemMeta: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  itemMonto: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fd7e00',
    marginLeft: 10,
  },
  botonCerrarModal: {
    backgroundColor: '#2D3748',
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});