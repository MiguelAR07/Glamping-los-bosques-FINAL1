async function sendRequest() {
  const payload = {
    "cliente": {
      "nombre": "TestName",
      "email": "test@test.com",
      "contacto": "1234567",
      "numero_identificacion": "1234567",
      "pais_residencia": "CO",
      "tipo_identificacion": "C.C."
    },
    "reserva": {
      "paquete_id": "",
      "cliente_id": "",
      "plan_type": "Ocasional",
      "llegada": "2026-08-06T15:00:00.000Z",
      "salida": "2026-08-06T23:00:00.000Z",
      "por_pagar": 50000
    },
    "factura": {
      "reserva_id": "",
      "subtotal": 50000,
      "descuento": 0
    },
    "paquete": {
      "nombre": "Reserva - Cabaña",
      "cabana_id": 1,
      "dias_estadia": 0,
      "descripcion": "Paquete Cabaña - Plan Ocasional",
      "tipo_id": 4
    },
    "servicios": []
  };

  try {
    const response = await fetch('https://backend-landing-x76z.onrender.com/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    console.log("RESPONSE:", response.status, text);
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

sendRequest();
