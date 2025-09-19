import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker/legacy';

export default function ImagePickerComponent({ onImagesSelected }) {
  const [selectedImages, setSelectedImages] = useState([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a las fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // ← Corregido aquí
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true, // ← Para selección múltiple
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        name: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        type: 'image/jpeg'
      }));

      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
      onImagesSelected(updatedImages);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos necesarios', 'Se necesitan permisos para usar la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImage = {
        uri: result.assets[0].uri,
        name: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        type: 'image/jpeg'
      };

      const updatedImages = [...selectedImages, newImage];
      setSelectedImages(updatedImages);
      onImagesSelected(updatedImages);
    }
  };

  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fotos Adjuntas</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Galería</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📷 Cámara</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imagesContainer}>
        {selectedImages.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      
      {selectedImages.length > 0 && (
        <Text style={styles.counterText}>
          {selectedImages.length} foto(s) seleccionada(s)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  counterText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});