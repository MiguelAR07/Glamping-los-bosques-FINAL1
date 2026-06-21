import 'dotenv/config';
import pool from './src/config/db.js';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  try {
    console.log("Conectando a la base de datos...");
    
    console.log("Ajustando estructura de base de datos...");
    await pool.query("ALTER TABLE productos ADD COLUMN IF NOT EXISTS img_url TEXT DEFAULT '';");

    // 1. Ejecutar Inserccion_GlampingDB.sql
    console.log("Limpiando datos de prueba anteriores y reiniciando IDs...");
    await pool.query(`
        TRUNCATE TABLE Tipo_Paquete, Cabanas, Servicios, Productos, Clientes, Metodos_Pago RESTART IDENTITY CASCADE;
    `);

    console.log("Insertando datos de prueba...");
    const insercionPath = path.resolve('../Model/Inserccion_GlampingDB.sql');
    if (fs.existsSync(insercionPath)) {
        const insercionSql = fs.readFileSync(insercionPath, 'utf8');
        try {
            await pool.query(insercionSql);
            console.log("✅ Datos de prueba insertados.");
        } catch (err) {
            console.log("⚠️ Nota al insertar datos (puede que ya existieran):", err.message);
        }
    } else {
        console.log("❌ No se encontró el archivo Inserccion_GlampingDB.sql");
    }

    // 2. Ejecutar Views_GlampingDB.sql
    console.log("Creando Vistas (necesarias para que el panel cargue datos)...");
    const viewsPath = path.resolve('../Model/Views_GlampingDB.sql');
    if (fs.existsSync(viewsPath)) {
        const viewsSql = fs.readFileSync(viewsPath, 'utf8');
        try {
            await pool.query(viewsSql);
            console.log("✅ Vistas creadas exitosamente.");
        } catch (err) {
            console.log("⚠️ Nota al crear vistas:", err.message);
        }
    } else {
        console.log("❌ No se encontró el archivo Views_GlampingDB.sql");
    }

    // 3. Ejecutar Triggers_GlampingDB.sql
    console.log("Creando Triggers...");
    const triggersPath = path.resolve('../Model/Triggers_GlampingDB.sql');
    if (fs.existsSync(triggersPath)) {
        const triggersSql = fs.readFileSync(triggersPath, 'utf8');
        try {
            await pool.query(triggersSql);
            console.log("✅ Triggers creados exitosamente.");
        } catch (err) {
            console.log("⚠️ Nota al crear triggers:", err.message);
        }
    } else {
        console.log("❌ No se encontró el archivo Triggers_GlampingDB.sql");
    }

    console.log("\n🚀 ¡Base de datos completamente configurada! Recarga la página del panel.");
  } catch (error) {
    console.error("Error crítico:", error);
  } finally {
    process.exit();
  }
}

setupDatabase();
