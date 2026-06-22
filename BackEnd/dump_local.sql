--
-- PostgreSQL database dump
--

\restrict A7ZufkrhDtFDeRZHibnZOOmRWMpC3wqIu91XyEPDKnFDKfOO2NDgzWqanx0kMWu

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.promociones_cabanas DROP CONSTRAINT IF EXISTS promociones_cabanas_promocion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.promociones_cabanas DROP CONSTRAINT IF EXISTS promociones_cabanas_cabana_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS fk_usuarios_roles;
ALTER TABLE IF EXISTS ONLY public.servicios_por_paquete DROP CONSTRAINT IF EXISTS fk_servicio_servicios;
ALTER TABLE IF EXISTS ONLY public.servicios_por_paquete DROP CONSTRAINT IF EXISTS fk_servicio_paquete;
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS fk_reservas_paquetes;
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS fk_reservas_cliente;
ALTER TABLE IF EXISTS ONLY public.reembolsos DROP CONSTRAINT IF EXISTS fk_reembolsos_facturas;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS fk_paquete_usuario;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS fk_paquete_tipo;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS fk_paquete_cabana;
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS fk_pagos_metodos;
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS fk_pagos_facturas;
ALTER TABLE IF EXISTS ONLY public.logs_login DROP CONSTRAINT IF EXISTS fk_logs_login_ref;
ALTER TABLE IF EXISTS ONLY public.imagenes_cabana DROP CONSTRAINT IF EXISTS fk_imagenes_cabana_cabanas;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS fk_facturas_reservas;
ALTER TABLE IF EXISTS ONLY public.danos_mantenimientos DROP CONSTRAINT IF EXISTS fk_dano_cabanas;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS fk_cuenta_usuarios;
ALTER TABLE IF EXISTS ONLY public.fechas_bloqueadas DROP CONSTRAINT IF EXISTS fechas_bloqueadas_cabana_id_fkey;
DROP TRIGGER IF EXISTS trg_actualizar_total_factura ON public.facturas;
DROP INDEX IF EXISTS public.idx_spq_paquete_busqueda;
DROP INDEX IF EXISTS public.idx_reservas_perf;
DROP INDEX IF EXISTS public.idx_reservas_pendientes_pago;
DROP INDEX IF EXISTS public.idx_reembolsos_fecha;
DROP INDEX IF EXISTS public.idx_pagos_fecha_ingreso;
DROP INDEX IF EXISTS public.idx_logs_login_reciente;
DROP INDEX IF EXISTS public.idx_facturas_fecha_total_incl;
DROP INDEX IF EXISTS public.idx_danos_cabana_estado;
DROP INDEX IF EXISTS public.idx_clientes_nombre_pattern;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_numero_identificacion_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_contacto_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS unique_usuario_identificacion;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS unique_cliente_identificacion;
ALTER TABLE IF EXISTS ONLY public.tipo_paquete DROP CONSTRAINT IF EXISTS tipo_paquete_pkey;
ALTER TABLE IF EXISTS ONLY public.servicios_por_paquete DROP CONSTRAINT IF EXISTS servicios_por_paquete_pkey;
ALTER TABLE IF EXISTS ONLY public.servicios DROP CONSTRAINT IF EXISTS servicios_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.reservas DROP CONSTRAINT IF EXISTS reservas_pkey;
ALTER TABLE IF EXISTS ONLY public.resenas DROP CONSTRAINT IF EXISTS resenas_pkey;
ALTER TABLE IF EXISTS ONLY public.reembolsos DROP CONSTRAINT IF EXISTS reembolsos_pkey;
ALTER TABLE IF EXISTS ONLY public.reembolsos DROP CONSTRAINT IF EXISTS reembolsos_factura_id_key;
ALTER TABLE IF EXISTS ONLY public.promociones DROP CONSTRAINT IF EXISTS promociones_pkey;
ALTER TABLE IF EXISTS ONLY public.promociones_cabanas DROP CONSTRAINT IF EXISTS promociones_cabanas_pkey;
ALTER TABLE IF EXISTS ONLY public.paquetes DROP CONSTRAINT IF EXISTS paquetes_pkey;
ALTER TABLE IF EXISTS ONLY public.pagos DROP CONSTRAINT IF EXISTS pagos_pkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.metodos_pago DROP CONSTRAINT IF EXISTS metodos_pago_pkey;
ALTER TABLE IF EXISTS ONLY public.logs_login DROP CONSTRAINT IF EXISTS logs_login_pkey;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS login_pkey;
ALTER TABLE IF EXISTS ONLY public.login DROP CONSTRAINT IF EXISTS login_email_key;
ALTER TABLE IF EXISTS ONLY public.imagenes_cabana DROP CONSTRAINT IF EXISTS imagenes_cabana_pkey;
ALTER TABLE IF EXISTS ONLY public.fechas_bloqueadas DROP CONSTRAINT IF EXISTS fechas_bloqueadas_pkey;
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS facturas_pkey;
ALTER TABLE IF EXISTS ONLY public.danos_mantenimientos DROP CONSTRAINT IF EXISTS danos_mantenimientos_pkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_pkey;
ALTER TABLE IF EXISTS ONLY public.clientes DROP CONSTRAINT IF EXISTS clientes_numero_identificacion_key;
ALTER TABLE IF EXISTS ONLY public.cabanas DROP CONSTRAINT IF EXISTS cabanas_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN usuario_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.tipo_paquete ALTER COLUMN tipo_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.servicios_por_paquete ALTER COLUMN servicio_paquete_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.servicios ALTER COLUMN servicio_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN rol_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reservas ALTER COLUMN reserva_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.resenas ALTER COLUMN resena_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reembolsos ALTER COLUMN reembolso_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.promociones ALTER COLUMN promocion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.paquetes ALTER COLUMN paquete_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pagos ALTER COLUMN pago_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notificaciones ALTER COLUMN notificacion_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.metodos_pago ALTER COLUMN metodo_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.logs_login ALTER COLUMN log_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.login ALTER COLUMN login_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.imagenes_cabana ALTER COLUMN imagen_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.fechas_bloqueadas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.facturas ALTER COLUMN factura_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.danos_mantenimientos ALTER COLUMN dano_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clientes ALTER COLUMN cliente_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.cabanas ALTER COLUMN cabana_id DROP DEFAULT;
DROP VIEW IF EXISTS public.vista_usuarios_stats;
DROP VIEW IF EXISTS public.vista_usuarios;
DROP VIEW IF EXISTS public.vista_servicios_stats;
DROP VIEW IF EXISTS public.vista_servicios_por_paquete;
DROP VIEW IF EXISTS public.vista_reservas_revenue;
DROP VIEW IF EXISTS public.vista_reservas;
DROP VIEW IF EXISTS public.vista_servicios;
DROP VIEW IF EXISTS public.vista_reembolsos_factura;
DROP VIEW IF EXISTS public.vista_promociones;
DROP VIEW IF EXISTS public.vista_paquetes_stats;
DROP VIEW IF EXISTS public.vista_paquetes;
DROP VIEW IF EXISTS public.vista_pagos_stats;
DROP VIEW IF EXISTS public.vista_pagos;
DROP VIEW IF EXISTS public.vista_logs_login;
DROP VIEW IF EXISTS public.vista_login;
DROP VIEW IF EXISTS public.vista_facturas;
DROP VIEW IF EXISTS public.vista_danos_mantenimientos;
DROP VIEW IF EXISTS public.vista_clientes;
DROP VIEW IF EXISTS public.vista_cabanas_stats;
DROP VIEW IF EXISTS public.vista_cabanas_revenue;
DROP VIEW IF EXISTS public.vista_cabanas;
DROP SEQUENCE IF EXISTS public.usuarios_usuario_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.tipo_paquete_tipo_id_seq;
DROP TABLE IF EXISTS public.tipo_paquete;
DROP SEQUENCE IF EXISTS public.servicios_servicio_id_seq;
DROP SEQUENCE IF EXISTS public.servicios_por_paquete_servicio_paquete_id_seq;
DROP TABLE IF EXISTS public.servicios_por_paquete;
DROP TABLE IF EXISTS public.servicios;
DROP SEQUENCE IF EXISTS public.roles_rol_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.reservas_reserva_id_seq;
DROP TABLE IF EXISTS public.reservas;
DROP SEQUENCE IF EXISTS public.resenas_resena_id_seq;
DROP TABLE IF EXISTS public.resenas;
DROP SEQUENCE IF EXISTS public.reembolsos_reembolso_id_seq;
DROP TABLE IF EXISTS public.reembolsos;
DROP SEQUENCE IF EXISTS public.promociones_promocion_id_seq;
DROP TABLE IF EXISTS public.promociones_cabanas;
DROP TABLE IF EXISTS public.promociones;
DROP SEQUENCE IF EXISTS public.paquetes_paquete_id_seq;
DROP TABLE IF EXISTS public.paquetes;
DROP SEQUENCE IF EXISTS public.pagos_pago_id_seq;
DROP TABLE IF EXISTS public.pagos;
DROP SEQUENCE IF EXISTS public.notificaciones_notificacion_id_seq;
DROP TABLE IF EXISTS public.notificaciones;
DROP SEQUENCE IF EXISTS public.metodos_pago_metodo_id_seq;
DROP TABLE IF EXISTS public.metodos_pago;
DROP SEQUENCE IF EXISTS public.logs_login_log_id_seq;
DROP TABLE IF EXISTS public.logs_login;
DROP SEQUENCE IF EXISTS public.login_login_id_seq;
DROP TABLE IF EXISTS public.login;
DROP SEQUENCE IF EXISTS public.imagenes_cabana_imagen_id_seq;
DROP TABLE IF EXISTS public.imagenes_cabana;
DROP SEQUENCE IF EXISTS public.fechas_bloqueadas_id_seq;
DROP TABLE IF EXISTS public.fechas_bloqueadas;
DROP SEQUENCE IF EXISTS public.facturas_factura_id_seq;
DROP TABLE IF EXISTS public.facturas;
DROP SEQUENCE IF EXISTS public.danos_mantenimientos_dano_id_seq;
DROP TABLE IF EXISTS public.danos_mantenimientos;
DROP SEQUENCE IF EXISTS public.clientes_cliente_id_seq;
DROP TABLE IF EXISTS public.clientes;
DROP SEQUENCE IF EXISTS public.cabanas_cabana_id_seq;
DROP TABLE IF EXISTS public.cabanas;
DROP FUNCTION IF EXISTS public.fn_calcular_total_factura();
--
-- Name: fn_calcular_total_factura(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_calcular_total_factura() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_paquete_id INT;
    v_dias INT;
    v_costo_cabanas DECIMAL(10,2) := 0;
    v_costo_servicios DECIMAL(10,2) := 0;
    v_subtotal_calculado DECIMAL(10,2) := 0;
BEGIN
    -- 1. Obtener el PaqueteID y los días de estadía desde la Reserva
    SELECT Paquete_ID, (Salida - Llegada) INTO v_paquete_id, v_dias
    FROM Reservas WHERE Reserva_ID = NEW.Reserva_ID;

    -- Si la resta de fechas da 0 (mismo día), asumimos 1 noche mínimo
    IF v_dias = 0 THEN v_dias := 1; END IF;

    -- 2. Calcular costo de Cabañas (Precio Noche * Días)
    SELECT COALESCE(SUM(c.Precio_Noche * v_dias), 0) INTO v_costo_cabanas
    FROM cabanas c
    JOIN Paquetes p ON c.cabana_id = p.cabana_id
    WHERE p.Paquete_ID = v_paquete_id;

	-- 3. Calcular costo de Servicios (Precio * Cantidad de Personas)
    SELECT COALESCE(SUM(s.Precio * sp.Cantidad_Personas), 0) INTO v_costo_servicios
    FROM Servicios_Por_Paquete sp
    JOIN Servicios s ON sp.Servicio_ID = s.Servicio_ID
    WHERE sp.Paquete_ID = v_paquete_id;

    -- 4. Totales finales (sin productos, ya que la tabla no existe)
    v_subtotal_calculado := v_costo_cabanas + v_costo_servicios;
    
    NEW.Subtotal := v_subtotal_calculado;
    -- NEW.Total se calcula automáticamente por ser una columna GENERATED ALWAYS en Facturas

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_calcular_total_factura() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cabanas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cabanas (
    cabana_id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    precio_noche numeric(10,2) NOT NULL,
    capacidad_personas integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE,
    descripcion text DEFAULT 'Sin descripcion'::text,
    fecha_mantenimiento date,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    img_url text,
    es_promocion boolean DEFAULT false,
    precio_promocional numeric(10,2) DEFAULT 0
);


ALTER TABLE public.cabanas OWNER TO postgres;

--
-- Name: cabanas_cabana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cabanas_cabana_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cabanas_cabana_id_seq OWNER TO postgres;

--
-- Name: cabanas_cabana_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cabanas_cabana_id_seq OWNED BY public.cabanas.cabana_id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    cliente_id integer NOT NULL,
    tipo_identificacion character varying(10) NOT NULL,
    numero_identificacion character varying(255) NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    contacto character varying(100) NOT NULL,
    pais_residencia character varying(100) NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_cliente_id_seq OWNER TO postgres;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_cliente_id_seq OWNED BY public.clientes.cliente_id;


--
-- Name: danos_mantenimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.danos_mantenimientos (
    dano_id integer NOT NULL,
    cabana_id integer NOT NULL,
    descripcion text DEFAULT 'Sin descripcion'::text,
    estado character varying(100),
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    fecha_arreglo date,
    responsable character varying(100)
);


ALTER TABLE public.danos_mantenimientos OWNER TO postgres;

--
-- Name: danos_mantenimientos_dano_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.danos_mantenimientos_dano_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.danos_mantenimientos_dano_id_seq OWNER TO postgres;

--
-- Name: danos_mantenimientos_dano_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.danos_mantenimientos_dano_id_seq OWNED BY public.danos_mantenimientos.dano_id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    factura_id integer NOT NULL,
    reserva_id integer NOT NULL,
    fecha_factura date DEFAULT CURRENT_DATE,
    subtotal numeric(10,2),
    descuento numeric(5,2) DEFAULT 0.00,
    total numeric GENERATED ALWAYS AS (round((subtotal * ((1)::numeric - (descuento / (100)::numeric))), 2)) STORED,
    total_restante numeric
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facturas_factura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_factura_id_seq OWNER TO postgres;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facturas_factura_id_seq OWNED BY public.facturas.factura_id;


--
-- Name: fechas_bloqueadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fechas_bloqueadas (
    id integer NOT NULL,
    cabana_id integer,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    motivo character varying(255) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.fechas_bloqueadas OWNER TO postgres;

--
-- Name: fechas_bloqueadas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fechas_bloqueadas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fechas_bloqueadas_id_seq OWNER TO postgres;

--
-- Name: fechas_bloqueadas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fechas_bloqueadas_id_seq OWNED BY public.fechas_bloqueadas.id;


--
-- Name: imagenes_cabana; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.imagenes_cabana (
    imagen_id integer NOT NULL,
    cabana_id integer NOT NULL,
    img_url text NOT NULL
);


ALTER TABLE public.imagenes_cabana OWNER TO postgres;

--
-- Name: imagenes_cabana_imagen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.imagenes_cabana_imagen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.imagenes_cabana_imagen_id_seq OWNER TO postgres;

--
-- Name: imagenes_cabana_imagen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.imagenes_cabana_imagen_id_seq OWNED BY public.imagenes_cabana.imagen_id;


--
-- Name: login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login (
    login_id integer NOT NULL,
    usuario_id integer,
    email character varying(250) NOT NULL,
    contrasena character varying(255) NOT NULL,
    estado character varying(50) DEFAULT 'Activo'::character varying
);


ALTER TABLE public.login OWNER TO postgres;

--
-- Name: login_login_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_login_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_login_id_seq OWNER TO postgres;

--
-- Name: login_login_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_login_id_seq OWNED BY public.login.login_id;


--
-- Name: logs_login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_login (
    log_id integer NOT NULL,
    login_id integer,
    accion character varying(50),
    fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    detalles text
);


ALTER TABLE public.logs_login OWNER TO postgres;

--
-- Name: logs_login_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_login_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_login_log_id_seq OWNER TO postgres;

--
-- Name: logs_login_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_login_log_id_seq OWNED BY public.logs_login.log_id;


--
-- Name: metodos_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metodos_pago (
    metodo_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    nombre text DEFAULT 'Sin descripcion'::text
);


ALTER TABLE public.metodos_pago OWNER TO postgres;

--
-- Name: metodos_pago_metodo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.metodos_pago_metodo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metodos_pago_metodo_id_seq OWNER TO postgres;

--
-- Name: metodos_pago_metodo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.metodos_pago_metodo_id_seq OWNED BY public.metodos_pago.metodo_id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    notificacion_id integer NOT NULL,
    titulo character varying(50) NOT NULL,
    asunto character varying(50) NOT NULL,
    mensaje text NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: notificaciones_notificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_notificacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_notificacion_id_seq OWNER TO postgres;

--
-- Name: notificaciones_notificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_notificacion_id_seq OWNED BY public.notificaciones.notificacion_id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    pago_id integer NOT NULL,
    metodo_id integer NOT NULL,
    factura_id integer NOT NULL,
    fecha_pago date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(50),
    total_pagado numeric(10,2)
);


ALTER TABLE public.pagos OWNER TO postgres;

--
-- Name: pagos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_pago_id_seq OWNER TO postgres;

--
-- Name: pagos_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_pago_id_seq OWNED BY public.pagos.pago_id;


--
-- Name: paquetes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paquetes (
    paquete_id integer NOT NULL,
    cabana_id integer NOT NULL,
    tipo_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    dias_estadia integer NOT NULL,
    descripcion text DEFAULT 'Sin descripcion'::text,
    registrado_por_id integer,
    fecha_registro date DEFAULT CURRENT_DATE,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    img_url character varying(255),
    precio_promocional numeric(10,2) DEFAULT 0
);


ALTER TABLE public.paquetes OWNER TO postgres;

--
-- Name: paquetes_paquete_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.paquetes_paquete_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.paquetes_paquete_id_seq OWNER TO postgres;

--
-- Name: paquetes_paquete_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.paquetes_paquete_id_seq OWNED BY public.paquetes.paquete_id;


--
-- Name: promociones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promociones (
    promocion_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text DEFAULT 'Sin descripcion'::text,
    precio numeric(10,2) NOT NULL,
    img_url text,
    fecha_registro date DEFAULT CURRENT_DATE,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    fecha_inicio date DEFAULT CURRENT_DATE,
    fecha_fin date
);


ALTER TABLE public.promociones OWNER TO postgres;

--
-- Name: promociones_cabanas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promociones_cabanas (
    promocion_id integer NOT NULL,
    cabana_id integer NOT NULL
);


ALTER TABLE public.promociones_cabanas OWNER TO postgres;

--
-- Name: promociones_promocion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promociones_promocion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promociones_promocion_id_seq OWNER TO postgres;

--
-- Name: promociones_promocion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promociones_promocion_id_seq OWNED BY public.promociones.promocion_id;


--
-- Name: reembolsos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reembolsos (
    reembolso_id integer NOT NULL,
    factura_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    justificacion text NOT NULL,
    estado character varying(50) NOT NULL,
    monto numeric(10,2) NOT NULL
);


ALTER TABLE public.reembolsos OWNER TO postgres;

--
-- Name: reembolsos_reembolso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reembolsos_reembolso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reembolsos_reembolso_id_seq OWNER TO postgres;

--
-- Name: reembolsos_reembolso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reembolsos_reembolso_id_seq OWNED BY public.reembolsos.reembolso_id;


--
-- Name: resenas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resenas (
    resena_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    texto text NOT NULL,
    rating integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resenas_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.resenas OWNER TO postgres;

--
-- Name: resenas_resena_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resenas_resena_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resenas_resena_id_seq OWNER TO postgres;

--
-- Name: resenas_resena_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resenas_resena_id_seq OWNED BY public.resenas.resena_id;


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    reserva_id integer NOT NULL,
    paquete_id integer NOT NULL,
    cliente_id integer NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    llegada date NOT NULL,
    salida date NOT NULL,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    por_pagar numeric(10,2) NOT NULL,
    factura_url text
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: reservas_reserva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_reserva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_reserva_id_seq OWNER TO postgres;

--
-- Name: reservas_reserva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_reserva_id_seq OWNED BY public.reservas.reserva_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre character varying(50) DEFAULT 'Empleado'::character varying
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_rol_id_seq OWNER TO postgres;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    servicio_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    encargado character varying(100),
    duracion_minutos integer NOT NULL,
    precio numeric(10,2) NOT NULL,
    descripcion text DEFAULT 'Sin descripcion'::text,
    fecha_actualizacion date DEFAULT CURRENT_DATE,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    img_url text NOT NULL
);


ALTER TABLE public.servicios OWNER TO postgres;

--
-- Name: servicios_por_paquete; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios_por_paquete (
    servicio_paquete_id integer NOT NULL,
    paquete_id integer NOT NULL,
    servicio_id integer NOT NULL,
    cantidad_personas integer DEFAULT 1
);


ALTER TABLE public.servicios_por_paquete OWNER TO postgres;

--
-- Name: servicios_por_paquete_servicio_paquete_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicios_por_paquete_servicio_paquete_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicios_por_paquete_servicio_paquete_id_seq OWNER TO postgres;

--
-- Name: servicios_por_paquete_servicio_paquete_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicios_por_paquete_servicio_paquete_id_seq OWNED BY public.servicios_por_paquete.servicio_paquete_id;


--
-- Name: servicios_servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicios_servicio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicios_servicio_id_seq OWNER TO postgres;

--
-- Name: servicios_servicio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicios_servicio_id_seq OWNED BY public.servicios.servicio_id;


--
-- Name: tipo_paquete; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_paquete (
    tipo_id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.tipo_paquete OWNER TO postgres;

--
-- Name: tipo_paquete_tipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_paquete_tipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_paquete_tipo_id_seq OWNER TO postgres;

--
-- Name: tipo_paquete_tipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_paquete_tipo_id_seq OWNED BY public.tipo_paquete.tipo_id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    rol_id integer NOT NULL,
    tipo_identificacion character varying(10) NOT NULL,
    numero_identificacion character varying(255) NOT NULL,
    nombre character varying(50) NOT NULL,
    contacto character varying(100),
    sueldo numeric(10,2) DEFAULT 0.00 NOT NULL,
    estado character varying(50) DEFAULT 'Activo'::character varying,
    fecha_agregado timestamp without time zone NOT NULL,
    fecha_actualizacion timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_usuario_id_seq OWNER TO postgres;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- Name: vista_cabanas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_cabanas AS
 SELECT cabana_id AS id,
    nombre,
    precio_noche AS "precio noche",
    capacidad_personas AS capacidad,
    fecha_registro AS actualizacion,
    descripcion,
    estado,
    es_promocion,
    precio_promocional
   FROM public.cabanas;


ALTER VIEW public.vista_cabanas OWNER TO postgres;

--
-- Name: vista_cabanas_revenue; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_cabanas_revenue AS
 SELECT to_char((f.fecha_factura)::timestamp with time zone, 'YYYY-MM-DD'::text) AS fecha,
    sum(f.total) AS total
   FROM (((public.facturas f
     JOIN public.reservas r ON ((f.reserva_id = r.reserva_id)))
     JOIN public.paquetes p ON ((r.paquete_id = p.paquete_id)))
     JOIN public.cabanas c ON ((p.cabana_id = c.cabana_id)))
  WHERE (((c.estado)::text <> 'inactivo'::text) AND ((r.estado)::text <> 'Cancelada'::text))
  GROUP BY (to_char((f.fecha_factura)::timestamp with time zone, 'YYYY-MM-DD'::text));


ALTER VIEW public.vista_cabanas_revenue OWNER TO postgres;

--
-- Name: vista_cabanas_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_cabanas_stats AS
 SELECT c.nombre AS "Cabaña",
    count(DISTINCT r.reserva_id) AS "Veces reservada",
    COALESCE(sum(f.total), (0)::numeric) AS "Ingresos generados"
   FROM (((public.cabanas c
     LEFT JOIN public.paquetes p ON ((c.cabana_id = p.cabana_id)))
     LEFT JOIN public.reservas r ON ((p.paquete_id = r.paquete_id)))
     LEFT JOIN public.facturas f ON ((r.reserva_id = f.reserva_id)))
  WHERE (((c.estado)::text <> 'inactivo'::text) AND ((r.estado)::text <> 'Cancelada'::text))
  GROUP BY c.cabana_id, c.nombre;


ALTER VIEW public.vista_cabanas_stats OWNER TO postgres;

--
-- Name: vista_clientes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_clientes AS
 SELECT cliente_id AS id,
    tipo_identificacion AS "Tipo Ident..",
    numero_identificacion AS "# Identificacion",
    nombre AS cliente,
    email,
    contacto,
    pais_residencia AS residencia
   FROM public.clientes c;


ALTER VIEW public.vista_clientes OWNER TO postgres;

--
-- Name: vista_danos_mantenimientos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_danos_mantenimientos AS
 SELECT dm.dano_id AS id,
    c.nombre AS cabana,
    dm.descripcion,
    dm.estado,
    dm.fecha_registro AS registro,
    dm.fecha_arreglo AS arreglo,
    dm.responsable
   FROM (public.danos_mantenimientos dm
     JOIN public.cabanas c ON ((c.cabana_id = dm.cabana_id)));


ALTER VIEW public.vista_danos_mantenimientos OWNER TO postgres;

--
-- Name: vista_facturas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_facturas AS
 SELECT f.factura_id AS id,
    f.reserva_id AS reserva,
    c.nombre AS cliente,
    f.fecha_factura AS fecha,
    f.subtotal,
    f.total
   FROM (((public.facturas f
     LEFT JOIN public.pagos p ON ((f.factura_id = p.factura_id)))
     JOIN public.reservas r ON ((r.reserva_id = f.reserva_id)))
     JOIN public.clientes c ON ((c.cliente_id = r.cliente_id)))
  WHERE ((r.estado)::text <> 'Cancelada'::text);


ALTER VIEW public.vista_facturas OWNER TO postgres;

--
-- Name: vista_login; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_login AS
 SELECT l.usuario_id AS usuario,
    u.rol_id AS rol,
    l.email,
    l.contrasena,
    l.estado
   FROM (public.login l
     JOIN public.usuarios u ON ((u.usuario_id = l.usuario_id)));


ALTER VIEW public.vista_login OWNER TO postgres;

--
-- Name: vista_logs_login; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_logs_login AS
 SELECT l.email,
    ll.accion,
    ll.fecha_hora AS fecha,
    ll.detalles
   FROM (public.logs_login ll
     JOIN public.login l ON ((ll.login_id = l.login_id)));


ALTER VIEW public.vista_logs_login OWNER TO postgres;

--
-- Name: vista_pagos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_pagos AS
 SELECT p.pago_id AS id,
    mp.nombre AS metodo,
    p.factura_id AS factura,
    p.fecha_pago AS fecha,
    p.estado,
    p.total_pagado
   FROM (public.pagos p
     JOIN public.metodos_pago mp ON ((mp.metodo_id = p.metodo_id)));


ALTER VIEW public.vista_pagos OWNER TO postgres;

--
-- Name: vista_pagos_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_pagos_stats AS
 SELECT sum(
        CASE
            WHEN (tipo = 'pago'::text) THEN monto
            ELSE (0)::numeric
        END) AS total_cobrado,
    sum(
        CASE
            WHEN (tipo = 'reembolso'::text) THEN monto
            ELSE (0)::numeric
        END) AS total_reembolsado,
    sum(
        CASE
            WHEN (tipo = 'pago'::text) THEN monto
            ELSE (- monto)
        END) AS saldo_neto_mes
   FROM ( SELECT pagos.fecha_pago AS fecha,
            pagos.total_pagado AS monto,
            'pago'::text AS tipo
           FROM public.pagos
          WHERE (((pagos.estado)::text <> 'Cancelado'::text) AND (pagos.fecha_pago >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))
        UNION ALL
         SELECT reembolsos.fecha,
            reembolsos.monto,
            'reembolso'::text AS tipo
           FROM public.reembolsos
          WHERE (reembolsos.fecha >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))) reporte;


ALTER VIEW public.vista_pagos_stats OWNER TO postgres;

--
-- Name: vista_paquetes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_paquetes AS
 SELECT p.paquete_id AS id,
    tp.nombre AS tipo,
    c.nombre AS "Cabaña",
    p.dias_estadia AS dias,
    p.fecha_registro AS fecha,
    p.descripcion,
    p.estado,
    p.tipo_id,
    p.cabana_id,
    p.img_url,
        CASE
            WHEN (p.precio_promocional > (0)::numeric) THEN p.precio_promocional
            ELSE (c.precio_noche * (p.dias_estadia)::numeric)
        END AS precio
   FROM ((public.paquetes p
     JOIN public.tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)))
     JOIN public.cabanas c ON ((c.cabana_id = p.cabana_id)));


