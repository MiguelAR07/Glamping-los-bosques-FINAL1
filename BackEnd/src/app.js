import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Servir archivos estáticos (imágenes de cabañas)
app.use('/public', express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => {
  res.send("API de PostgreSQL corriendo");
});

export default app;
