require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const { termsModel } = require('./src/models/terms.model.js');

async function testTermsModel() {
  console.log("=== PROBANDO MODELO DE TERMINOS Y CONDICIONES ===");
  const allTerms = await pool.query(termsModel.getTerms);
  console.log("Términos encontrados:", allTerms.rows.length);
  console.table(allTerms.rows);
  pool.end();
}

testTermsModel().catch(console.error);
