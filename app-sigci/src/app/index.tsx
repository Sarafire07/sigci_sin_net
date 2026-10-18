import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

    const handleLogin = () => {
    if (!usuario || !password) {
      if (Platform.OS === 'web') {
        alert('Por favor ingresa tu usuario y contraseña');
      } else {
        Alert.alert('Error', 'Por favor ingresa tu usuario y contraseña');
      }
      return;
    }
    
    // Alerta de bienvenida de prueba antes de pasar a la pantalla
    if (Platform.OS === 'web') {
      alert(`¡Bienvenido!\nIniciando sesión como: ${usuario}`);
    } else {
      Alert.alert('¡Bienvenido!', `Iniciando sesión como: ${usuario}`);
    }

    // Viaja directo a la pantalla de boletos
    router.replace('/ventas');
  };


  const handleRegisterRedirect = () => {
    router.push('/registro');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Parte superior (Fondo Amarillo Corporativo) */}
      <View style={styles.topSection}>
        
        {/* 1. ESPACIO PARA EL LOGO */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        {/* Nombre de la empresa grande y centrado */}
        <Text style={styles.empresa}>Buses Cortés Flores</Text>

        {/* Bloque de bienvenida */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.bienvenido}>¡Bienvenido!</Text>
          <Text style={styles.subtit}>Inicia sesión para continuar</Text>
        </View>
      </View>

      {/* Parte inferior con los campos (Fondo Blanco) */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.bottomSection}
      >
        <View style={styles.card}>
          {/* Campo Usuario */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              value={usuario}
              onChangeText={setUsuario}
            />
          </View>

          {/* Campo Contraseña */}
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

          {/* Botón de Iniciar Sesión (Naranja Corporativo) */}
          <TouchableOpacity style={styles.boton} onPress={handleLogin}>
            <Text style={styles.textoBoton}>INICIAR SESIÓN</Text>
          </TouchableOpacity>

          {/* 2. OPCIÓN PARA REGISTRARSE */}
          <TouchableOpacity style={styles.registroBoton} onPress={handleRegisterRedirect}>
            <Text style={styles.textoRegistro}>
              ¿No tienes cuenta? <Text style={styles.textoRegistroEnlace}>Regístrate aquí</Text>
            </Text>
          </TouchableOpacity>

          {/* Enlace inferior de ayuda que abre la ventana emergente */}
          <TouchableOpacity style={styles.ayudaContainer} onPress={() => setModalVisible(true)}>
            <Text style={styles.textoAyuda}>¿Problemas de autenticación?</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* PANTALLA EMERGENTE (MODAL) DE SOPORTE TÉCNICO */}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 0.50,
    backgroundColor: '#f8dd74',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  empresa: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fd7e00',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 25,
  },
  welcomeContainer: {
    alignItems: 'flex-start',
  },
  bienvenido: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  subtit: {
    fontSize: 14,
    color: '#4A5568',
  },
  bottomSection: {
    flex: 0.50,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: 'flex-start',
  },
  card: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
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
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  registroBoton: {
    marginTop: 16,
    alignItems: 'center',
  },
  textoRegistro: {
    fontSize: 13,
    color: '#4A5568',
  },
  textoRegistroEnlace: {
    color: '#fd7e00',
    fontWeight: 'bold',
  },
  ayudaContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  textoAyuda: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '500',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  modalTexto: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  modalCorreo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fd7e00', 
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBotonCerrar: {
    backgroundColor: '#2D3748', 
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalTextoBoton: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
