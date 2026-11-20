import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://sigci-sin-net.onrender.com';

export default function Index() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !password) {
      const msg = 'Por favor ingresa tu usuario y contraseña';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }
    
    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password: password })
      });

      const data = await respuesta.json();

      if (respuesta.ok && data.success) {
        const idUsuario = data.usuario?.id ?? data.usuario?.ID ?? data.usuario?.Id;
        const idStr = String(idUsuario);

        (globalThis as any).vendedorIdGlobal = Number(idUsuario);

        try {
          if (Platform.OS === 'web') {
            localStorage.setItem('vendedor_id', idStr);
          } else {
            await AsyncStorage.setItem('vendedor_id', idStr);
          }
        } catch (e) {
          console.error("Error guardando en storage:", e);
        }

        const bienvenidaMsg = `¡Bienvenido, ${data.usuario.nombre}!`;
        Platform.OS === 'web' ? alert(bienvenidaMsg) : Alert.alert('¡Bienvenido!', bienvenidaMsg);

        router.replace({
          pathname: '/ventas',
          params: { vendedorIdParam: idStr }
        });
      } else {
        const errorMsg = data.error || 'Usuario o contraseña incorrectos';
        Platform.OS === 'web' ? alert(errorMsg) : Alert.alert('Acceso Denegado', errorMsg);
      }
    } catch (error) {
      console.error(error);
      const errConexion = 'No se pudo conectar con el servidor.';
      Platform.OS === 'web' ? alert(errConexion) : Alert.alert('Error de red', errConexion);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        <Text style={styles.empresa}>Buses Cortés Flores</Text>

        <View style={styles.welcomeContainer}>
          <Text style={styles.bienvenido}>¡Bienvenido!</Text>
          <Text style={styles.subtit}>Inicia sesión para continuar</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSection}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.textoBoton}>INICIAR SESIÓN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ayudaContainer} onPress={() => setModalVisible(true)}>
            <Text style={styles.textoAyuda}>¿Problemas de autenticación?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Soporte Técnico</Text>
            <Text style={styles.modalTexto}>
              Si tienes problemas para ingresar o necesitas restablecer tu contraseña, por favor contáctate al correo oficial de soporte:
            </Text>
            <Text style={styles.modalCorreo}>servicio.tecnico.cortesflores@gmail.com</Text>
            
            <TouchableOpacity style={styles.modalBotonCerrar} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalTextoBoton}>ENTENDIDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: {
    flex: 0.50,
    backgroundColor: '#f8dd74',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: { alignItems: 'center', marginBottom: 5 },
  logo: { width: 250, height: 250, resizeMode: 'contain' },
  empresa: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fd7e00',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 25,
  },
  welcomeContainer: { alignItems: 'flex-start' },
  bienvenido: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', marginBottom: 2 },
  subtit: { fontSize: 14, color: '#4A5568' },
  bottomSection: {
    flex: 0.50,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  card: { width: '100%' },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#333333', marginBottom: 4 },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#000000',
  },
  boton: {
    backgroundColor: '#fd7e00',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  ayudaContainer: { marginTop: 20, alignItems: 'center' },
  textoAyuda: { color: '#D32F2F', fontSize: 12, fontWeight: '500' },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContenido: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#2D3748', marginBottom: 12 },
  modalTexto: { fontSize: 14, color: '#4A5568', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  modalCorreo: { fontSize: 14, fontWeight: 'bold', color: '#fd7e00', textAlign: 'center', marginBottom: 20 },
  modalBotonCerrar: {
    backgroundColor: '#2D3748', 
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalTextoBoton: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});