ALTER VIEW public.vista_paquetes OWNER TO postgres;

--
-- Name: vista_paquetes_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_paquetes_stats AS
 SELECT p.paquete_id AS id,
    tp.nombre AS tipo,
    c.nombre AS "Cabaña",
    p.dias_estadia AS dias,
    p.fecha_registro AS fecha,
    p.descripcion,
    p.estado,
    p.tipo_id,
    p.cabana_id,
    p.img_url,
        CASE
            WHEN (p.precio_promocional > (0)::numeric) THEN p.precio_promocional
            ELSE (c.precio_noche * (p.dias_estadia)::numeric)
        END AS precio,
    count(r.reserva_id) AS veces_reservado
   FROM (((public.paquetes p
     JOIN public.tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)))
     JOIN public.cabanas c ON ((c.cabana_id = p.cabana_id)))
     LEFT JOIN public.reservas r ON ((p.paquete_id = r.paquete_id)))
  GROUP BY p.paquete_id, tp.nombre, c.nombre, p.dias_estadia, p.fecha_registro, p.descripcion, p.estado, p.tipo_id, p.cabana_id, p.img_url, p.precio_promocional, c.precio_noche;


ALTER VIEW public.vista_paquetes_stats OWNER TO postgres;

--
-- Name: vista_promociones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_promociones AS
 SELECT promocion_id AS id,
    nombre,
    descripcion,
    precio,
    img_url,
    fecha_inicio,
    fecha_fin,
    fecha_registro AS fecha,
        CASE
            WHEN ((fecha_fin IS NOT NULL) AND (fecha_fin < CURRENT_DATE)) THEN 'Inactivo'::character varying
            ELSE estado
        END AS estado,
    COALESCE(( SELECT json_agg(json_build_object('id', c.cabana_id, 'nombre', c.nombre)) AS json_agg
           FROM (public.promociones_cabanas pc
             JOIN public.cabanas c ON ((c.cabana_id = pc.cabana_id)))
          WHERE (pc.promocion_id = p.promocion_id)), '[]'::json) AS cabanas
   FROM public.promociones p;


