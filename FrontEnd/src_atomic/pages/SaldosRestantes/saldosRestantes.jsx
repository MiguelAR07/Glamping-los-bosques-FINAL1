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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/balance/pending`, {
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/balance/approve/${id}`, {
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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/balance/reject/${id}`, {
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
                                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 10px 0' }}>
                                    <strong>Reserva #{r.id}</strong> | Celular: {r.Celular || 'N/A'}
                                </p>
                                <p style={{ fontSize: '0.9rem', margin: '0 0 5px 0' }}><strong>Paquete:</strong> {r.paquete}</p>
                                <p style={{ fontSize: '0.9rem', margin: '0 0 5px 0' }}><strong>Llegada:</strong> {new Date(r.llegada).toLocaleDateString()} - <strong>Salida:</strong> {new Date(r.salida).toLocaleDateString()}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0 }}><strong>Debe:</strong> ${Number(r['Pago restante']).toLocaleString()}</p>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                        backgroundColor: r.estado_saldo === 'Aprobado' ? '#d1fae5' : r.estado_saldo === 'Rechazado' ? '#fee2e2' : r.estado_saldo === 'En revisión' ? '#fef08a' : '#f3f4f6',
                                        color: r.estado_saldo === 'Aprobado' ? '#065f46' : r.estado_saldo === 'Rechazado' ? '#991b1b' : r.estado_saldo === 'En revisión' ? '#854d0e' : '#374151'
                                    }}>
                                        {r.estado_saldo === 'Aprobado' ? 'Confirmado' : r.estado_saldo === 'Rechazado' ? 'Cancelado' : r.estado_saldo === 'En revisión' ? 'Revisión' : 'Pendiente'}
                                    </span>
                                </div>
                                <button 
                                    className="btn btn-primary mt-2 w-100"
                                    onClick={() => setSelectedReserva(r)}
                                >
                                    {r.comprobante_saldo_url ? 'Revisar Comprobante' : 'Gestionar Saldo'}
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
                        <h4>Gestión de Saldo: {selectedReserva.cliente}</h4>
                        {selectedReserva.comprobante_saldo_url ? (
                            <img 
                                src={selectedReserva.comprobante_saldo_url} 
                                alt="Comprobante de Saldo" 
                                style={{ width: '100%', height: 'auto', margin: '20px 0', borderRadius: '5px' }} 
                            />
                        ) : (
                            <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', margin: '20px 0' }}>
                                <p style={{ margin: 0, color: '#64748b' }}>El cliente aún no ha subido comprobante de pago.</p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '5px' }}>Puedes confirmar el pago manualmente si recibiste el dinero por otro medio.</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedReserva(null)}>Cerrar</button>
                            <button className="btn btn-warning" onClick={() => handleRechazar(selectedReserva.id)}>Pendiente (Cancelar)</button>
                            <button className="btn btn-success" onClick={() => handleAprobar(selectedReserva.id)}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SaldosRestantes;
