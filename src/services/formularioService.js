import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy'; // Importación correcta

class FormularioService {
  constructor() {
    this.db = null;
  }

  async initDatabase() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('formularios.db');
      await this.createTables();
    }
    return this.db;
  }

  async createTables() {
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS formularios_prueba (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_tarea TEXT,
        codigo_formulario TEXT DEFAULT 'prueba',
        nombre_formulario TEXT DEFAULT 'CONTROL DE SPRINKLERS',
        fecha_inspeccion TEXT,
        
        -- Checklist
        red_seca TEXT CHECK(red_seca IN ('SI', 'NO', 'N/A', 'OP', 'NOP', 'OB')),
        red_humeda TEXT CHECK(red_humeda IN ('SI', 'NO', 'N/A', 'OP', 'NOP', 'OB')),
        
        comentario TEXT,
        
        -- Firmas
        firma_supervisor TEXT,
        firma_supervisor_area TEXT,
        firma_brigada TEXT,
        
        -- Imágenes (almacenamos paths relativos)
        imagenes TEXT,
        
        -- Control de sincronización
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE IF NOT EXISTS formulario_imagenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        formulario_id INTEGER,
        image_path TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (formulario_id) REFERENCES formularios_prueba (id)
      );
    `);
  }

  async guardarFormulario(formularioData, imagenes = []) {
    const db = await this.initDatabase();
    
    const imagenesPaths = [];
    
    for (const imagen of imagenes) {
      const fileName = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
      const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
      
      try {
        // ⬇️ USO CORRECTO de la API - Usando copyAsync directamente
        await FileSystem.copyAsync({
          from: imagen.uri,
          to: destinationUri
        });
        
        imagenesPaths.push(destinationUri);
      } catch (error) {
        console.error('Error guardando imagen:', error);
        
        // Manejar error específico de directorio tmp en iOS
        if (error.message.includes('not readable') && imagen.uri.includes('tmp')) {
          await this.manejarImagenTemporalIOS(imagen.uri, destinationUri);
          imagenesPaths.push(destinationUri);
        } else {
          throw error;
        }
      }
    }

    // Insertar en la base de datos
    const result = await db.runAsync(`
      INSERT INTO formularios_prueba (
        id_tarea, codigo_formulario, nombre_formulario, fecha_inspeccion,
        red_seca, red_humeda, comentario,
        firma_supervisor, firma_supervisor_area, firma_brigada,
        imagenes, synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      formularioData.id_tarea || null,
      formularioData.codigo_formulario || 'prueba',
      formularioData.nombre_formulario || 'CONTROL DE SPRINKLERS',
      formularioData.fecha_inspeccion || new Date().toISOString(),
      formularioData.checklist?.red_seca || null,
      formularioData.checklist?.red_humeda || null,
      formularioData.comentario || null,
      formularioData.firmas?.supervisor || null,
      formularioData.firmas?.supervisor_area || null,
      formularioData.firmas?.brigada || null,
      JSON.stringify(imagenesPaths)
    ]);

    // Guardar relación de imágenes
    const formularioId = result.lastInsertRowId;
    for (const path of imagenesPaths) {
      await db.runAsync(`
        INSERT INTO formulario_imagenes (formulario_id, image_path)
        VALUES (?, ?)
      `, [formularioId, path]);
    }

    return formularioId;
  }

  async manejarImagenTemporalIOS(uriOrigen, uriDestino) {
    try {
      // Intentar mover en lugar de copiar para archivos temporales
      await FileSystem.moveAsync({
        from: uriOrigen,
        to: uriDestino
      });
    } catch (moveError) {
      console.error('Error moviendo imagen temporal:', moveError);
      throw moveError;
    }
  }

  async obtenerImagenesFormulario(formularioId) {
    const db = await this.initDatabase();
    const imagenes = await db.getAllAsync(`
      SELECT image_path FROM formulario_imagenes 
      WHERE formulario_id = ?
    `, [formularioId]);
    
    return imagenes.map(img => img.image_path);
  }

  async prepararFormDataParaSubida(formularioId) {
    const db = await this.initDatabase();
    const formulario = await db.getFirstAsync(`
      SELECT * FROM formularios_prueba WHERE id = ?
    `, [formularioId]);
    
    const imagenesPaths = JSON.parse(formulario.imagenes || '[]');
    const formData = new FormData();
    
    // Agregar datos del formulario
    formData.append('id_tarea', formulario.id_tarea);
    formData.append('fecha_inspeccion', formulario.fecha_inspeccion);
    formData.append('red_seca', formulario.red_seca);
    formData.append('red_humeda', formulario.red_humeda);
    formData.append('comentario', formulario.comentario);
    formData.append('firma_supervisor', formulario.firma_supervisor);
    formData.append('firma_supervisor_area', formulario.firma_supervisor_area);
    formData.append('firma_brigada', formulario.firma_brigada);
    
    // Agregar imágenes
    for (let i = 0; i < imagenesPaths.length; i++) {
      const imageUri = imagenesPaths[i];
      
      // Verificar que el archivo existe antes de agregarlo
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        formData.append('fotos', {
          uri: imageUri,
          name: `foto_${formularioId}_${i}.jpg`,
          type: 'image/jpeg'
        });
      }
    }
    
    return formData;
  }

  async sincronizarFormulario(formularioId, serverUrl) {
    try {
      const formData = await this.prepararFormDataParaSubida(formularioId);
      
      const response = await fetch(`${serverUrl}/api/upload-form`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Marcar como sincronizado
      await this.marcarComoSincronizado(formularioId);
      
      return result;
    } catch (error) {
      console.error('Error sincronizando formulario:', error);
      throw error;
    }
  }

  async marcarComoSincronizado(id) {
    const db = await this.initDatabase();
    await db.runAsync(`
      UPDATE formularios_prueba 
      SET synced = 1, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [id]);
  }

  async obtenerFormularios() {
    const db = await this.initDatabase();
    return await db.getAllAsync(`
      SELECT * FROM formularios_prueba 
      ORDER BY created_at DESC
    `);
  }

  async obtenerFormulariosNoSincronizados() {
    const db = await this.initDatabase();
    return await db.getAllAsync(`
      SELECT * FROM formularios_prueba 
      WHERE synced = 0 
      ORDER BY created_at ASC
    `);
  }

  async eliminarFormulario(id) {
    const db = await this.initDatabase();
    
    // Primero eliminar las imágenes asociadas
    const imagenes = await this.obtenerImagenesFormulario(id);
    for (const imagenPath of imagenes) {
      try {
        await FileSystem.deleteAsync(imagenPath);
      } catch (error) {
        console.error('Error eliminando imagen:', error);
      }
    }
    
    // Eliminar de la tabla de imágenes
    await db.runAsync(`
      DELETE FROM formulario_imagenes WHERE formulario_id = ?
    `, [id]);
    
    // Finalmente eliminar el formulario
    await db.runAsync(`
      DELETE FROM formularios_prueba WHERE id = ?
    `, [id]);
  }
}

export const formularioService = new FormularioService();