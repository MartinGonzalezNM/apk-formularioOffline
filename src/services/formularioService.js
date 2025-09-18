import * as SQLite from 'expo-sqlite';

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
        
        -- Control de sincronización
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
  }

  async guardarFormulario(formularioData) {
    const db = await this.initDatabase();
    
    const result = await db.runAsync(`
      INSERT INTO formularios_prueba (
        id_tarea, codigo_formulario, nombre_formulario, fecha_inspeccion,
        red_seca, red_humeda, comentario,
        firma_supervisor, firma_supervisor_area, firma_brigada,
        synced
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
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
      formularioData.firmas?.brigada || null
    ]);

    return result.lastInsertRowId;
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

  async marcarComoSincronizado(id) {
    const db = await this.initDatabase();
    await db.runAsync(`
      UPDATE formularios_prueba 
      SET synced = 1, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [id]);
  }

  async eliminarFormulario(id) {
    const db = await this.initDatabase();
    await db.runAsync(`
      DELETE FROM formularios_prueba WHERE id = ?
    `, [id]);
  }
}

export const formularioService = new FormularioService();