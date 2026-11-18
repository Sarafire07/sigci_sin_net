import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'http://192.168.1.64:3000'; // Usa tu IP actual

export default function Registro() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!nombre || !correo || !rut || !password) {
      const msg = 'Por favor complete todos los campos';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Error', msg);
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, rut, correo, password })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        const msg = `¡Registro exitoso! Bienvenido a bordo, ${nombre}.`;
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Éxito', msg);
        router.back();
      } else {
        const errMsg = data.error || 'No se pudo completar el registro.';
        Platform.OS === 'web' ? alert(errMsg) : Alert.alert('Error', errMsg);
      }
    } catch (error) {
      console.error(error);
      const errConexion = 'No se pudo conectar con el servidor.';
      Platform.OS === 'web' ? alert(errConexion) : Alert.alert('Error', errConexion);
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
          <Text style={styles.bienvenido}>Crear Cuenta</Text>
          <Text style={styles.subtit}>Regístrate para comenzar a viajar</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSection}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={styles.input}
              placeholder="12.345.678-9"
              placeholderTextColor="#999"
              value={rut}
              onChangeText={setRut}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Crea una contraseña"
              placeholderTextColor="#999"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.boton} onPress={handleRegister}>
            <Text style={styles.textoBoton}>REGISTRARSE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.volverBoton} onPress={() => router.back()}>
            <Text style={styles.textoVolver}>
              ¿Ya tienes cuenta? <Text style={styles.textoVolverEnlace}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: {
    flex: 0.45,
    backgroundColor: '#f8dd74',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  logoContainer: { alignItems: 'center', marginBottom: 5 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  empresa: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fd7e00',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeContainer: { alignItems: 'flex-start' },
  bienvenido: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', marginBottom: 2 },
  subtit: { fontSize: 13, color: '#4A5568' },
  bottomSection: {
    flex: 0.55,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 15,
    justifyContent: 'flex-start',
  },
  card: { width: '100%' },
  inputContainer: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#333333', marginBottom: 2 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    color: '#000000',
  },
  boton: {
    backgroundColor: '#fd7e00',
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  volverBoton: { marginTop: 14, alignItems: 'center' },
  textoVolver: { fontSize: 13, color: '#4A5568' },
  textoVolverEnlace: { color: '#fd7e00', fontWeight: 'bold' },
});