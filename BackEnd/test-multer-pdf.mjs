async function test() {
    try {
        const fetch = globalThis.fetch;
        const form = new FormData();
        form.append('cliente', JSON.stringify({
            nombre: 'Prueba Local',
            email: 'prueba@local.com',
            contacto: '3001234567',
            tipo_identificacion: 'CC',
            numero_identificacion: '111222333',
            pais_residencia: 'Colombia'
        }));
        
        form.append('reserva', JSON.stringify({
            paquete_id: 10,
            llegada: new Date('2032-02-18T15:00:00Z').toISOString(),
            salida: new Date('2032-02-20T13:00:00Z').toISOString(),
            por_pagar: 0,
            adultos: 2,
            ninos: 0,
            mascotas: 0
        }));

        form.append('factura', JSON.stringify({
            subtotal: 100000,
            descuento: 0
        }));

        // Dummy PDF file
        const blob = new Blob(['%PDF-1.4 dummy pdf'], { type: 'application/pdf' });
        form.append('comprobante', blob, 'test.pdf');

        console.log('Sending POST to Render API with PDF...');
        const res = await fetch('http://localhost:3000/api/reservations', {
            method: 'POST',
            body: form
        });
        
        const text = await res.text();
        console.log('STATUS:', res.status);
        console.log('RESPONSE:', text);
    } catch (e) {
        console.error('FETCH ERROR:', e);
    }
}
test();
