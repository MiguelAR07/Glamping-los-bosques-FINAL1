import cron from 'node-cron';
import pool from '../config/db.js';
import { transporter } from './nodemailer.service.js';

export const startCronJobs = () => {
    // Se ejecuta cada hora en el minuto 0
    cron.schedule('0 * * * *', async () => {
        console.log('⏳ Ejecutando Cron Job: Verificación de recordatorios de saldo...');
        try {
            // Buscar reservas que tengan saldo pendiente, no canceladas, y sin recordatorio enviado
            const result = await pool.query(`
                SELECT 
                    r.id, r.llegada, c.nombre as cliente_nombre, c.email as cliente_email,
                    r.por_pagar, r.recordatorio_24h_enviado
                FROM reservas r
                JOIN clientes c ON r.cliente_id = c.id
                WHERE r.estado_saldo = 'Pendiente' 
                  AND r.recordatorio_24h_enviado = FALSE
                  AND r.estado != 'Cancelada'
                  AND r.estado != 'Rechazada'
                  AND r.por_pagar > 0
            `);

            const reservas = result.rows;
            const now = new Date();

            for (const reserva of reservas) {
                // Asumimos check-in a las 15:00 (3:00 PM) hora local
                const llegadaDate = new Date(reserva.llegada);
                // Si la fecha de llegada está en UTC, ajustamos a las 15:00 local.
                // Usaremos setHours para colocar las 15:00
                llegadaDate.setHours(15, 0, 0, 0);

                const diffMs = llegadaDate - now;
                const diffHours = diffMs / (1000 * 60 * 60);

                // Si faltan 24 horas o menos para el check-in (esto cubre el caso de 2-3 horas también si reservaron el mismo día)
                // y el evento aún no ha pasado (diffHours > 0)
                if (diffHours <= 24 && diffHours > 0) {
                    
                    // Enviar correo de recordatorio
                    try {
                        await transporter.sendMail({
                            from: '"Glamping Los Bosques" <glampinglosbosques9@gmail.com>',
                            to: reserva.cliente_email,
                            subject: '⚠️ Recordatorio: Pago de Saldo Restante - Glamping Los Bosques',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                                    <h2 style="color: #059669; text-align: center;">Recordatorio de Pago</h2>
                                    <p>Hola <strong>${reserva.cliente_nombre}</strong>,</p>
                                    <p>Te recordamos que tu estadía en Glamping Los Bosques está muy cerca. Tienes un saldo pendiente por pagar de <strong>$${Number(reserva.por_pagar).toLocaleString('es-CO')}</strong>.</p>
                                    
                                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
                                        <p style="margin: 0; color: #856404;">
                                            Por favor, recuerda que <strong>debes pagar este 50% restante antes de estar en nuestras instalaciones</strong>.<br><br>
                                            👉 <a href="https://glampinglosbosques.com/pagar-saldo/${reserva.id}" style="color: #155724; font-weight: bold; text-decoration: underline;">Sube el comprobante de tu saldo restante haciendo clic aquí.</a>
                                        </p>
                                    </div>
                                    <p>¡Te esperamos pronto!</p>
                                </div>
                            `
                        });

                        // Marcar recordatorio como enviado
                        await pool.query(
                            'UPDATE reservas SET recordatorio_24h_enviado = TRUE WHERE id = $1',
                            [reserva.id]
                        );
                        console.log(`✅ Recordatorio enviado a ${reserva.cliente_email} para la reserva ${reserva.id}`);
                        
                    } catch (emailError) {
                        console.error(\`❌ Error al enviar correo de recordatorio a \${reserva.cliente_email}:\`, emailError);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error en el Cron Job de saldos:', error);
        }
    });
};
