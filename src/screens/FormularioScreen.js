import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { formularioService } from '../services/formularioService';
import ImagePickerComponent from '../utils/ImagePickerComponent.js';

export default function FormularioScreen({ onGoBack }) {
  const [formData, setFormData] = useState({
    id_tarea: '',
    fecha_inspeccion: new Date().toISOString().split('T')[0],
    red_seca: '',
    red_humeda: '',
    comentario: '',
    firma_supervisor: '',
    firma_supervisor_area: '',
    firma_brigada: '',
  });
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const opciones = ["SI", "NO", "N/A", "OP", "NOP", "OB"];

  const handleSave = async () => {
    if (!formData.id_tarea.trim()) {
      Alert.alert('Error', 'El ID de tarea es requerido');
      return;
    }

    setSaving(true);
    
    try {
      const formularioCompleto = {
        ...formData,
        codigo_formulario: 'prueba',
        nombre_formulario: 'CONTROL DE SPRINKLERS',
        fecha_inspeccion: new Date(formData.fecha_inspeccion).toISOString(),
        checklist: {
          red_seca: formData.red_seca,
          red_humeda: formData.red_humeda,
        },
        firmas: {
          supervisor: formData.firma_supervisor,
          supervisor_area: formData.firma_supervisor_area,
          brigada: formData.firma_brigada,
        }
      };

      const formularioId = await formularioService.guardarFormulario(
        formularioCompleto, 
        selectedImages
      );
      
      Alert.alert(
        'Éxito', 
        `Formulario #${formularioId} guardado con ${selectedImages.length} fotos`,
        [{ text: 'OK', onPress: () => onGoBack() }]
      );
      
    } catch (error) {
      console.error('Error guardando formulario:', error);
      Alert.alert('Error', 'No se pudo guardar el formulario');
    } finally {
      setSaving(false);
    }
  };

  const handleImagesSelected = (images) => {
    setSelectedImages(images);
  };

  // ... (resto del código de renderizado existente)
  const renderSelector = (field, label) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {opciones.map((opcion) => (
            <TouchableOpacity
              key={opcion}
              style={[
                styles.option,
                formData[field] === opcion && styles.optionSelected
              ]}
              onPress={() => setFormData({ ...formData, [field]: opcion })}
            >
              <Text style={[
                styles.optionText,
                formData[field] === opcion && styles.optionTextSelected
              ]}>
                {opcion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CONTROL DE SPRINKLERS</Text>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {/* Campos existentes del formulario */}
                {/* ID Tarea */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ID Tarea *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el ID de tarea"
            value={formData.id_tarea}
            onChangeText={(text) => setFormData({ ...formData, id_tarea: text })}
          />
        </View>

        {/* Fecha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de Inspección</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.fecha_inspeccion}
            onChangeText={(text) => setFormData({ ...formData, fecha_inspeccion: text })}
          />
        </View>

        {/* Checklist */}
        <Text style={styles.sectionTitle}>Checklist</Text>
        
        {renderSelector('red_seca', 'Red Seca')}
        {renderSelector('red_humeda', 'Red Húmeda')}

        {/* Comentario */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Comentario</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Comentarios adicionales..."
            multiline
            numberOfLines={4}
            value={formData.comentario}
            onChangeText={(text) => setFormData({ ...formData, comentario: text })}
          />
        </View>

        {/* Firmas */}
        <Text style={styles.sectionTitle}>Firmas</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Supervisor</Text>
          <TextInput
            style={styles.input}
            placeholder="Firma del supervisor"
            value={formData.firma_supervisor}
            onChangeText={(text) => setFormData({ ...formData, firma_supervisor: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Supervisor de Área</Text>
          <TextInput
            style={styles.input}
            placeholder="Firma del supervisor de área"
            value={formData.firma_supervisor_area}
            onChangeText={(text) => setFormData({ ...formData, firma_supervisor_area: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Brigada</Text>
          <TextInput
            style={styles.input}
            placeholder="Firma de brigada"
            value={formData.firma_brigada}
            onChangeText={(text) => setFormData({ ...formData, firma_brigada: text })}
          />
        </View>
        {/* Sección de Fotos */}
        <Text style={styles.sectionTitle}>Fotos de Evidencia</Text>
        <ImagePickerComponent onImagesSelected={handleImagesSelected} />
        
        {/* Botón Guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              💾 Guardar ({selectedImages.length} fotos)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos permanecen iguales

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectorContainer: {
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});