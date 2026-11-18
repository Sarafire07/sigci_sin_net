import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExitoScreen() {
  const router = useRouter();
  
  // Recibimos todos los datos reales que envía ventas.tsx, incluyendo bus, ruta y vendedorIdParam
  const params = useLocalSearchParams();
  const { 
    turno = 'Mañana', 
    tipo = 'Adulto', 
    cantidad = '1', 
    total = '5000', 
    codigo = '---',
    bus = 'Sin asignar',
    ruta = 'Sin asignar',
    vendedorIdParam = ''
  } = params;

  const [fechaActual, setFechaActual] = useState('');

  useEffect(() => {
    const hoy = new Date();
    const opciones: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    setFechaActual(hoy.toLocaleDateString('es-CL', opciones));
  }, []);

  const handleNuevaVenta = () => {
    // Volvemos enviando de regreso el ID del vendedor para que jamás se pierda
    const idMemoria = vendedorIdParam || (globalThis as any).vendedorIdGlobal || '';
    router.replace({
      pathname: '/ventas',
      params: { vendedorIdParam: String(idMemoria) }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gifContainer}>
        <Image 
          source={require('../../assets/images/gift.gif')} 
          style={styles.gif}
        />
      </View>

      <Text style={styles.mensajeExito}>Boleto registrado correctamente</Text>

      <View style={styles.ticketCard}>
        <Text style={styles.codigoLabel}>CÓDIGO DE BOLETO</Text>
        <Text style={styles.codigoNumero}>{codigo}</Text>

        <View style={styles.divisor} />

        <View style={styles.filaInfo}>
          <Text style={styles.detalleLabel}>Fecha:</Text>
          <Text style={styles.detalleValor}>{fechaActual}</Text>
        </View>

        <View style={styles.filaInfo}>
          <Text style={styles.detalleLabel}>Patente:</Text>
          <Text style={styles.detalleValor}>{bus}</Text>
        </View>

        <View style={styles.filaInfo}>
          <Text style={styles.detalleLabel}>Ruta:</Text>
          <Text style={styles.detalleValor}>{ruta}</Text>
        </View>

        <View style={styles.filaInfo}>
          <Text style={styles.detalleLabel}>Hora:</Text>
          <Text style={styles.detalleValor}>{turno}</Text>
        </View>

        <View style={styles.filaInfo}>
          <Text style={styles.detalleLabel}>Tipo:</Text>
          <Text style={styles.detalleValor}>{tipo} (x{cantidad})</Text>
        </View>

        <View style={styles.divisor} />

        <View style={styles.filaInfo}>
          <Text style={styles.totalLabel}>TOTAL PAGADO:</Text>
          <Text style={styles.totalValor}>${Number(total).toLocaleString('es-CL')}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botonNuevaVenta} onPress={handleNuevaVenta}>
        <Text style={styles.textoBoton}>NUEVA VENTA</Text>
      </TouchableOpacity>
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
  gifContainer: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  mensajeExito: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 25,
  },
  ticketCard: {
    backgroundColor: '#F8FAFC',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 35,
  },
  codigoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
    letterSpacing: 1,
  },
  codigoNumero: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 2,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 14,
  },
  filaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  detalleValor: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fd7e00',
  },
  botonNuevaVenta: {
    backgroundColor: '#fd7e00',
    width: '100%',
    maxWidth: 340,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fd7e00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});