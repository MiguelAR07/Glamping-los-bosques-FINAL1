import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function PagarSaldo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reserva, setReserva] = useState(null);
    const [metodosPago, setMetodosPago] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}/api/balance/${id}`);
                const data = await response.json();
                
                if (response.ok) {
                    setReserva(data.reserva);
                    setMetodosPago(data.metodosPago || []);
                } else {
                    Swal.fire('Error', data.message || 'No se pudo cargar la información.', 'error');
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire('Error', 'Problema de conexión.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            Swal.fire('Atención', 'Debes seleccionar un archivo.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('comprobante', file);

        setUploading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}/api/balance/upload/${id}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Comprobante enviado. Lo revisaremos pronto.', 'success').then(() => {
                    navigate('/inicio'); // Redirigir o recargar
                });
            } else {
                Swal.fire('Error', data.message || 'Error al subir el comprobante', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Cargando...</h2></div>;

    if (!reserva) return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Reserva no encontrada o saldo ya pagado.</h2></div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f3f4f6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                maxWidth: '600px',
                width: '100%'
            }}>
                <h1 style={{ color: '#059669', textAlign: 'center', marginBottom: '10px' }}>Completar Pago</h1>
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px' }}>
                    Sube tu comprobante para finalizar el pago del 50% restante de tu reserva.
                </p>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Resumen de Reserva</h3>
                    <p><strong>A nombre de:</strong> {reserva.cliente}</p>
                    <p><strong>Llegada:</strong> {new Date(reserva.llegada).toLocaleDateString()}</p>
                    <p style={{ fontSize: '1.2rem', color: '#dc2626', fontWeight: 'bold', marginTop: '10px' }}>
                        Saldo Pendiente: ${Number(reserva['Pago restante']).toLocaleString('es-CO')}
                    </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#1e293b', marginBottom: '10px' }}>Métodos de Pago Disponibles:</h4>
                    {metodosPago.map(m => (
                        <div key={m.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
                            <strong>{m.banco}</strong> - {m.tipo_cuenta}: {m.numero_cuenta}
                            <br/><small style={{ color: '#64748b' }}>Titular: {m.titular}</small>
                        </div>
                    ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#1e293b' }}>
                        Adjuntar Comprobante de Transferencia:
                    </label>
                    <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px dashed #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: uploading ? '#94a3b8' : '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {uploading ? 'Subiendo archivo...' : 'Enviar Comprobante'}
                </button>
            </div>
        </div>
    );
}

export default PagarSaldo;
