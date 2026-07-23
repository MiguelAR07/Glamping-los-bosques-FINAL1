const http = require('http');
const data = JSON.stringify({
  precio_promocional: '200000',
  cabana_id: 1,
  tipo_id: 7,
  dias_estadia: 1,
  descripcion: 'Test update via API',
  userName: 'Tester'
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/packages/14',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzg0ODIxMDQzfQ.Eiz-16q2BWLgX7mEc0d0rZKopFFuM1g7Q8KYwWDD3Io'
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', d));
});

req.on('error', console.error);
req.write(data);
req.end();
