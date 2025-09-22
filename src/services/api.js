const API_BASE_URL = 'http://10.0.2.2:4000/api';

export const apiService = {
  async login(email, contrasena) {
    console.log('🔄 Iniciando login para:', email);
    console.log('🌐 URL:', `${API_BASE_URL}/usuarios/login`);
    
    try {
      console.log('📤 Enviando request...');
      
      const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contrasena }),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      console.log('✅ Login exitoso');
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      // Si es error de conexión
      if (error.message.includes('Network request failed')) {
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet');
      }
      throw error;
    }
  },

  async obtenerUsuarios(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

async enviarFormulario(formularioData, token) {
  try {
    const formDataToSend = new FormData();

    formDataToSend.append('id_tarea', formularioData.id_tarea);
    formDataToSend.append('codigo_formulario', formularioData.codigo_formulario || 'prueba');
    formDataToSend.append('nombre_formulario', formularioData.nombre_formulario || 'CONTROL DE SPRINKLERS');
    formDataToSend.append('fecha_inspeccion', formularioData.fecha_inspeccion);
    formDataToSend.append('red_seca', formularioData.checklist?.red_seca || '');
    formDataToSend.append('red_humeda', formularioData.checklist?.red_humeda || '');
    formDataToSend.append('comentario', formularioData.comentario || '');
    formDataToSend.append('firma_supervisor', formularioData.firmas?.supervisor || '');
    formDataToSend.append('firma_supervisor_area', formularioData.firmas?.supervisor_area || '');
    formDataToSend.append('firma_brigada', formularioData.firmas?.brigada || '');

    // 📌 adjuntar la imagen
    if (formularioData.firma_imagen) {
      const uri = formularioData.firma_imagen;
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename ?? '');
      const type = match ? `image/${match[1]}` : `image`;

      formDataToSend.append('firma_imagen', {
        uri,
        name: filename,
        type,
      });
    }

    const response = await fetch(`${API_BASE_URL}/formulario/prueba`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, 
        // ❌ NO pongas Content-Type aquí, RN lo agrega solo
      },
      body: formDataToSend,
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Error al enviar formulario');

    return data;
  } catch (error) {
    console.error('❌ Error enviando formulario:', error);
    throw error;
  }
}

};