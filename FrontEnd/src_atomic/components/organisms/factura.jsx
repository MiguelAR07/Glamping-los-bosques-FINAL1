import { useLocation, Link, Navigate } from "react-router-dom";
import { CheckCircle2, UploadCloud, Calendar, MapPin, Users, Building2, Send } from "lucide-react";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";

/**
 * Página de Confirmación de Reserva
 * Muestra el resumen, instrucciones de pago y permite subir el comprobante.
 */
export function BookingConfirmation() {
  const location = useLocation();
  const state = location.state;
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Hacer scroll al inicio al cargar la página para que el usuario vea el resumen
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Si alguien entra a la URL directamente sin haber reservado, lo mandamos al inicio
  if (!state) {
    return <Navigate to="/" replace />;
  }

  const { cabin, planType, dateRange, guests, total, deposit, formData } = state;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limpiamos estados previos antes de validar el nuevo archivo
      setError(null);
      setFile(null);
      setPreview(null);

      // Bajamos el límite a 4MB para cumplir con el límite de Vercel (4.5MB total payload)
      if (selectedFile.size > 4 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 4MB.");
        return;
      }
      
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPreview(reader.result as string);
        }
      };
      reader.onerror = () => {
        setError("Error al leer el archivo. Intenta con otro.");
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!preview) {
      setError("Por favor, sube un comprobante de pago.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationDetails: {
            cabinName: cabin.name,
            planType,
            dateRange,
            guests,
            total,
            deposit,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            document: `${formData.documentType} ${formData.document}`
          },
          receiptImageBase64: preview
        })
      });

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If Vercel returns HTML (e.g., 413 Payload Too Large)
        throw new Error(response.status === 413 
          ? "El archivo es demasiado grande para el servidor (Límite 4.5MB)." 
          : "Ocurrió un error en el servidor. Por favor, intenta de nuevo.");
      }

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        throw new Error(data.error || "Error al enviar la reserva");
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado al procesar tu reserva.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-10 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 mb-4">¡Comprobante Recibido!</h2>
          <p className="text-stone-600 text-lg mb-8">
            Hemos recibido tu solicitud de reserva y la foto de tu transferencia. 
            Verificaremos el pago y te enviaremos la confirmación oficial muy pronto.
          </p>
          <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg">
            Volver a la página principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-8 py-8 text-center text-white relative overflow-hidden">
          <h1 className="text-3xl font-extrabold mb-2 relative z-10">Paso Final: Pago y Confirmación</h1>
          <p className="text-emerald-100 text-lg relative z-10 max-w-xl mx-auto">
            Revisa los detalles de tu reserva y realiza el pago del anticipo para asegurar tu estadía.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Detalles de la Reserva (Izquierda) */}
          <div className="px-8 py-10 border-b lg:border-b-0 lg:border-r border-stone-100 bg-stone-50/50">
            <h2 className="text-xl font-bold text-stone-900 mb-6 border-b border-stone-200 pb-4">Resumen de la Reserva</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold text-stone-900">{cabin.name}</p>
                  <p className="text-sm text-stone-500 capitalize">Plan {planType.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold text-stone-900">Fecha</p>
                  <p className="text-sm text-stone-500">
                    {dateRange.to 
                      ? `${dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} - ${format(dateRange.to, 'dd/MM/yyyy')}`
                      : (dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : '')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <p className="font-semibold text-stone-900">Huéspedes</p>
                  <p className="text-sm text-stone-500">{guests} personas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-4 border-t border-stone-200">
                <div className="space-y-1">
                  <p className="text-xs text-stone-400 uppercase font-bold tracking-wider">A nombre de</p>
                  <p className="text-sm font-medium text-stone-700">{formData.name}</p>
                  <p className="text-sm text-stone-600">{formData.documentType} {formData.document}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wide">Total a Pagar Hoy</h3>
              <div className="flex justify-between items-end">
                <span className="text-stone-500 text-sm">Anticipo (50%)</span>
                <span className="text-3xl font-black text-emerald-700">${deposit.toLocaleString('es-CO')}</span>
              </div>
              <p className="text-xs text-stone-400 mt-2 text-right">Saldo restante: ${(total - deposit).toLocaleString('es-CO')}</p>
            </div>
          </div>

          {/* Instrucciones de Pago y Subida de Archivo (Derecha) */}
          <div className="px-8 py-10 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Realiza tu transferencia</h2>
              
              {/* Cuentas */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <Building2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Bancolombia (Ahorros)</p>
                    <p className="text-lg font-mono text-stone-700 my-1">123-456789-00</p>
                    <p className="text-xs text-stone-500">A nombre de Glamping Los Bosques SAS</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="w-6 h-6 rounded bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">N</div>
                  <div>
                    <p className="font-bold text-stone-900">Nequi</p>
                    <p className="text-lg font-mono text-stone-700 my-1">310 359 9065</p>
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="mb-6">
                <h3 className="font-bold text-stone-900 mb-2">Sube tu comprobante</h3>
                <p className="text-sm text-stone-500 mb-3">Toma un pantallazo de tu transferencia exitosa y súbelo aquí para confirmar tu reserva.</p>
                
                <div 
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    fileInputRef.current?.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    preview ? 'border-emerald-500 bg-emerald-50' : 'border-stone-300 hover:border-emerald-400 hover:bg-stone-50'
                  }`}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*,application/pdf" 
                    onChange={handleFileChange}
                  />
                  {preview ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                      <p className="font-medium text-emerald-700">Comprobante cargado exitosamente</p>
                      <p className="text-xs text-stone-500 mt-1">{file?.name}</p>
                      <button className="text-sm text-emerald-600 underline mt-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Cambiar archivo</button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-10 h-10 text-stone-400 mb-2" />
                      <p className="font-medium text-stone-700">Haz clic aquí para seleccionar el archivo</p>
                      <p className="text-xs text-stone-400 mt-1">Soporta JPG, PNG o PDF (Máx 5MB)</p>
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !preview}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isSubmitting || !preview 
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Enviar y Confirmar Reserva
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
