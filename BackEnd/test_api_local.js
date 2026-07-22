async function sendRequest() {
  const payload = {
    "cliente": {
      "nombre": "Test",
      "email": "test@test.com",
      "contacto": "123",
      "numero_identificacion": "123",
      "pais_residencia": "CO",
      "tipo_identificacion": "C.C."
    },
    "reserva": {
      "paquete_id": "",
      "cliente_id": "",
      "plan_type": "Ocasional",
      "llegada": "2026-08-06T15:00:00.000Z",
      "salida": "2026-08-06T22:00:00.000Z",
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
    const response = await fetch('http://localhost:3000/api/reservations/create', {
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
