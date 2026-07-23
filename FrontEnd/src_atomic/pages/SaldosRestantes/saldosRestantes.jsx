import React, { useState, useEffect } from 'react';


import Swal from 'sweetalert2';

function SaldosRestantes() {
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState(null);

    const token = localStorage.getItem("token");

    const fetchSaldos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}/api/balance/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSaldos(data);
            }
        } catch (error) {
            console.error("Error fetching saldos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSaldos();
    }, []);

    const handleAprobar = async (id) => {
        const result = await Swal.fire({
            title: '¿Aprobar pago de saldo?',
            text: "El saldo restante quedará en $0 y la reserva estará totalmente pagada.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, aprobar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}/api/balance/approve/${id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    Swal.fire('Aprobado', 'El saldo ha sido aprobado.', 'success');
                    setSelectedReserva(null);
                    fetchSaldos();
                } else {
                    Swal.fire('Error', 'No se pudo aprobar el saldo', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de red', 'error');
            }
        }
    };

    const handleRechazar = async (id) => {
        const result = await Swal.fire({
            title: '¿Rechazar comprobante?',
            text: "El comprobante será eliminado y el cliente tendrá que subir uno nuevo.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, rechazar'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}/api/balance/reject/${id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    Swal.fire('Rechazado', 'El comprobante ha sido rechazado.', 'success');
                    setSelectedReserva(null);
                    fetchSaldos();
                } else {
                    Swal.fire('Error', 'No se pudo rechazar', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de red', 'error');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Saldos Restantes (50%)</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
                Aquí puedes validar los comprobantes de transferencia del 50% restante que los clientes suben desde su enlace.
            </p>

            {loading ? (
                <p>Cargando...</p>
            ) : saldos.length === 0 ? (
                <div className="card shadow-sm p-4 text-center text-muted">
                    <p className="m-0">
                        No hay comprobantes pendientes por revisar.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {saldos.map(r => (
                        <div className="card shadow-sm" key={r.id}>
                            <div className="card-body">
                                <h3>{r.cliente}</h3>
                                <p><strong>Llegada:</strong> {new Date(r.llegada).toLocaleDateString()}</p>
                                <p><strong>Debe:</strong> ${Number(r['Pago restante']).toLocaleString()}</p>
                                <button 
                                    className="btn btn-primary mt-2 w-100"
                                    onClick={() => setSelectedReserva(r)}
                                >
                                    Revisar Comprobante
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedReserva && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1050
                }}>
                    <div style={{
                        background: 'white', padding: '20px', borderRadius: '10px',
                        maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h4>Comprobante de {selectedReserva.cliente}</h4>
                        <img 
                            src={selectedReserva.comprobante_saldo_url} 
                            alt="Comprobante de Saldo" 
                            style={{ width: '100%', height: 'auto', margin: '20px 0', borderRadius: '5px' }} 
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedReserva(null)}>Cerrar</button>
                            <button className="btn btn-danger" onClick={() => handleRechazar(selectedReserva.id)}>Rechazar</button>
                            <button className="btn btn-success" onClick={() => handleAprobar(selectedReserva.id)}>Aprobar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SaldosRestantes;
