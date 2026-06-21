const http = require('http');

const data = JSON.stringify({
  nombre: "Test Promo",
  descripcion: "Test Desc",
  precio: 100,
  img_url: "",
  cabanas_ids: [],
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
    'Content-Length': data.length
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
