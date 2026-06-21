-- Tablas Maestras de Configuración
-- INSERT INTO Roles (Nombre) VALUES ('Administrador'), ('Recepcionista'), ('Mantenimiento');

INSERT INTO Tipo_Paquete (Nombre) VALUES ('Familiar'), ('Parejas'), ('Aventura');

INSERT INTO Metodos_Pago (Tipo, Nombre) VALUES 
('Efectivo', 'Pago físico en recepción'),
('Transferencia', 'Bancolombia o Nequi'),
('Tarjeta', 'Datafono Visa/Mastercard');

-- Infraestructura y Catálogo
INSERT INTO Cabanas (Nombre, Precio_Noche, Capacidad_Personas, Descripcion, IMG_URL) VALUES 
('Nido del Águila', 350000, 2, 'Vista panorámica al valle', 'https://url.com/c1.jpg'),
('Refugio del Bosque', 280000, 4, 'Rodeada de pinos', 'https://url.com/c2.jpg'),
('Cabaña Cristal', 450000, 2, 'Techo de cristal para ver estrellas', 'https://url.com/c3.jpg');

INSERT INTO Servicios (Nombre, Encargado, Duracion_Minutos, Precio, Descripcion, IMG_URL) VALUES 
('Masaje Relajante', 'Marta Soler', 60, 80000, 'Masaje de cuerpo completo', 'https://url.com/s1.jpg'),
('Cena Romántica', 'Chef Juan', 120, 150000, '3 tiempos a la luz de las velas', 'https://url.com/s2.jpg'),
('Fogata Privada', 'Personal Campo', 90, 45000, 'Incluye malvaviscos', 'https://url.com/s3.jpg');

INSERT INTO Productos (Nombre, Tipo, Precio, Descripcion, IMG_URL) VALUES 
('Vino Tinto Reserva', 'Bebida', 95000, 'Botella 750ml', 'https://url.com/p1.jpg'),
('Kit de Smores', 'Snack', 25000, 'Chocolate, galletas y nubes', 'https://url.com/p2.jpg'),
('Cerveza Artesanal', 'Bebida', 12000, 'Local 330ml', 'https://url.com/p3.jpg');

-- Personal y Clientes
-- INSERT INTO Usuarios (Rol_ID, tipo_identificacion, numero_identificacion, Nombre, Contacto, Sueldo, Fecha_Agregado) VALUES 
-- (1, 'CC', '10203040', 'Joe Lopez', '3001234567', 2500000, CURRENT_TIMESTAMP),
-- (2, 'CC', '50607080', 'Ana Martinez', '3109876543', 1300000, CURRENT_TIMESTAMP);

INSERT INTO Clientes (tipo_identificacion, Nombre, Email, Contacto, numero_identificacion, Pais_Residencia) VALUES 
('CC', 'Carlos Ruiz', 'carlos@mail.com', '3110001122', '123456', 'Colombia'),
('PAS', 'Jane Doe', 'jane@mail.com', '+15551234', 'PA887766', 'USA'),
('CC', 'Luis Perez', 'luis@mail.com', '3204445566', '789012', 'Colombia');

-- Paquetes (Crucial para Reservas)
INSERT INTO Paquetes (Cabana_ID, Tipo_ID, Registrado_Por_ID, Nombre, Dias_Estadia, Descripcion) VALUES 
(1, 2, (SELECT MAX(Usuario_ID) FROM Usuarios), 'Escapada Romántica', 2, 'Ideal para parejas en aniversario'),
(2, 1, (SELECT MAX(Usuario_ID) FROM Usuarios), 'Plan Familiar', 3, 'Diversión en el bosque'),
(3, 3, (SELECT MAX(Usuario_ID) FROM Usuarios), 'Aventura Estelar', 1, 'Noche de telescopio');

-- Reservas y Facturas (10 Registros)
-- Reservas
INSERT INTO Reservas (Paquete_ID, Cliente_ID, Llegada, Salida, Estado, Por_pagar) VALUES 
(1, 1, '2026-05-01', '2026-05-03', 'Confirmada', 0),
(1, 2, '2026-05-10', '2026-05-12', 'Confirmada', 150000),
(2, 3, '2026-06-01', '2026-06-04', 'Confirmada', 0),
(3, 1, '2026-05-15', '2026-05-16', 'Pendiente', 500000),
(2, 2, '2026-07-20', '2026-07-23', 'Confirmada', 0),
(1, 3, '2026-08-10', '2026-08-12', 'Cancelada', 0),
(3, 2, '2026-09-01', '2026-09-02', 'Confirmada', 0),
(2, 1, '2026-10-05', '2026-10-08', 'Confirmada', 200000),
(1, 2, '2026-11-01', '2026-11-03', 'Confirmada', 0),
(3, 3, '2026-12-24', '2026-12-25', 'Confirmada', 0);

-- Facturas (Relacionadas 1 a 1 con las reservas anteriores)
-- Nota: 'Total' no se inserta porque es GENERATED ALWAYS y se calcula solo.
INSERT INTO Facturas (Reserva_ID, Subtotal, Descuento) VALUES 
(1, 850000, 10), (2, 920000, 0), (3, 1200000, 5),
(4, 500000, 0), (5, 1150000, 0), (6, 0, 0),
(7, 600000, 15), (8, 1100000, 0), (9, 880000, 10),
(10, 750000, 20);

-- Pagos y Otros (Para completar el flujo)
INSERT INTO Pagos (Metodo_ID, Factura_ID, Fecha_Pago, Estado, Total_Pagado) VALUES 
(2, 1, '2026-04-15', 'Completado', 765000),
(1, 3, '2026-05-20', 'Completado', 1140000);

INSERT INTO Danos_Mantenimientos (Cabana_ID, Descripcion, Estado, Responsable) VALUES 
(1, 'Cambio de bombillas led', 'Terminado', 'Pedro Mantenimiento'),
(2, 'Fuga en el jacuzzi', 'En proceso', 'Fontanero Ext');
