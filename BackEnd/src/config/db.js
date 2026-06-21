import pg from 'pg';

const { Pool } = pg;

const local_config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  : local_config;

console.log('Config DB:', { ...config, password: '****', connectionString: config.connectionString ? config.connectionString.replace(/:[^:@]+@/, ':****@') : undefined });

// Creamos una instancia del Pool (maneja múltiples conexiones de forma eficiente)
const pool = new Pool(config);

export const connectDB = async () => {
  try {
    // Intentamos obtener un cliente para verificar la conexión
    const client = await pool.connect();
    console.log('PostgreSQL Conectado!');
    client.release(); // Importante liberar el cliente de prueba
  } catch (error) {
    console.error("Error Conectandose a PostgreSQL!");
    console.error(error.message);
    process.exit(1);
  }
};

export default pool;
