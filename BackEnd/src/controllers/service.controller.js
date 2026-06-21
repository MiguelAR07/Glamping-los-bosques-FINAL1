import pool from "../config/db.js";
import { notification } from "../models/notification.model.js";
import { service, serviceFilters, serviceStats } from "../models/service.model.js";

export const getservices = async (req, res) => {
  try {
    const data = await pool.query(
      service.getServices
    );

    res.json(data.rows);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getserviceByName = async (req, res) => {
  try {
    const { name } = req.body;

    const data = await pool.query(
      service.getServiceByName, 
      [name]
    );

    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const createService = async (req, res) => {
  try {
    const { 
      nombre, 
      encargado, 
      duracion_minutos, 
      precio, 
      descripcion,
      userName
    } = req.body;

    const duracion = duracion_minutos === "" ? null : duracion_minutos;
    const precio_val = precio === "" ? null : precio;

    await pool.query("BEGIN");
    
    const result = await pool.query(service.createService, [
        nombre,
        encargado,
        duracion,
        precio_val,
        descripcion
      ]);

    await pool.query(notification.createNotification, [
      userName,
      "Servicios",
      `El servicio ${nombre} ha sido creado`
    ]);

    await pool.query("COMMIT");
    
    res.status(200).json({
      message: "Servicio creado",
      data: result.rows[0]
    });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: "Error al crear servicio",
      error: error.message
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      encargado,
      duracion_minutos,
      precio,
      descripcion,
      userName
    } = req.body;

    const duracion = duracion_minutos === "" ? null : duracion_minutos;
    const precio_val = precio === "" ? null : precio;

    await pool.query("BEGIN");

    const result = await pool.query(
      service.updateService, 
      [nombre, encargado, duracion, precio_val, descripcion, id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Servicios",
      `El servicio #${id} - ${nombre} ha sido actualizado`
    ]);

    await pool.query("COMMIT");

    res.status(200).json({
      message: "Servicio actualizado",
      servicioId: id,
      data: result.rows[0]
    })
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({
      message: "Error al actualizar servicio",
      error: error.message
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;

    await pool.query("BEGIN");

    const result = await pool.query(
      service.deleteService, 
      [id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Servicios",
      `El servicio ${id} ha sido eliminado`
    ]);
    
    await pool.query("COMMIT");

    res.status(200).json({
      message: "Servicio eliminado",
      servicioId: id,
      data: result.rows[0]
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500),json({
      message: "Error al eliminar servicio",
      error: error.message
    });
  }
};

export const activateService = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;
    
    await pool.query("BEGIN");

    const result = await pool.query(
      service.activateService, 
      [id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Servicios",
      `El servicio ${id} ha sido activado`
    ]);
    
    await pool.query("COMMIT");

    res.status(200).json({
      message: "Servicio activado",
      servicioId: id,
      data: result.rows[0]
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500),json({
      message: "Error al activar servicio",
      error: error.message
    });
  }
};

export const getServiceFilters = async (req, res) => {
  try {
    const [idle_services, longer_services, shorter_services, expensive_services, cheap_services] = await Promise.all([
      pool.query(serviceFilters.idle_services),
      pool.query(serviceFilters.longer_services),
      pool.query(serviceFilters.shorter_services),
      pool.query(serviceFilters.expensive_services),
      pool.query(serviceFilters.cheap_services)
    ]);

    res.json({
      idle_services: idle_services.rows,
      longer_services: longer_services.rows,
      shorter_services: shorter_services.rows,
      expensive_services: expensive_services.rows,
      cheap_services: cheap_services.rows
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export const getServiceStats = async (req, res) => {
  try {
    const [most_frecuent_service, least_frecuent_service, top_services] = await Promise.all([
      pool.query(serviceStats.most_frecuent_service),
      pool.query(serviceStats.least_frecuent_service),
      pool.query(serviceStats.top_services)
    ]);

    res.json({
      most_frecuent_service: most_frecuent_service.rows,
      least_frecuent_service: least_frecuent_service.rows,
      top_services: top_services.rows
    });
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

