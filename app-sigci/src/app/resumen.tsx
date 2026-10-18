import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ResumenScreen() {
  const router = useRouter();

  // Datos fijos del turno comercial para Buses Cortés Flores
  const totalVentas = 10000;
  const boletosVendidos = 3;

  const handleSincronizar = () => {
    alert('Sincronizando datos con la central de Buses Cortés Flores...');
  };

  const handleHistorial = () => {
    alert('Abriendo desglose completo del historial de boletos emitidos.');
  };

  const handleFinalizarDia = () => {
    alert('Día finalizado. Caja cerrada con éxito.');
    router.replace('/'); // Lo regresa al login inicial
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado de la página */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Resumen del Día</Text>
        <Text style={styles.subtitulo}>Bus BF-23 • Ovalle - La Serena</Text>
      </View>

      <View style={styles.cardContable}>
        {/* Total recaudado */}
        <Text style={styles.labelPrincipal}>TOTAL VENTAS</Text>
        <Text style={styles.valorPrincipal}>${totalVentas.toLocaleString('es-CL')}</Text>

        {/* Cantidad de pasajes */}
        <Text style={styles.labelSecundario}>Cantidad de boletos vendidos</Text>
        <Text style={styles.valorSecundario}>{boletosVendidos} pasajes</Text>

        <View style={styles.divisor} />

        {/* Detalle por Tipo */}
        <Text style={styles.labelSeccion}>Detalle por Tipo:</Text>
        
        <View style={styles.filaDetalle}>
          <Text style={styles.tipoTexto}>Adulto:</Text>
          <Text style={styles.valoresTexto}>2 vendidos • $8.000</Text>
        </View>

        <View style={styles.filaDetalle}>
          <Text style={styles.tipoTexto}>Estudiante:</Text>
          <Text style={styles.valoresTexto}>1 vendido • $2.000</Text>
        </View>

        <View style={styles.filaDetalle}>
          <Text style={styles.tipoTexto}>Tercera Edad:</Text>
          <Text style={styles.valoresTexto}>0 vendidos • $0</Text>
        </View>
      </View>

      {/* Bloque de los 3 Botones Solicitados */}
      <View style={styles.bloqueBotones}>
        <TouchableOpacity style={styles.botonSincronizar} onPress={handleSincronizar}>
          <Text style={styles.textoBoton}>🔄 SINCRONIZAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonHistorial} onPress={handleHistorial}>
          <Text style={styles.textoBoton}>📋 HISTORIAL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonFinalizar} onPress={handleFinalizarDia}>
          <Text style={styles.textoBoton}>🛑 FINALIZAR DÍA</Text>
        </TouchableOpacity>

        {/* Botón para regresar al panel de ventas */}
        <TouchableOpacity style={styles.botonVolver} onPress={() => router.back()}>
          <Text style={styles.textoVolver}>Volver al Panel de Ventas</Text>
        </TouchableOpacity>
      </View>
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
    borderStyle: 'dashed',
    borderRadius: 1,
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
});
