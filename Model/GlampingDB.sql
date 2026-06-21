-- 1. CREACIÓN DE TABLAS BASE (Sin dependencias circulares)

CREATE TABLE Servicios (
    Servicio_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Encargado VARCHAR(100),
    Duracion_Minutos INT NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Descripcion TEXT DEFAULT 'Sin descripcion',
    Fecha_Actualizacion DATE DEFAULT CURRENT_DATE,
	Estado VARCHAR(50) DEFAULT 'Activo',
	IMG_URL TEXT NOT NULL
);

CREATE TABLE Productos (
    Producto_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Tipo VARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Descripcion TEXT DEFAULT 'Sin descripcion',
    img_url TEXT DEFAULT 'Sin imagen'
    Fecha_Actualizacion DATE DEFAULT CURRENT_DATE,
	Estado VARCHAR(50) DEFAULT 'Activo'
);

CREATE TABLE Cabanas (
    Cabana_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Precio_Noche DECIMAL(10,2) NOT NULL,
	Capacidad_Personas INT NOT NULL,
    Fecha_Registro DATE DEFAULT CURRENT_DATE,
    Descripcion TEXT DEFAULT 'Sin descripcion',
    Fecha_Mantenimiento DATE,
    Estado VARCHAR(50) DEFAULT 'Activo',
    IMG_URL TEXT
);

CREATE TABLE imagenes_cabana (
    imagen_id SERIAL PRIMARY KEY,
    cabana_id INT NOT NULL,
    img_url TEXT NOT NULL
);

CREATE TABLE Danos_Mantenimientos (
    Dano_ID SERIAL PRIMARY KEY,
    Cabana_ID INT NOT NULL,
    Descripcion TEXT DEFAULT 'Sin descripcion',
    Estado VARCHAR(100),
    Fecha_Registro DATE DEFAULT CURRENT_DATE NOT NULL,
    Fecha_Arreglo DATE,
    Responsable VARCHAR(100)
);

CREATE TABLE Tipo_Paquete (
    Tipo_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL
);

-- 2. TABLAS DE USUARIOS Y ACCESO

CREATE TABLE Roles (
    Rol_ID SERIAL PRIMARY KEY,
    Nombre VARCHAR(50) DEFAULT 'Empleado'
);

CREATE TABLE Usuarios (
    Usuario_ID SERIAL PRIMARY KEY,
    Rol_ID INT NOT NULL,
    tipo_identificacion VARCHAR(10) NOT NULL,
    numero_identificacion VARCHAR(255) NOT NULL UNIQUE,
    Nombre VARCHAR(50) NOT NULL,
    Contacto VARCHAR(100) UNIQUE, -- Espacio para encriptación
    Sueldo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
	Estado VARCHAR(50) DEFAULT 'Activo',
	Fecha_Agregado TIMESTAMP NOT NULL,
	Fecha_Actualizacion TIMESTAMP
);

CREATE TABLE Login (
    Login_ID SERIAL PRIMARY KEY,
    Usuario_ID INT,
    Email VARCHAR(250) NOT NULL UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
	Estado VARCHAR(50) DEFAULT 'Activo'
);

CREATE TABLE Logs_login (
    Log_ID SERIAL PRIMARY KEY,
    Login_ID INT,
    Accion VARCHAR(50),
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Detalles TEXT
);

-- 3. PAQUETES Y RELACIONES (Precios removidos para cálculo dinámico)

CREATE TABLE Paquetes (
    Paquete_ID SERIAL PRIMARY KEY,
	Cabana_ID INT NOT NULL,
    Tipo_ID INT NOT NULL,
    Nombre VARCHAR(100) NOT NULL,
    Dias_Estadia INT NOT NULL,
    Descripcion TEXT DEFAULT 'Sin descripcion',
    Registrado_Por_ID INT,
    Fecha_Registro DATE DEFAULT CURRENT_DATE,
    Estado VARCHAR(50) DEFAULT 'Activo'
);

CREATE TABLE Servicios_Por_Paquete (
    Servicio_Paquete_ID SERIAL PRIMARY KEY,
    Paquete_ID INT NOT NULL,
    Servicio_ID INT NOT NULL,
    Cantidad_Personas INT DEFAULT 1
);

CREATE TABLE Productos_Por_Paquete (
    Producto_Paquete_ID SERIAL PRIMARY KEY,
    Paquete_ID INT NOT NULL,
    Producto_ID INT NOT NULL,
    Cantidad INT DEFAULT 1
);

-- 4. CLIENTES, RESERVAS Y PAGOS

CREATE TABLE Clientes (
    Cliente_ID SERIAL PRIMARY KEY,
    tipo_identificacion VARCHAR(10) NOT NULL,
	numero_identificacion VARCHAR(255) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Contacto VARCHAR(100) NOT NULL,
    Pais_Residencia VARCHAR(100) NOT NULL
);

CREATE TABLE Reservas (
    Reserva_ID SERIAL PRIMARY KEY,
    Paquete_ID INT NOT NULL,
    Cliente_ID INT NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Llegada DATE NOT NULL,
    Salida DATE NOT NULL,
    Estado VARCHAR(50) DEFAULT 'Activo',
    Por_pagar DECIMAL(10,2) NOT NULL -- a diferencia de facturas, este valor se actualiza con cada pago
);