ALTER VIEW public.vista_promociones OWNER TO postgres;

--
-- Name: vista_reembolsos_factura; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_reembolsos_factura AS
 SELECT reembolso_id AS id,
    factura_id AS factura,
    fecha,
    justificacion,
    estado,
    monto
   FROM public.reembolsos;


ALTER VIEW public.vista_reembolsos_factura OWNER TO postgres;

--
-- Name: vista_servicios; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_servicios AS
 SELECT servicio_id AS id,
    nombre AS servicio,
    encargado,
    duracion_minutos AS "Duracion en minutos",
    precio,
    descripcion,
    fecha_actualizacion AS actualizacion,
    estado
   FROM public.servicios;


ALTER VIEW public.vista_servicios OWNER TO postgres;

--
-- Name: vista_reservas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_reservas AS
 SELECT r.reserva_id AS id,
    (((tp.nombre)::text || ' - '::text) || (p.nombre)::text) AS paquete,
    c.nombre AS cliente,
    r.fecha_registro AS fecha,
    r.llegada,
    r.salida,
    r.estado,
    r.por_pagar AS "Pago restante",
    r.factura_url AS comprobante_url,
    COALESCE(( SELECT string_agg(((((s.servicio)::text || ' ('::text) || sp.cantidad_personas) || ' pax)'::text), ', '::text) AS string_agg
           FROM (public.servicios_por_paquete sp
             JOIN public.vista_servicios s ON ((sp.servicio_id = s.id)))
          WHERE (sp.paquete_id = p.paquete_id)), 'Ninguno'::text) AS "Servicios adicionales"
   FROM (((public.reservas r
     JOIN public.clientes c ON ((c.cliente_id = r.cliente_id)))
     JOIN public.paquetes p ON ((p.paquete_id = r.paquete_id)))
     JOIN public.tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)));


