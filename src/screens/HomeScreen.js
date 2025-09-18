import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { authService } from '../services/authService';
import FormulariosListScreen from './FormulariosListScreen';
import FormularioScreen from './FormularioScreen';

export default function HomeScreen({ user, onLogout }) {
  const [sessionTime, setSessionTime] = useState('');
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'list', 'form'

  useEffect(() => {
    loadSessionInfo();
  }, []);

  const loadSessionInfo = async () => {
    const timeFormatted = await authService.getRemainingSessionTimeFormatted();
    setSessionTime(timeFormatted);
  };

  const handleLogout = async () => {
    await authService.clearAuthData();
    onLogout();
  };

  // Renderizar según la pantalla actual
  if (currentScreen === 'list') {
    return (
      <FormulariosListScreen 
        onNewForm={() => setCurrentScreen('form')}
        onGoBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'form') {
    return (
      <FormularioScreen 
        onGoBack={() => setCurrentScreen('list')}
      />
    );
  }

  // Pantalla principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.userInfo}>Usuario: {user.nombre}</Text>
      <Text style={styles.userInfo}>Email: {user.email}</Text>
      
      <Text style={styles.sessionInfo}>
        🕒 Sesión válida por: {sessionTime}
      </Text>
      
      <TouchableOpacity 
        style={styles.formButton} 
        onPress={() => setCurrentScreen('list')}
      >
        <Text style={styles.formButtonText}>📋 Ver Formularios</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  sessionInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    marginBottom: 30,
    fontStyle: 'italic',
  },
  formButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  formButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});