const https = require('https');

const data = JSON.stringify({
  precio_promocional: "0.00",
  cabana_id: 1,
  tipo_id: 8,
  dias_estadia: 0,
  descripcion: "Prueba",
  userName: "Sandra Rodriguez"
});

const req = https.request({
  hostname: 'glamping-los-bosques-final1.onrender.com',
  port: 443,
  path: '/api/packages/23',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo1LCJlbWFpbCI6InBhbmVsZ2xhbXBpbmdsb3Nib3NxdWVzQGdtYWlsLmNvbSIsIm5vbWJyZSI6IlNhbmRyYSBSb2RyaWd1ZXoiLCJyb2wiOiJBZG1pbmlzdHJhZG9yIiwiaWF0IjoxNzg0ODE0MTYyLCJleHAiOjE3ODQ4NDI5NjJ9.dIN7dmqROqKWqzHuQ5IpbvLE1VI4b8TGlSCJCvH4ySs'
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', d));
});

req.on('error', console.error);
req.write(data);
req.end();