CREATE TABLE Facturas (
    Factura_ID SERIAL PRIMARY KEY,
    Reserva_ID INT NOT NULL,
    Fecha_Factura DATE DEFAULT CURRENT_DATE,
    Subtotal DECIMAL(10,2),
    Descuento DECIMAL(5,2) DEFAULT 0.00, -- Porcentaje (ej: 0.10 para 10%)
	Total NUMERIC GENERATED ALWAYS AS (
		ROUND(Subtotal * (1 - Descuento / 100), 2)
	) STORED,
	Total_Restante NUMERIC
);

CREATE TABLE Metodos_Pago (
    Metodo_ID SERIAL PRIMARY KEY,
    Tipo VARCHAR(50) NOT NULL,
    Nombre TEXT DEFAULT 'Sin descripcion'
);

CREATE TABLE Pagos (
    Pago_ID SERIAL PRIMARY KEY,
    Metodo_ID INT NOT NULL,
    Factura_ID INT NOT NULL,
    Fecha_Pago DATE DEFAULT CURRENT_DATE NOT NULL,
    Estado VARCHAR(50),
    Total_Pagado DECIMAL(10,2)
);

CREATE TABLE Reembolsos (
    Reembolso_ID SERIAL PRIMARY KEY,
    Factura_ID INT NOT NULL UNIQUE,
    Fecha DATE DEFAULT CURRENT_DATE NOT NULL,
    Justificacion TEXT NOT NULL,
    Estado VARCHAR(50) NOT NULL,
    Monto DECIMAL(10,2) NOT NULL
);

CREATE TABLE Notificaciones (
    Notificacion_ID SERIAL PRIMARY KEY,
    Titulo VARCHAR(50) NOT NULL,
    Asunto VARCHAR(50) NOT NULL,
    Mensaje TEXT NOT NULL,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-------------------------- FOREIGN KEYS -----------------------------
ALTER TABLE Servicios_Por_Paquete 
    ADD CONSTRAINT fk_Servicio_Paquete FOREIGN KEY (Paquete_ID) REFERENCES Paquetes(Paquete_ID) ON UPDATE CASCADE,
    ADD CONSTRAINT fk_Servicio_Servicios FOREIGN KEY (Servicio_ID) REFERENCES Servicios(Servicio_ID) ON UPDATE CASCADE;

ALTER TABLE Productos_Por_Paquete 
    ADD CONSTRAINT fk_Producto_Paquete FOREIGN KEY (Paquete_ID) REFERENCES Paquetes(Paquete_ID) ON UPDATE CASCADE,
    ADD CONSTRAINT fk_Producto_Productos FOREIGN KEY (Producto_ID) REFERENCES Productos(Producto_ID) ON UPDATE CASCADE;

ALTER TABLE Danos_Mantenimientos ADD CONSTRAINT fk_Dano_Cabanas FOREIGN KEY (Cabana_ID) REFERENCES Cabanas(Cabana_ID);
ALTER TABLE Usuarios ADD CONSTRAINT fk_Usuarios_Roles FOREIGN KEY (Rol_ID) REFERENCES Roles(Rol_ID);
ALTER TABLE Login ADD CONSTRAINT fk_Cuenta_Usuarios FOREIGN KEY (Usuario_ID) REFERENCES Usuarios(Usuario_ID) ON DELETE CASCADE;
ALTER TABLE Logs_login ADD CONSTRAINT fk_Logs_Login_Ref FOREIGN KEY (Login_ID) REFERENCES Login(Login_ID) ON DELETE CASCADE;

ALTER TABLE imagenes_cabana ADD CONSTRAINT fk_imagenes_cabana_cabanas FOREIGN KEY (cabana_id) REFERENCES Cabanas(Cabana_ID) ON DELETE CASCADE;

ALTER TABLE Paquetes 
    ADD CONSTRAINT fk_Paquete_Tipo FOREIGN KEY (Tipo_ID) REFERENCES Tipo_Paquete(Tipo_ID),
	ADD CONSTRAINT fk_Paquete_Cabana FOREIGN KEY (Cabana_ID) REFERENCES Cabanas(Cabana_ID),
	ADD CONSTRAINT fk_Paquete_Usuario FOREIGN KEY (Registrado_Por_ID) REFERENCES Usuarios(Usuario_ID);

ALTER TABLE Reservas 
    ADD CONSTRAINT fk_Reservas_Paquetes FOREIGN KEY (Paquete_ID) REFERENCES Paquetes(Paquete_ID),
    ADD CONSTRAINT fk_Reservas_Cliente FOREIGN KEY (Cliente_ID) REFERENCES Clientes(Cliente_ID) ON DELETE CASCADE;

ALTER TABLE Facturas ADD CONSTRAINT fk_Facturas_Reservas FOREIGN KEY (Reserva_ID) REFERENCES Reservas(Reserva_ID) ON UPDATE CASCADE;

ALTER TABLE Pagos 
    ADD CONSTRAINT fk_Pagos_Facturas FOREIGN KEY (Factura_ID) REFERENCES Facturas(Factura_ID),
    ADD CONSTRAINT fk_Pagos_Metodos FOREIGN KEY (Metodo_ID) REFERENCES Metodos_Pago(Metodo_ID);

ALTER TABLE Reembolsos ADD CONSTRAINT fk_Reembolsos_Facturas FOREIGN KEY (Factura_ID) REFERENCES Facturas(Factura_ID);

-- Restricciones de unicidad
ALTER TABLE clientes 
ADD CONSTRAINT unique_cliente_identificacion UNIQUE (tipo_identificacion, numero_identificacion);

ALTER TABLE Usuarios 
ADD CONSTRAINT unique_usuario_identificacion UNIQUE (tipo_identificacion, numero_identificacion);