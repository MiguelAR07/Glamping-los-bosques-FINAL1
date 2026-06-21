import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:miguel2006@localhost:5432/glamping' });

async function migrate() {
    try {
        await client.connect();
        console.log("Conectado a PostgreSQL");

        const query = `
            CREATE TABLE IF NOT EXISTS fechas_bloqueadas (
                id SERIAL PRIMARY KEY,
                cabana_id INT REFERENCES Cabanas(cabana_id) ON DELETE CASCADE,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE NOT NULL,
                motivo VARCHAR(255) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await client.query(query);
        console.log("Tabla 'fechas_bloqueadas' creada o ya existía exitosamente.");

    } catch (error) {
        console.error("Error ejecutando la migración:", error);
    } finally {
        await client.end();
    }
}

migrate();
