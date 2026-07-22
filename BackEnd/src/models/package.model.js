// Se usa de esta manera porque package es una palabra reservada
export const packages = {
  getPackages: `
    SELECT
      * 
    FROM vista_paquetes
    ORDER BY fecha DESC
  `,
  getPackageById: `
    SELECT
      * 
    FROM vista_paquetes
    WHERE id = $1
  `,
  getPackageByName: `
    SELECT
      * 
    FROM vista_paquetes
    WHERE tipo ILIKE '%' || $1 || '%'
  `,
  createPackage: `
    INSERT INTO paquetes (cabana_id, dias_estadia, fecha_registro, descripcion, estado, tipo_id)
    VALUES ($1, $2, CURRENT_DATE, $3, 'Activo', $4)
    RETURNING paquete_id
  `,
  // Un paquete debe incluir (servicios, productos, cabañas)
  updatePackage: `
    UPDATE paquetes SET
      cabana_id = COALESCE(NULLIF($1::text, '')::integer, cabana_id),
      tipo_id = COALESCE(NULLIF($2::text, '')::integer, tipo_id),
      dias_estadia = COALESCE(NULLIF($3::text, '')::integer, dias_estadia),
      descripcion = COALESCE(NULLIF($4, ''), descripcion),
      img_url = COALESCE(NULLIF($5, ''), img_url),
      precio_promocional = COALESCE(NULLIF($6::text, '')::numeric, precio_promocional),
      fecha_registro = CURRENT_DATE
    WHERE paquete_id = $7
    RETURNING paquete_id, fecha_registro
  `,
  deletePackage: `
    UPDATE paquetes SET
      estado = 'Inactivo'
    WHERE paquete_id = $1
    RETURNING paquete_id
  `,
  activatePackage: `
    UPDATE paquetes SET
      estado = 'Activo'
    WHERE paquete_id = $1
    RETURNING paquete_id
  `,
};

export const packageType = {
  createPackageType: `
    INSERT INTO tipo_paquete (nombre)
    VALUES ($1)
    RETURNING nombre
  `,
  getPackageTypes: `
    SELECT 
      tipo_id,
      nombre
    FROM tipo_paquete

  `,
};

export const packageFilters = {
  idle_packages: `
    SELECT 
      * 
    FROM vista_paquetes
    WHERE estado = 'Inactivo'
  `,
  longer_stay_packages: `
    SELECT 
      * 
    FROM vista_paquetes
    WHERE estado = 'Activo'
    ORDER BY dias DESC
  `,
  shorter_stay_packages: `
    SELECT 
      * 
    FROM vista_paquetes
    WHERE estado = 'Activo'
    ORDER BY dias ASC
  `,
};

export const packageStats = {
  most_frecuent_package: `
    SELECT 
      * 
    FROM vista_paquetes_stats 
    ORDER BY veces_reservado DESC
    LIMIT 1
  `,
  least_frecuent_package: `
    SELECT 
      * 
    FROM vista_paquetes_stats 
    ORDER BY veces_reservado ASC
    LIMIT 1
  `,
  top_packages: `
    SELECT 
      * 
    FROM vista_paquetes_stats 
    WHERE veces_reservado > 0
    ORDER BY veces_reservado DESC
    LIMIT 3
  `,
};

export const packageProducts = {
  getProducts: `
    SELECT
      * 
    FROM vista_productos_por_paquete
    WHERE paquete_id = $1
  `,
};

export const packageServices = {
  getServices: `
    SELECT
      * 
    FROM vista_servicios_por_paquete
    WHERE paquete_id = $1
  `,
};
