import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { apiService } from '../services/api';
import { authService } from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !contrasena.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.login(email.toLowerCase().trim(), contrasena);
      
      // Guardar datos de autenticación
      await authService.saveAuthData(response.token, response.usuario);
      
      Alert.alert('Éxito', `Bienvenido ${response.usuario.nombre}`, [
        { text: 'OK', onPress: () => onLoginSuccess(response.usuario) }
      ]);
      
    } catch (error) {
      Alert.alert('Error de Login', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Formulario Offline</Text>
        <Text style={styles.subtitle}>Iniciar Sesión</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
  <Text style={styles.infoText}>
    🔗 Conectando a: backend-veladero.onrender.com
  </Text>
  <Text style={styles.infoTextSmall}>
    Verifica tu conexión a internet
  </Text>
</View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  infoTextSmall: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});