ALTER VIEW public.vista_reservas OWNER TO postgres;

--
-- Name: vista_reservas_revenue; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_reservas_revenue AS
 SELECT to_char((f.fecha_factura)::timestamp with time zone, 'YYYY-MM-DD'::text) AS fecha,
    sum(f.total) AS total
   FROM (public.reservas r
     JOIN public.facturas f ON ((f.reserva_id = r.reserva_id)))
  WHERE ((r.estado)::text <> 'Cancelada'::text)
  GROUP BY (to_char((f.fecha_factura)::timestamp with time zone, 'YYYY-MM-DD'::text));


ALTER VIEW public.vista_reservas_revenue OWNER TO postgres;

--
-- Name: vista_servicios_por_paquete; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_servicios_por_paquete AS
 SELECT sp.servicio_paquete_id AS id,
    p.paquete_id,
    p.nombre AS paquete,
    s.nombre AS servicio,
    s.img_url,
    sp.cantidad_personas AS personas
   FROM ((public.servicios_por_paquete sp
     JOIN public.paquetes p ON ((p.paquete_id = sp.paquete_id)))
     JOIN public.servicios s ON ((s.servicio_id = sp.servicio_id)));


ALTER VIEW public.vista_servicios_por_paquete OWNER TO postgres;

--
-- Name: vista_servicios_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_servicios_stats AS
 SELECT s.nombre AS servicio,
    count(s.servicio_id) AS veces_reservado,
    sum(s.precio) AS ingresos_generados
   FROM (((public.servicios s
     LEFT JOIN public.servicios_por_paquete spq ON ((s.servicio_id = spq.servicio_id)))
     LEFT JOIN public.paquetes p ON ((spq.paquete_id = p.paquete_id)))
     LEFT JOIN public.reservas r ON ((r.paquete_id = p.paquete_id)))
  WHERE (((s.estado)::text = 'Activo'::text) AND ((r.estado)::text = ANY ((ARRAY['Pagado'::character varying, 'Completado'::character varying])::text[])))
  GROUP BY s.nombre, s.servicio_id;


