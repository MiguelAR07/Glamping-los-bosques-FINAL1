const f = async () => {
  for(let i=0; i<30; i++) {
    try {
      const r = await fetch('https://glamping-los-bosques-final1.onrender.com/api/test-email-public');
      const t = await r.text();
      console.log('HTTP', r.status, t);
      if(t.includes('success')) {
        console.log('EXITO!');
        break;
      }
    } catch(e) {
      console.error('Fetch error:', e.message);
    }
    await new Promise(res => setTimeout(res, 5000));
  }
};
f();
