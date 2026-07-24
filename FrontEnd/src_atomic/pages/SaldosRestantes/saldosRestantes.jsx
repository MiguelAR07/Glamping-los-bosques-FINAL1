import React, { useState, useEffect } from 'react';


import Swal from 'sweetalert2';

function SaldosRestantes() {
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [adminFile, setAdminFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [globalForm, setGlobalForm] = useState({ reservaId: '', metodo: 'Efectivo' });

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
                    Swal.fire('Cancelado', 'El pago ha sido marcado como cancelado/pendiente.', 'success');
                    fetchSaldos();
                    setSelectedReserva(null);
                }
            } catch (error) {
                console.error("Error rejecting:", error);
            }
        }
    };

    const handleAdminUpload = async (id) => {
        if (!adminFile) {
            Swal.fire('Atención', 'Debes seleccionar un archivo.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('comprobante', adminFile);

        setUploading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/balance/upload/${id}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Comprobante subido manualmente.', 'success');
                setAdminFile(null);
                setSelectedReserva(null);
                fetchSaldos();
            } else {
                Swal.fire('Error', 'No se pudo subir el comprobante.', 'error');
            }
        } catch (error) {
            console.error("Error uploading:", error);
            Swal.fire('Error', 'Problema de conexión.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleGlobalSubmit = async () => {
        if (!globalForm.reservaId) {
            return Swal.fire('Error', 'Selecciona una reserva', 'error');
        }
        
        if (globalForm.metodo === 'Transferencia' && !adminFile) {
            return Swal.fire('Error', 'Debes subir un comprobante para transferencia', 'error');
        }

        if (globalForm.metodo === 'Transferencia') {
            const formData = new FormData();
            formData.append('comprobante', adminFile);
            setUploading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/balance/upload/${globalForm.reservaId}`, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    Swal.fire('¡Éxito!', 'Comprobante subido manualmente.', 'success');
                    setShowGlobalModal(false);
                    setAdminFile(null);
                    fetchSaldos();
                } else {
                    Swal.fire('Error', 'No se pudo subir', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                setUploading(false);
            }
        } else {
            handleAprobar(globalForm.reservaId);
            setShowGlobalModal(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h2>Saldos Restantes (50%)</h2>
                    <p style={{ color: '#666', margin: 0 }}>
                        Aquí puedes validar los comprobantes de transferencia del 50% restante que los clientes suben desde su enlace.
                    </p>
                </div>
                <button 
                    className="btn btn-success" 
                    onClick={() => { setShowGlobalModal(true); setGlobalForm({ reservaId: '', metodo: 'Efectivo' }); setAdminFile(null); }}
                >
                    + Saldo Restante Manual
                </button>
            </div>

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
                                <p style={{ fontSize: '0.9rem', margin: '0 0 5px 0', color: '#475569' }}>
                                    Adultos: {r.adultos} | Niños: {r.ninos > 0 ? r.ninos : 'No'} | Mascotas: {r.mascotas > 0 ? r.mascotas : 'No'}
                                </p>
                                <p style={{ fontSize: '0.9rem', margin: '0 0 5px 0', color: '#475569' }}>
                                    <strong>Servicios:</strong> {r['Servicios adicionales'] && r['Servicios adicionales'] !== 'Ninguno' ? r['Servicios adicionales'] : 'No'}
                                </p>
                                <p style={{ fontSize: '0.9rem', margin: '0 0 10px 0' }}><strong>Llegada:</strong> {new Date(r.llegada).toLocaleDateString()} - <strong>Salida:</strong> {new Date(r.salida).toLocaleDateString()}</p>
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
                                
                                {r.estado_saldo !== 'Aprobado' && !r.comprobante_saldo_url && (
                                    <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                        <button 
                                            className="btn btn-success btn-sm w-100"
                                            onClick={() => handleAprobar(r.id)}
                                        >
                                            Pago Manual
                                        </button>
                                        <button 
                                            className="btn btn-primary btn-sm w-100"
                                            onClick={() => setSelectedReserva(r)}
                                        >
                                            Subir Foto
                                        </button>
                                    </div>
                                )}
                                
                                {(r.comprobante_saldo_url || r.estado_saldo === 'Aprobado') && (
                                    <button 
                                        className="btn btn-secondary btn-sm mt-2 w-100"
                                        onClick={() => setSelectedReserva(r)}
                                    >
                                        Ver Detalles / Cambiar
                                    </button>
                                )}
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
                            <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', margin: '20px 0' }}>
                                <p style={{ margin: 0, color: '#64748b', marginBottom: '15px' }}>El cliente aún no ha subido comprobante de pago.</p>
                                
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginBottom: '15px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px', fontWeight: 'bold' }}>Opción 1: Subir comprobante por el cliente</p>
                                    <input 
                                        type="file" 
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setAdminFile(e.target.files[0])}
                                        style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #cbd5e1', borderRadius: '5px' }}
                                    />
                                    <button 
                                        className="btn btn-primary btn-sm w-100" 
                                        disabled={!adminFile || uploading}
                                        onClick={() => handleAdminUpload(selectedReserva.id)}
                                    >
                                        {uploading ? 'Subiendo...' : 'Montar Comprobante'}
                                    </button>
                                </div>
                                
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px', fontWeight: 'bold' }}>Opción 2: Confirmar pago manual (Efectivo)</p>
                                    <button className="btn btn-success btn-sm w-100" onClick={() => handleAprobar(selectedReserva.id)}>
                                        Marcar como pagado (Efectivo / Otro medio)
                                    </button>
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedReserva(null)}>Cerrar</button>
                            <button className="btn btn-warning" onClick={() => handleRechazar(selectedReserva.id)}>Pendiente (Cancelar)</button>
                            {selectedReserva.comprobante_saldo_url && (
                                <button className="btn btn-success" onClick={() => handleAprobar(selectedReserva.id)}>Confirmar Pago</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showGlobalModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1050
                }}>
                    <div style={{
                        background: 'white', padding: '20px', borderRadius: '10px',
                        maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h4>Registro Manual de Saldo</h4>
                        <div className="form-group mt-3">
                            <label><strong>Seleccionar Cliente / Reserva</strong></label>
                            <select 
                                className="form-control" 
                                value={globalForm.reservaId} 
                                onChange={(e) => setGlobalForm({...globalForm, reservaId: e.target.value})}
                            >
                                <option value="">-- Selecciona una reserva pendiente --</option>
                                {saldos.filter(s => s.estado_saldo !== 'Aprobado').map(s => (
                                    <option key={s.id} value={s.id}>Reserva #{s.id} - {s.cliente} (Debe: ${Number(s['Pago restante']).toLocaleString()})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group mt-3">
                            <label><strong>Método de Pago</strong></label>
                            <select 
                                className="form-control"
                                value={globalForm.metodo}
                                onChange={(e) => setGlobalForm({...globalForm, metodo: e.target.value})}
                            >
                                <option value="Efectivo">Efectivo (Pago Directo)</option>
                                <option value="Transferencia">Transferencia (Requiere Comprobante)</option>
                            </select>
                        </div>

                        {globalForm.metodo === 'Transferencia' && (
                            <div className="form-group mt-3">
                                <label><strong>Subir Comprobante (Foto/PDF)</strong></label>
                                <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setAdminFile(e.target.files[0])}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setShowGlobalModal(false)}>Cancelar</button>
                            <button className="btn btn-success" onClick={handleGlobalSubmit} disabled={uploading}>
                                {uploading ? 'Guardando...' : 'Registrar Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SaldosRestantes;