ALTER VIEW public.vista_servicios_stats OWNER TO postgres;

--
-- Name: vista_usuarios; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_usuarios AS
 SELECT u.usuario_id AS id,
    r.nombre AS rol,
    u.rol_id,
    u.tipo_identificacion AS "Tipo Ident..",
    u.numero_identificacion AS "# Identificacion",
    u.nombre AS usuario,
    u.contacto,
    u.sueldo,
    u.estado
   FROM (public.usuarios u
     JOIN public.roles r ON ((u.rol_id = r.rol_id)));


ALTER VIEW public.vista_usuarios OWNER TO postgres;

--
-- Name: vista_usuarios_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_usuarios_stats AS
 SELECT count(*) AS total_active_users,
    ( SELECT usuarios_1.nombre
           FROM public.usuarios usuarios_1
          WHERE ((usuarios_1.estado)::text = 'Activo'::text)
          ORDER BY usuarios_1.sueldo DESC
         LIMIT 1) AS highest_payroll,
    ( SELECT usuarios_1.nombre
           FROM public.usuarios usuarios_1
          WHERE ((usuarios_1.estado)::text = 'Activo'::text)
          ORDER BY usuarios_1.sueldo
         LIMIT 1) AS lowest_payroll,
    sum(sueldo) AS total_payroll
   FROM public.usuarios;


ALTER VIEW public.vista_usuarios_stats OWNER TO postgres;

--
-- Name: cabanas cabana_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabanas ALTER COLUMN cabana_id SET DEFAULT nextval('public.cabanas_cabana_id_seq'::regclass);


--
-- Name: clientes cliente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN cliente_id SET DEFAULT nextval('public.clientes_cliente_id_seq'::regclass);


--
-- Name: danos_mantenimientos dano_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danos_mantenimientos ALTER COLUMN dano_id SET DEFAULT nextval('public.danos_mantenimientos_dano_id_seq'::regclass);


--
-- Name: facturas factura_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas ALTER COLUMN factura_id SET DEFAULT nextval('public.facturas_factura_id_seq'::regclass);


--
-- Name: fechas_bloqueadas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechas_bloqueadas ALTER COLUMN id SET DEFAULT nextval('public.fechas_bloqueadas_id_seq'::regclass);


--
-- Name: imagenes_cabana imagen_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_cabana ALTER COLUMN imagen_id SET DEFAULT nextval('public.imagenes_cabana_imagen_id_seq'::regclass);


--
-- Name: login login_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login ALTER COLUMN login_id SET DEFAULT nextval('public.login_login_id_seq'::regclass);


--
-- Name: logs_login log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_login ALTER COLUMN log_id SET DEFAULT nextval('public.logs_login_log_id_seq'::regclass);


--
-- Name: metodos_pago metodo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodos_pago ALTER COLUMN metodo_id SET DEFAULT nextval('public.metodos_pago_metodo_id_seq'::regclass);


--
-- Name: notificaciones notificacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN notificacion_id SET DEFAULT nextval('public.notificaciones_notificacion_id_seq'::regclass);


--
-- Name: pagos pago_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos ALTER COLUMN pago_id SET DEFAULT nextval('public.pagos_pago_id_seq'::regclass);


--
-- Name: paquetes paquete_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paquetes ALTER COLUMN paquete_id SET DEFAULT nextval('public.paquetes_paquete_id_seq'::regclass);


--
-- Name: promociones promocion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones ALTER COLUMN promocion_id SET DEFAULT nextval('public.promociones_promocion_id_seq'::regclass);


--
-- Name: reembolsos reembolso_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reembolsos ALTER COLUMN reembolso_id SET DEFAULT nextval('public.reembolsos_reembolso_id_seq'::regclass);


--
-- Name: resenas resena_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas ALTER COLUMN resena_id SET DEFAULT nextval('public.resenas_resena_id_seq'::regclass);


--
-- Name: reservas reserva_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN reserva_id SET DEFAULT nextval('public.reservas_reserva_id_seq'::regclass);


--
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- Name: servicios servicio_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios ALTER COLUMN servicio_id SET DEFAULT nextval('public.servicios_servicio_id_seq'::regclass);


--
-- Name: servicios_por_paquete servicio_paquete_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios_por_paquete ALTER COLUMN servicio_paquete_id SET DEFAULT nextval('public.servicios_por_paquete_servicio_paquete_id_seq'::regclass);


--
-- Name: tipo_paquete tipo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_paquete ALTER COLUMN tipo_id SET DEFAULT nextval('public.tipo_paquete_tipo_id_seq'::regclass);


--
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- Data for Name: cabanas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cabanas (cabana_id, nombre, precio_noche, capacidad_personas, fecha_registro, descripcion, fecha_mantenimiento, estado, img_url, es_promocion, precio_promocional) FROM stdin;
1	Cabaña Palmas	350000.00	4	2026-05-30	Ideal para parejas, con todas las comodidades de lujo en medio del bosque para una experiencia inolvidable. Incluye: Jacuzzi privado, Nevera mini bar, TV con TDT, Wifi, BBQ, Maya catamaran, Parqueadero, Zona de fogata, Zona verde	\N	Activo	http://localhost:3000/public/cabins/palmas/1.webp	f	0.00
2	Cabaña Bambú	350000.00	3	2026-05-30	Una inmersión rústica con acabados en bambú, perfecta para quienes buscan conexión profunda con la naturaleza. Incluye: Jacuzzi privado, Nevera mini bar, TV con TDT, Wifi, BBQ, Parqueadero, Zona de fogata, Zona verde	\N	Activo	http://localhost:3000/public/cabins/bambu/1.webp	f	0.00
3	Cabaña Roble	290000.00	2	2026-05-30	Estructura de madera noble con vistas panorámicas, pozo de fuego y jacuzzi privado para veladas románticas. Incluye: Jacuzzi privado, Nevera mini bar, TV con TDT, Wifi, BBQ, Parqueadero, Pozo de fuego, Zona verde	\N	Activo	http://localhost:3000/public/cabins/roble/1.webp	f	0.00
4	cabaña la infiel	100000.00	2	2026-06-02	dwdwdwd	\N	Inactivo	\N	f	0.00
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (cliente_id, tipo_identificacion, numero_identificacion, nombre, email, contacto, pais_residencia) FROM stdin;
1	CC	123456	Carlos Ruiz	carlos@mail.com	3110001122	Colombia
2	PAS	PA887766	Jane Doe	jane@mail.com	+15551234	USA
3	CC	789012	Luis Perez	luis@mail.com	3204445566	Colombia
17	C.C.	100200300	Miguel Angel	miguel@gmail.com	3001234567	Colombia
26	C.C.	109945555	felipe chaverra	juandavidrivas2288@gmail.com	3147822970	Colombia
20	C.C.	43480071	sandra	sandrarodriguez110m@gmail.com	3103599065	Colombia
11	C.C.	1034990060	Miguel Arcila	miguelarcila008@gmail.com	3147822970	Colombia
\.


