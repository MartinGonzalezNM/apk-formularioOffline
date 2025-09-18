import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { formularioService } from '../services/formularioService';
import { apiService } from '../services/api';
import { authService } from '../services/authService';

export default function FormulariosListScreen({ onNewForm, onGoBack }) {
  const [formularios, setFormularios] = useState([]);
  const [pendientes, setPendientes] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormularios();
  }, []);

  const loadFormularios = async () => {
    try {
      const todos = await formularioService.obtenerFormularios();
      const noSincronizados = await formularioService.obtenerFormulariosNoSincronizados();
      
      setFormularios(todos);
      setPendientes(noSincronizados.length);
    } catch (error) {
      console.error('Error cargando formularios:', error);
    } finally {
      setLoading(false);
    }
  };

  const sincronizar = async () => {
    if (pendientes === 0) {
      Alert.alert('Info', 'No hay formularios para sincronizar');
      return;
    }

    setSyncing(true);
    
    try {
      const token = await authService.getToken();
      if (!token) {
        Alert.alert('Error', 'No hay token de autenticación');
        return;
      }

      const noSincronizados = await formularioService.obtenerFormulariosNoSincronizados();
      let sincronizados = 0;
      
      for (const form of noSincronizados) {
        try {
          console.log(`Sincronizando formulario #${form.id}...`);
          await apiService.enviarFormulario(form, token);
          await formularioService.marcarComoSincronizado(form.id);
          sincronizados++;
        } catch (error) {
          console.error(`Error sincronizando formulario #${form.id}:`, error);
        }
      }

      Alert.alert(
        'Sincronización',
        `${sincronizados} de ${noSincronizados.length} formularios sincronizados`
      );
      
      loadFormularios();
      
    } catch (error) {
      Alert.alert('Error', 'Error durante la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  const renderFormulario = ({ item }) => (
    <View style={styles.formularioItem}>
      <View style={styles.formularioHeader}>
        <Text style={styles.formularioId}>#{item.id}</Text>
        <View style={[
          styles.syncStatus,
          { backgroundColor: item.synced ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.syncText}>
            {item.synced ? 'Sincronizado' : 'Pendiente'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.formularioTitle}>{item.nombre_formulario}</Text>
      <Text style={styles.formularioInfo}>ID Tarea: {item.id_tarea || 'N/A'}</Text>
      <Text style={styles.formularioInfo}>
        Fecha: {new Date(item.fecha_inspeccion).toLocaleDateString()}
      </Text>
      <Text style={styles.formularioDate}>
        Creado: {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando formularios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Formularios</Text>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.stat}>📋 Total: {formularios.length}</Text>
        <Text style={styles.stat}>⏳ Pendientes: {pendientes}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.newButton} onPress={onNewForm}>
          <Text style={styles.newButtonText}>➕ Nuevo Formulario</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.syncButton,
            { backgroundColor: pendientes > 0 ? '#007AFF' : '#999' }
          ]}
          onPress={sincronizar}
          disabled={syncing || pendientes === 0}
        >
          {syncing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.syncButtonText}>
              ☁️ Sincronizar ({pendientes})
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={formularios}
        renderItem={renderFormulario}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay formularios guardados</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={onNewForm}>
              <Text style={styles.emptyButtonText}>Crear primer formulario</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  stat: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  newButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  newButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formularioItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formularioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  formularioId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  syncStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formularioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  formularioInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  formularioDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});