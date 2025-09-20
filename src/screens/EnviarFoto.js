import React, { useState } from "react";
import { View, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    let formData = new FormData();
    formData.append("file", {
      uri: image,
      type: "image/jpeg",
      name: "comprobante.jpg",
    });

await fetch("http://192.168.1.243:4000/api/upload", {
  method: "POST",
  body: formData,
})
  .then(async (res) => {
    const text = await res.text(); // ver la respuesta cruda
    console.log("Respuesta cruda del servidor:", text);
    return JSON.parse(text);
  })
  .then((data) => {
    console.log("URL Firebase:", data.url);
  })
  .catch((err) => console.error("Error al subir:", err));
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Seleccionar Imagen" onPress={pickImage} />
      {image && (
        <>
          <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
          <Button title="Subir Imagen" onPress={uploadImage} />
        </>
      )}
    </View>
  );
}