--
-- Data for Name: danos_mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.danos_mantenimientos (dano_id, cabana_id, descripcion, estado, fecha_registro, fecha_arreglo, responsable) FROM stdin;
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (factura_id, reserva_id, fecha_factura, subtotal, descuento, total_restante) FROM stdin;
2	2	2026-05-31	350000.00	0.00	\N
3	3	2026-05-31	350000.00	0.00	\N
4	4	2026-06-01	350000.00	0.00	\N
5	5	2026-06-01	290000.00	0.00	\N
6	6	2026-06-01	350000.00	0.00	\N
7	7	2026-06-01	350000.00	0.00	\N
8	8	2026-06-01	290000.00	0.00	\N
9	9	2026-06-01	350000.00	0.00	\N
10	10	2026-06-02	710000.00	0.00	\N
11	11	2026-06-02	710000.00	0.00	\N
12	12	2026-06-02	350000.00	0.00	\N
14	14	2026-06-20	450000.00	0.00	\N
\.


--
-- Data for Name: fechas_bloqueadas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fechas_bloqueadas (id, cabana_id, fecha_inicio, fecha_fin, motivo, fecha_registro) FROM stdin;
1	\N	2026-06-07	2026-06-08	Mantenimiento	2026-06-01 15:13:36.962333
2	\N	2026-06-08	2026-06-09	mantenimiento\n	2026-06-01 15:13:56.263883
3	\N	2026-06-09	2026-06-10	mantenimiento	2026-06-01 15:14:09.783488
4	\N	2026-06-10	2026-06-11	mantenimiento	2026-06-01 15:14:16.660775
5	\N	2026-06-12	2026-06-13	1	2026-06-01 15:14:44.18129
\.


--
-- Data for Name: imagenes_cabana; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.imagenes_cabana (imagen_id, cabana_id, img_url) FROM stdin;
16	1	http://localhost:3000/public/cabins/palmas/2.webp
17	1	http://localhost:3000/public/cabins/palmas/3.webp
18	1	http://localhost:3000/public/cabins/palmas/4.webp
19	1	http://localhost:3000/public/cabins/palmas/5.webp
20	1	http://localhost:3000/public/cabins/palmas/6.webp
21	2	http://localhost:3000/public/cabins/bambu/2.webp
22	2	http://localhost:3000/public/cabins/bambu/3.webp
23	2	http://localhost:3000/public/cabins/bambu/4.webp
24	2	http://localhost:3000/public/cabins/bambu/5.webp
25	2	http://localhost:3000/public/cabins/bambu/6.webp
26	3	http://localhost:3000/public/cabins/roble/2.webp
27	3	http://localhost:3000/public/cabins/roble/3.webp
28	3	http://localhost:3000/public/cabins/roble/4.webp
29	3	http://localhost:3000/public/cabins/roble/5.webp
30	3	http://localhost:3000/public/cabins/roble/6.webp
\.


--
-- Data for Name: login; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login (login_id, usuario_id, email, contrasena, estado) FROM stdin;
1	5	panelglampinglosbosques@gmail.com	$2b$10$Q7y36baeWjxlNEDP1eSyy.2gKbeMmldoSR6upMVdMEEoBtBvhUHpu	Activo
\.


--
-- Data for Name: logs_login; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_login (log_id, login_id, accion, fecha_hora, detalles) FROM stdin;
\.


--
-- Data for Name: metodos_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metodos_pago (metodo_id, tipo, nombre) FROM stdin;
1	Efectivo	Pago físico en recepción
2	Transferencia	Bancolombia o Nequi
3	Tarjeta	Datafono Visa/Mastercard
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificaciones (notificacion_id, titulo, asunto, mensaje, fecha) FROM stdin;
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos (pago_id, metodo_id, factura_id, fecha_pago, estado, total_pagado) FROM stdin;
\.


--
-- Data for Name: paquetes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paquetes (paquete_id, cabana_id, tipo_id, nombre, dias_estadia, descripcion, registrado_por_id, fecha_registro, estado, img_url, precio_promocional) FROM stdin;
14	1	7	Día de Sol	1	Pasadía sin amanecida.	\N	2026-05-31	Activo	\N	0.00
18	2	7	Paquete Día de Sol	1	Paquete Día de Sol para Cabaña Bambú.	\N	2026-05-31	Activo	\N	0.00
22	3	7	Paquete Día de Sol	1	Paquete Día de Sol para Cabaña Roble.	\N	2026-05-31	Activo	\N	0.00
13	1	6	Ocasional	0	Plan Ocasional de 6 horas.	\N	2026-05-31	Activo	\N	0.00
17	2	6	Paquete Ocasional	0	Plan Ocasional de 6 horas.	\N	2026-05-31	Activo	\N	0.00
21	3	6	Paquete Ocasional	0	Plan Ocasional de 6 horas.	\N	2026-05-31	Activo	\N	0.00
10	1	4	Reserva - Cabaña Palmas	1	test update from API route	\N	2026-05-31	Activo	\N	450000.00
12	1	5	Plan Semana (L-V)	1	Relájate entre semana.	\N	2026-05-31	Activo	\N	0.00
15	2	4	Paquete Fin de Semana / Festivo	1	Paquete Fin de Semana / Festivo para Cabaña Bambú.	\N	2026-05-31	Activo	\N	0.00
16	2	5	Paquete Semana (L - V)	1	Paquete Semana (L - V) para Cabaña Bambú.	\N	2026-05-31	Activo	\N	0.00
19	3	4	Paquete Fin de Semana / Festivo	1	Paquete Fin de Semana / Festivo para Cabaña Roble.	\N	2026-05-31	Activo	\N	0.00
20	3	5	Paquete Semana (L - V)	1	Paquete Semana (L - V) para Cabaña Roble.	\N	2026-05-31	Activo	\N	0.00
23	1	8	Paquete Ocasional Fin de Semana	0	Plan Ocasional de 6 horas para fin de semana.	\N	2026-05-31	Activo	\N	0.00
24	2	8	Paquete Ocasional Fin de Semana	0	Plan Ocasional de 6 horas para fin de semana.	\N	2026-05-31	Activo	\N	0.00
25	3	8	Paquete Ocasional Fin de Semana	0	Plan Ocasional de 6 horas para fin de semana.	\N	2026-05-31	Activo	\N	0.00
26	1	4	Reserva - Cabaña Palmas	1	Paquete Palmas	\N	2026-05-31	Activo	\N	0.00
27	1	6	Reserva - Cabaña Palmas	1	Paquete Cabaña Palmas - Plan Ocasional	\N	2026-06-01	Activo	\N	0.00
28	3	4	Reserva - Cabaña Roble	1	Paquete Cabaña Roble - Plan Fin de Semana / Festivo	\N	2026-06-01	Activo	\N	0.00
29	2	4	Reserva - Cabaña Bambú	1	Paquete Cabaña Bambú - Plan Fin de Semana / Festivo	\N	2026-06-01	Activo	\N	0.00
30	2	4	Reserva - Cabaña Bambú	1	Paquete Cabaña Bambú - Plan Fin de Semana / Festivo	\N	2026-06-01	Activo	\N	0.00
31	3	4	Reserva - Cabaña Roble	1	Paquete Cabaña Roble - Plan Fin de Semana / Festivo	\N	2026-06-01	Activo	\N	0.00
32	1	6	Reserva - Cabaña Palmas	1	Paquete Cabaña Palmas - Plan Ocasional	\N	2026-06-01	Activo	\N	0.00
33	2	5	Reserva - Cabaña Bambú	1	Paquete Cabaña Bambú - Plan Semana (L - V)	\N	2026-06-02	Activo	\N	0.00
34	2	6	Reserva - Cabaña Bambú	1	Paquete Cabaña Bambú - Plan Ocasional	\N	2026-06-02	Activo	\N	0.00
35	1	7	Reserva - Cabaña Palmas	1	Paquete Cabaña Palmas - Plan Día de Sol	\N	2026-06-02	Activo	\N	0.00
37	1	4	Reserva - Cabaña Palmas	1	Paquete Cabaña Palmas - Plan Fin de Semana / Festivo	\N	2026-06-20	Activo	\N	0.00
\.


