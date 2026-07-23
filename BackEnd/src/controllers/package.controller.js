import pool from '../config/db.js'
import { notification } from '../models/notification.model.js';
import { 
  packages, 
  packageType, 
  packageStats, 
  packageFilters as packageFiltersModel, 
  packageProducts, 
  packageServices 
} from '../models/package.model.js'

export const getPackageTypes = async (req, res) => {
  try {
    const result = await pool.query(packageType.getPackageTypes);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackages = async (req, res) => {
  try {
    const result = await pool.query(packages.getPackages);

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({message: error.message})
  }
};

export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(packages.getPackageById, [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}

export const getPackageByName = async (req, res) => {
  try {
    const { tipo } = req.body;
    
    const result = await pool.query(
      packages.getPackageByName, 
      [tipo.trim()]
    );

    res.json(result.rows);
    
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const createPackageType = async (req, res) => {
  try {
    const {
      nombre,

      userName
    } = req.body;
    
    await pool.query("BEGIN");

    const result = await pool.query(
      packageType.createPackageType,
      [nombre]
    );
    
    await pool.query(notification.createNotification, [
      userName || 'Sistema',
      "Paquetes",
      `El paquete ${nombre} ha sido creado`
    ]);

    await pool.query("COMMIT");

    res.status(200).json({
      message: 'Paquete creado',
      data: result.rows[0]
    })
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: 'Error al crear paquete',
      error: error.message
    });
  }
}

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const { 
      cabana_id, 
      tipo_id, 
      dias_estadia, 
      descripcion,
      img_url,
      precio_promocional,
      userName
    } = req.body;
    
    let p_promocional = null;
    if (precio_promocional !== "" && precio_promocional !== null && precio_promocional !== undefined && precio_promocional !== "null") {
      p_promocional = Number(precio_promocional);
      if (isNaN(p_promocional)) p_promocional = null;
    }

    const d_estadia = dias_estadia === "" ? null : dias_estadia;

    await pool.query("BEGIN");

    const result = await pool.query(
      packages.updatePackage,
      [
        cabana_id ?? null, 
        tipo_id ?? null, 
        d_estadia ?? null, 
        descripcion ?? null, 
        img_url ?? null, 
        p_promocional, 
        id ?? null
      ]
    );

    await pool.query(notification.createNotification, [
      userName ?? 'Sistema',
      "Paquete",
      `El paquete #${id} ha sido actualizado`
    ]);

    await pool.query("COMMIT");

    res.status(200).json({
      message: 'Paquete actualizado',
      paqueteId: id,
      data: result.rows[0]
    })
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("ERROR EN UPDATE PACKAGE:", error);
    res.status(500).json({
      message: 'Error al actualizar paquete',
      error: error.message
    });
  }
}

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;

    await pool.query("BEGIN");

    const result = await pool.query(
      packages.deletePackage, 
      [id]
    );

    await pool.query(notification.createNotification, [
      userName ?? 'Sistema',
      "Paquete",
      `El paquete #${id} ha sido eliminado`
    ]);

    await pool.query("COMMIT");

    res.status(200).json({
      message: 'Paquete eliminado',
      paqueteId: id,
      data: result.rows[0]
    })
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: 'Error al eliminar paquete',
      error: error.message
    });
  }
};

export const activatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;
    
    await pool.query("BEGIN");

    const result = await pool.query(
      packages.activatePackage,
      [id]
    );

    await pool.query(notification.createNotification, [
      userName ?? 'Sistema',
      "Paquete",
      `El paquete #${id} ha sido activado`
    ]);

    await pool.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({error: error.message})
  }
}

export const getPackageStats = async (req, res) => {
  try {
    const [most_frecuent_package, least_frecuent_package, top_packages] = await Promise.all([
      pool.query(packageStats.most_frecuent_package),
      pool.query(packageStats.least_frecuent_package),
      pool.query(packageStats.top_packages),
    ])

    res.json({
      most_frecuent_package: most_frecuent_package.rows,
      least_frecuent_package: least_frecuent_package.rows,
      top_packages: top_packages.rows,
    });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const packageFilters = async (req, res) => {
  try {
    const [idle_packages, longer_stay_packages, shorter_stay_packages] = await Promise.all([
      pool.query(packageFiltersModel.idle_packages),
      pool.query(packageFiltersModel.longer_stay_packages),
      pool.query(packageFiltersModel.shorter_stay_packages),
    ]);

    res.json({
      idle_packages: idle_packages.rows,
      longer_stay_packages: longer_stay_packages.rows,
      shorter_stay_packages: shorter_stay_packages.rows,
    })
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const getPackageProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(packageProducts.getProducts, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export const getPackageServices = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(packageServices.getServices, [id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}