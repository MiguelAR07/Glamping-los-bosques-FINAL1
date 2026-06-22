async function test() {
  try {
    const res = await fetch('https://glamping-los-bosques-final1.onrender.com/api/login/send-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'panelglampinglosbosques@gmail.com', contrasena: '123456' })
    });
    const data = await res.json();
    console.log("Send Reset Code Response:", res.status, data);
  } catch(e) {
    console.error(e);
  }
}
test();