--
-- Data for Name: promociones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promociones (promocion_id, nombre, descripcion, precio, img_url, fecha_registro, estado, fecha_inicio, fecha_fin) FROM stdin;
\.


--
-- Data for Name: promociones_cabanas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promociones_cabanas (promocion_id, cabana_id) FROM stdin;
\.


--
-- Data for Name: reembolsos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reembolsos (reembolso_id, factura_id, fecha, justificacion, estado, monto) FROM stdin;
1	2	2026-06-01	Reserva cancelada	Pendiente	175000.00
2	3	2026-06-01	Reserva cancelada	Pendiente	300000.00
3	4	2026-06-01	Reserva cancelada	Pendiente	175000.00
5	14	2026-06-20	Reserva cancelada	Pendiente	250000.00
6	12	2026-06-20	Reserva cancelada	Pendiente	175000.00
7	11	2026-06-20	Reserva cancelada	Pendiente	445000.00
8	9	2026-06-20	Reserva cancelada	Pendiente	175000.00
9	7	2026-06-20	Reserva cancelada	Pendiente	175000.00
10	6	2026-06-20	Reserva cancelada	Pendiente	50000.00
\.


--
-- Data for Name: resenas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resenas (resena_id, nombre, texto, rating, fecha_creacion) FROM stdin;
1	Test User	Excelente lugar	5	2026-05-30 23:30:33.154593
2	juan	Exelente lugar	5	2026-05-30 23:31:58.569971
3	migue	exelente lugar\n	5	2026-05-31 10:43:09.70797
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (reserva_id, paquete_id, cliente_id, fecha_registro, llegada, salida, estado, por_pagar, factura_url) FROM stdin;
2	10	11	2026-05-31 15:33:43.579142	2026-06-20	2026-06-21	Cancelado	175000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780260030/comprobantes/owht8ozrcyyl98ob4hds.pdf
3	26	17	2026-05-31 23:59:20.183943	2026-06-01	2026-06-01	Cancelado	50000.00	\N
4	27	11	2026-06-01 00:01:46.458487	2026-06-01	2026-06-01	Cancelado	175000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780290117/comprobantes/an66qhjx3s5opzozwb0z.pdf
5	28	20	2026-06-01 01:20:36.916128	2026-06-13	2026-06-14	Cancelada	145000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780294849/comprobantes/wjs35axgrvrdscostqrm.pdf
8	31	11	2026-06-01 15:25:28.634474	2026-06-20	2026-06-21	Cancelada	235000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780345548/comprobantes/mt0r1elbqklxut0kjur0.jpg
10	33	11	2026-06-02 12:01:19.050582	2026-06-18	2026-06-19	Cancelada	265000.00	\N
14	37	11	2026-06-20 20:00:54.692395	2026-06-27	2026-06-28	Cancelado	200000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1782003671/comprobantes/br0ocabx50xc7b61scht.pdf
12	35	20	2026-06-02 22:00:40.088799	2026-06-20	2026-06-20	Cancelado	175000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780455676/comprobantes/jg2uqbibdjcytyb0vy5o.jpg
11	34	11	2026-06-02 12:11:21.973418	2026-07-14	2026-07-15	Cancelado	265000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780420291/comprobantes/yngsavrwmtwogks0snsl.jpg
9	32	26	2026-06-01 15:29:13.357895	2026-06-26	2026-06-26	Cancelado	175000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780345769/comprobantes/ktvvr79vcrvbivtkgtlx.jpg
7	30	20	2026-06-01 14:42:13.180691	2026-06-13	2026-06-14	Cancelado	175000.00	https://res.cloudinary.com/di1xs8vma/image/upload/v1780343667/comprobantes/nrztzzxntw9ps9gbeo3e.jpg
6	29	20	2026-06-01 13:50:25.915505	2026-07-04	2026-07-05	Cancelado	300000.00	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (rol_id, nombre) FROM stdin;
7	Administrador
8	Recepcionista
9	Mantenimiento
10	Administrador
11	Recepcionista
12	Mantenimiento
\.


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios (servicio_id, nombre, encargado, duracion_minutos, precio, descripcion, fecha_actualizacion, estado, img_url) FROM stdin;
1	Decoración Cumpleaños (Sencilla)	Staff	60	60000.00	Letrero luminoso, bombas, luces	2026-05-30	Activo	https://via.placeholder.com/300?text=Decoracion+Sencilla
2	Decoración Cumpleaños (Especial)	Staff	120	180000.00	Letrero, luces, bombas, pétalos, vino, torta	2026-05-30	Activo	https://via.placeholder.com/300?text=Decoracion+Especial
3	Decoración Aniversario (Sencilla)	Staff	60	50000.00	Luces, pétalos, letrero	2026-05-30	Activo	https://via.placeholder.com/300?text=Aniversario+Sencillo
4	Decoración Aniversario (Especial)	Staff	120	180000.00	Letrero, bombas, luces, vino, torta, pétalos	2026-05-30	Activo	https://via.placeholder.com/300?text=Aniversario+Especial
\.


--
-- Data for Name: servicios_por_paquete; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios_por_paquete (servicio_paquete_id, paquete_id, servicio_id, cantidad_personas) FROM stdin;
1	33	4	2
2	34	4	2
4	37	3	2
\.


--
-- Data for Name: tipo_paquete; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_paquete (tipo_id, nombre) FROM stdin;
4	Fin de Semana / Festivo
5	Semana (L - V)
6	Ocasional
7	Día de Sol
8	Ocasional Fin de Semana
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario_id, rol_id, tipo_identificacion, numero_identificacion, nombre, contacto, sueldo, estado, fecha_agregado, fecha_actualizacion) FROM stdin;
5	7	CC	43480071	Sandra Rodriguez	3103599065	0.00	Activo	2026-05-30 22:34:43.237763	\N
\.


--
-- Name: cabanas_cabana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cabanas_cabana_id_seq', 4, true);


--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_cliente_id_seq', 32, true);


--
-- Name: danos_mantenimientos_dano_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.danos_mantenimientos_dano_id_seq', 1, false);


--
-- Name: facturas_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facturas_factura_id_seq', 14, true);


--
-- Name: fechas_bloqueadas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fechas_bloqueadas_id_seq', 6, true);


--
-- Name: imagenes_cabana_imagen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.imagenes_cabana_imagen_id_seq', 30, true);


--
-- Name: login_login_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_login_id_seq', 1, true);


--
-- Name: logs_login_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_login_log_id_seq', 1, false);


--
-- Name: metodos_pago_metodo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.metodos_pago_metodo_id_seq', 3, true);


--
-- Name: notificaciones_notificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificaciones_notificacion_id_seq', 9, true);


--
-- Name: pagos_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_pago_id_seq', 1, false);


--
-- Name: paquetes_paquete_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.paquetes_paquete_id_seq', 37, true);


--
-- Name: promociones_promocion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promociones_promocion_id_seq', 1, false);


--
-- Name: reembolsos_reembolso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reembolsos_reembolso_id_seq', 10, true);


--
-- Name: resenas_resena_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resenas_resena_id_seq', 3, true);


--
-- Name: reservas_reserva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_reserva_id_seq', 14, true);


--
-- Name: roles_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_rol_id_seq', 21, true);


--
-- Name: servicios_por_paquete_servicio_paquete_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicios_por_paquete_servicio_paquete_id_seq', 4, true);


--
-- Name: servicios_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicios_servicio_id_seq', 4, true);


--
-- Name: tipo_paquete_tipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_paquete_tipo_id_seq', 8, true);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 7, true);


--
-- Name: cabanas cabanas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cabanas
    ADD CONSTRAINT cabanas_pkey PRIMARY KEY (cabana_id);


--
-- Name: clientes clientes_numero_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_numero_identificacion_key UNIQUE (numero_identificacion);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (cliente_id);


