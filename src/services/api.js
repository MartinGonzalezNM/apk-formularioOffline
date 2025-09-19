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
    console.log('📤 Enviando formulario al servidor:', formularioData);
    
    try {
      const response = await fetch(`${API_BASE_URL}/formulario/prueba`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_tarea: formularioData.id_tarea,
          codigo_formulario: formularioData.codigo_formulario,
          nombre_formulario: formularioData.nombre_formulario,
          fecha_inspeccion: formularioData.fecha_inspeccion,
          checklist: {
            red_seca: formularioData.red_seca,
            red_humeda: formularioData.red_humeda,
          },
          comentario: formularioData.comentario,
          firmas: {
            supervisor: formularioData.firma_supervisor,
            supervisor_area: formularioData.firma_supervisor_area,
            brigada: formularioData.firma_brigada,
          }
        }),
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar formulario');
      }

      return data;
    } catch (error) {
      console.error('❌ Error enviando formulario:', error);
      throw error;
    }
  }
};