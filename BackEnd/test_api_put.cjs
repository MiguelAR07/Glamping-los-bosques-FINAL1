require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1, rol: 'Administrador' }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });

async function test() {
  const res = await fetch('http://localhost:3001/api/packages/10', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      cabana_id: 1,
      tipo_id: 4,
      dias_estadia: 1,
      descripcion: "test update from API route",
      precio_promocional: 450000,
      userName: 'Admin'
    })
  });
  
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Body:", data);
}

test();