--
-- Name: danos_mantenimientos danos_mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danos_mantenimientos
    ADD CONSTRAINT danos_mantenimientos_pkey PRIMARY KEY (dano_id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (factura_id);


--
-- Name: fechas_bloqueadas fechas_bloqueadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechas_bloqueadas
    ADD CONSTRAINT fechas_bloqueadas_pkey PRIMARY KEY (id);


--
-- Name: imagenes_cabana imagenes_cabana_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_cabana
    ADD CONSTRAINT imagenes_cabana_pkey PRIMARY KEY (imagen_id);


--
-- Name: login login_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_email_key UNIQUE (email);


--
-- Name: login login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_pkey PRIMARY KEY (login_id);


--
-- Name: logs_login logs_login_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_login
    ADD CONSTRAINT logs_login_pkey PRIMARY KEY (log_id);


--
-- Name: metodos_pago metodos_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metodos_pago
    ADD CONSTRAINT metodos_pago_pkey PRIMARY KEY (metodo_id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (notificacion_id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (pago_id);


--
-- Name: paquetes paquetes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT paquetes_pkey PRIMARY KEY (paquete_id);


--
-- Name: promociones_cabanas promociones_cabanas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_cabanas
    ADD CONSTRAINT promociones_cabanas_pkey PRIMARY KEY (promocion_id, cabana_id);


--
-- Name: promociones promociones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones
    ADD CONSTRAINT promociones_pkey PRIMARY KEY (promocion_id);


--
-- Name: reembolsos reembolsos_factura_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reembolsos
    ADD CONSTRAINT reembolsos_factura_id_key UNIQUE (factura_id);


--
-- Name: reembolsos reembolsos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reembolsos
    ADD CONSTRAINT reembolsos_pkey PRIMARY KEY (reembolso_id);


--
-- Name: resenas resenas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resenas
    ADD CONSTRAINT resenas_pkey PRIMARY KEY (resena_id);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (reserva_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (servicio_id);


--
-- Name: servicios_por_paquete servicios_por_paquete_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios_por_paquete
    ADD CONSTRAINT servicios_por_paquete_pkey PRIMARY KEY (servicio_paquete_id);


--
-- Name: tipo_paquete tipo_paquete_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_paquete
    ADD CONSTRAINT tipo_paquete_pkey PRIMARY KEY (tipo_id);


--
-- Name: clientes unique_cliente_identificacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT unique_cliente_identificacion UNIQUE (tipo_identificacion, numero_identificacion);


--
-- Name: usuarios unique_usuario_identificacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT unique_usuario_identificacion UNIQUE (tipo_identificacion, numero_identificacion);


--
-- Name: usuarios usuarios_contacto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_contacto_key UNIQUE (contacto);


--
-- Name: usuarios usuarios_numero_identificacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_identificacion_key UNIQUE (numero_identificacion);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- Name: idx_clientes_nombre_pattern; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_nombre_pattern ON public.clientes USING btree (nombre varchar_pattern_ops);


--
-- Name: idx_danos_cabana_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_danos_cabana_estado ON public.danos_mantenimientos USING btree (cabana_id, estado);


--
-- Name: idx_facturas_fecha_total_incl; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_facturas_fecha_total_incl ON public.facturas USING btree (fecha_factura) INCLUDE (total, reserva_id);


--
-- Name: idx_logs_login_reciente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_login_reciente ON public.logs_login USING btree (fecha_hora DESC);


--
-- Name: idx_pagos_fecha_ingreso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_fecha_ingreso ON public.pagos USING btree (fecha_pago) WHERE ((estado)::text <> 'Cancelado'::text);


--
-- Name: idx_reembolsos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reembolsos_fecha ON public.reembolsos USING btree (fecha);


--
-- Name: idx_reservas_pendientes_pago; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_pendientes_pago ON public.reservas USING btree (llegada) WHERE ((por_pagar <= (0)::numeric) AND ((estado)::text <> 'Pagado'::text) AND ((estado)::text <> 'Cancelado'::text));


--
-- Name: idx_reservas_perf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reservas_perf ON public.reservas USING btree (paquete_id, cliente_id) WHERE ((estado)::text <> 'Cancelada'::text);


--
-- Name: idx_spq_paquete_busqueda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_spq_paquete_busqueda ON public.servicios_por_paquete USING btree (paquete_id, servicio_id);


--
-- Name: facturas trg_actualizar_total_factura; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_actualizar_total_factura BEFORE INSERT ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.fn_calcular_total_factura();


--
-- Name: fechas_bloqueadas fechas_bloqueadas_cabana_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fechas_bloqueadas
    ADD CONSTRAINT fechas_bloqueadas_cabana_id_fkey FOREIGN KEY (cabana_id) REFERENCES public.cabanas(cabana_id) ON DELETE CASCADE;


--
-- Name: login fk_cuenta_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT fk_cuenta_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- Name: danos_mantenimientos fk_dano_cabanas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danos_mantenimientos
    ADD CONSTRAINT fk_dano_cabanas FOREIGN KEY (cabana_id) REFERENCES public.cabanas(cabana_id);


--
-- Name: facturas fk_facturas_reservas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT fk_facturas_reservas FOREIGN KEY (reserva_id) REFERENCES public.reservas(reserva_id) ON UPDATE CASCADE;


--
-- Name: imagenes_cabana fk_imagenes_cabana_cabanas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.imagenes_cabana
    ADD CONSTRAINT fk_imagenes_cabana_cabanas FOREIGN KEY (cabana_id) REFERENCES public.cabanas(cabana_id) ON DELETE CASCADE;


--
-- Name: logs_login fk_logs_login_ref; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_login
    ADD CONSTRAINT fk_logs_login_ref FOREIGN KEY (login_id) REFERENCES public.login(login_id) ON DELETE CASCADE;


--
-- Name: pagos fk_pagos_facturas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pagos_facturas FOREIGN KEY (factura_id) REFERENCES public.facturas(factura_id);


--
-- Name: pagos fk_pagos_metodos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pagos_metodos FOREIGN KEY (metodo_id) REFERENCES public.metodos_pago(metodo_id);


--
-- Name: paquetes fk_paquete_cabana; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT fk_paquete_cabana FOREIGN KEY (cabana_id) REFERENCES public.cabanas(cabana_id);


--
-- Name: paquetes fk_paquete_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT fk_paquete_tipo FOREIGN KEY (tipo_id) REFERENCES public.tipo_paquete(tipo_id);


--
-- Name: paquetes fk_paquete_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paquetes
    ADD CONSTRAINT fk_paquete_usuario FOREIGN KEY (registrado_por_id) REFERENCES public.usuarios(usuario_id);


--
-- Name: reembolsos fk_reembolsos_facturas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reembolsos
    ADD CONSTRAINT fk_reembolsos_facturas FOREIGN KEY (factura_id) REFERENCES public.facturas(factura_id);


--
-- Name: reservas fk_reservas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_reservas_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON DELETE CASCADE;


--
-- Name: reservas fk_reservas_paquetes; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT fk_reservas_paquetes FOREIGN KEY (paquete_id) REFERENCES public.paquetes(paquete_id);


--
-- Name: servicios_por_paquete fk_servicio_paquete; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios_por_paquete
    ADD CONSTRAINT fk_servicio_paquete FOREIGN KEY (paquete_id) REFERENCES public.paquetes(paquete_id) ON UPDATE CASCADE;


--
-- Name: servicios_por_paquete fk_servicio_servicios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios_por_paquete
    ADD CONSTRAINT fk_servicio_servicios FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id) ON UPDATE CASCADE;


--
-- Name: usuarios fk_usuarios_roles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_roles FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id);


--
-- Name: promociones_cabanas promociones_cabanas_cabana_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_cabanas
    ADD CONSTRAINT promociones_cabanas_cabana_id_fkey FOREIGN KEY (cabana_id) REFERENCES public.cabanas(cabana_id) ON DELETE CASCADE;


--
-- Name: promociones_cabanas promociones_cabanas_promocion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_cabanas
    ADD CONSTRAINT promociones_cabanas_promocion_id_fkey FOREIGN KEY (promocion_id) REFERENCES public.promociones(promocion_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict A7ZufkrhDtFDeRZHibnZOOmRWMpC3wqIu91XyEPDKnFDKfOO2NDgzWqanx0kMWu

