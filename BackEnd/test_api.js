async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/packages/21', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cabana_id: 3,
        tipo_id: 6,
        dias_estadia: 0,
        descripcion: 'Test update 0 days',
        img_url: '',
        precio_promocional: 0,
        nombre: 'Paquete Ocasional test',
        userName: 'Admin'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
