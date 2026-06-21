const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, rol_id: 1 }, 'mysecretkey');

const data = JSON.stringify({
  nombre: "Test Promo Cabanas",
  descripcion: "Test Desc",
  precio: 100,
  img_url: "",
  cabanas_ids: [1], // Assuming cabana 1 exists
  fecha_inicio: "2026-06-01",
  fecha_fin: "2026-06-10",
  dias_estadia: 1
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/promociones',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
