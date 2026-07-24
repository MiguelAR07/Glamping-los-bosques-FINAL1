import React, { useState, useEffect } from 'react';


import Swal from 'sweetalert2';
import styled from "styled-components";
import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import TablaGeneral from "../../components/organisms/tabla";
import ModalPlantilla from "../../components/organisms/Modales/modalPlantilla";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;

  input, select, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-family: inherit;
  }

  button {
    padding: 10px;
    background-color: #43523A;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #2c3825;
    }
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;

const Botones = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

function SaldosRestantes() {
    const [saldos, setSaldos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [adminFile, setAdminFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const [showGlobalModal, setShowGlobalModal] = useState(false);
    const [globalForm, setGlobalForm] = useState({ reservaId: '', metodo: 'Efectivo' });

    // Funciones para TablaGeneral
    const mapSaldosData = (data) => {
        return data.map(item => ({
            id: item.id,
            "Reserva": `Reserva #${item.id}`,
            "Cliente": item.cliente,
            "Paquete": item.paquete,
            "Llegada": new Date(item.llegada).toLocaleDateString(),
            "Salida": new Date(item.salida).toLocaleDateString(),
            "Celular": item.celular || 'N/A',
            "Adultos": item.adultos,
            "Debe": `$${Number(item['Pago restante'] || 0).toLocaleString()}`,
            "Estado Saldo": item.estado_saldo === 'Aprobado' ? 'Confirmado' : item.estado_saldo === 'Rechazado' ? 'Cancelado' : item.estado_saldo === 'En revisión' ? 'Revisión' : 'Pendiente',
            "comprobante": item.comprobante_saldo_url,
            "estado_saldo_raw": item.estado_saldo
        }));
    };

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
            <Botones>
                <div>
                    <h2>Saldos Restantes (50%)</h2>
                    <p style={{ color: '#666', margin: 0 }}>
                        Aquí puedes validar los comprobantes de transferencia del 50% restante que los clientes suben desde su enlace.
                    </p>
                </div>
                <BotonAgregar
                    modulo={'Saldo Restante Manual'}
                    color={1}
                    onClick={() => { setShowGlobalModal(true); setGlobalForm({ reservaId: '', metodo: 'Efectivo' }); setAdminFile(null); }}
                />
            </Botones>

            {loading ? (
                <p>Cargando...</p>
            ) : saldos.length === 0 ? (
                <div className="card shadow-sm p-4 text-center text-muted">
                    <p className="m-0">No hay comprobantes pendientes por revisar.</p>
                </div>
            ) : (
                <TablaGeneral
                    data={mapSaldosData(saldos)}
                    hiddenColumns={['id', 'estado_saldo_raw']}
                    columnMapping={{
                        "comprobante": "Comprobante"
                    }}
                    rowClassNameCondition={(fila) => fila.estado_saldo_raw === 'Aprobado' ? 'row-success' : ''}
                    acciones={[
                        {
                            title: "Confirmar",
                            icono: <i className="bi bi-check-circle-fill" style={{ fontSize: '1.2rem' }}></i>,
                            color: "#28a745",
                            onClick: (fila) => handleAprobar(fila.id),
                            condition: (fila) => fila.estado_saldo_raw !== 'Aprobado'
                        },
                        {
                            title: "Ver Comprobante",
                            icono: <i className="bi bi-file-earmark-image" style={{ fontSize: '1.2rem' }}></i>,
                            color: "#0dcaf0",
                            onClick: (fila) => setSelectedReserva(fila)
                        },
                        {
                            title: "Cancelar",
                            icono: <i className="bi bi-x-circle-fill" style={{ fontSize: '1.2rem' }}></i>,
                            color: "#dc3545",
                            onClick: (fila) => handleRechazar(fila.id),
                            condition: (fila) => fila.estado_saldo_raw !== 'Rechazado'
                        }
                    ]}
                />
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
                <ModalPlantilla modulo="Registro Manual de Saldo" onClose={() => setShowGlobalModal(false)}>
                    <Form onSubmit={(e) => { e.preventDefault(); handleGlobalSubmit(); }}>
                        <div>
                            <label><strong>Seleccionar Cliente / Reserva</strong></label>
                            <select 
                                value={globalForm.reservaId} 
                                onChange={(e) => setGlobalForm({...globalForm, reservaId: e.target.value})}
                                required
                            >
                                <option value="">-- Selecciona una reserva pendiente --</option>
                                {saldos.filter(s => s.estado_saldo !== 'Aprobado').map(s => (
                                    <option key={s.id} value={s.id}>Reserva #{s.id} - {s.cliente} (Debe: ${Number(s['Pago restante']).toLocaleString()})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label><strong>Método de Pago</strong></label>
                            <select 
                                value={globalForm.metodo}
                                onChange={(e) => setGlobalForm({...globalForm, metodo: e.target.value})}
                            >
                                <option value="Efectivo">Efectivo (Pago Directo)</option>
                                <option value="Transferencia">Transferencia (Requiere Comprobante)</option>
                            </select>
                        </div>

                        {globalForm.metodo === 'Transferencia' && (
                            <div>
                                <label><strong>Subir Comprobante (Foto/PDF)</strong></label>
                                <input 
                                    type="file" 
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setAdminFile(e.target.files[0])}
                                    required={globalForm.metodo === 'Transferencia'}
                                />
                            </div>
                        )}

                        <button type="submit" disabled={uploading}>
                            {uploading ? 'Guardando...' : 'Registrar Pago'}
                        </button>
                    </Form>
                </ModalPlantilla>
            )}
        </div>
    );
}

export default SaldosRestantes;
