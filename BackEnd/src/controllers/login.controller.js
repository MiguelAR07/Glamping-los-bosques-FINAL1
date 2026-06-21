import pool from "../config/db.js";
import { login as loginModel, selectUser } from "../models/login.model.js";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationCodeEmail, sendPasswordResetEmail } from "../services/nodemailer.service.js";

export const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    const result = await pool.query(loginModel.login, 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];
    const coinciden = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coinciden) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id, 
        email: usuario.email,
        nombre: usuario.usuario_nombre,
        rol: usuario.rol_nombre
      },
      process.env.JWT_SECRET,
      {expiresIn: '8h'}
    );

    res.json({
      message: "Login exitoso",
      token,
      user: { 
        id: usuario.usuario_id, 
        email: usuario.email,
        nombre: usuario.usuario_nombre,
        rol: usuario.rol_nombre
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
}

export const sendVerificationCode = async (req, res) => {
  try {
    const { email, contrasena, tipo_identificacion, numero_identificacion } = req.body;

    const userResult = await pool.query(
      selectUser.selectUser,
      [tipo_identificacion, numero_identificacion]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado. Asegúrate de que tu cédula esté registrada en el sistema.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Mostrar siempre el código en la consola del servidor (útil en desarrollo)
    console.log(`\n========================================`);
    console.log(`[CÓDIGO DE VERIFICACIÓN]`);
    console.log(`Correo: ${email}`);
    console.log(`Código: ${verificationCode}`);
    console.log(`========================================\n`);

    // Intentar enviar el correo, pero sin bloquear el flujo si falla
    try {
      await sendVerificationCodeEmail(email, verificationCode);
    } catch (emailError) {
      console.error('⚠️  Advertencia: No se pudo enviar el correo, pero el código sigue siendo válido:', emailError.message);
    }

    const registrationToken = jwt.sign(
      { email, contrasena, tipo_identificacion, numero_identificacion, verificationCode },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ message: 'Código de verificación enviado al correo', registrationToken });

  } catch (error) {
    console.error('Error al enviar el código de verificación:', error);
    res.status(500).json({ message: 'Error al enviar el código de verificación', error: error.message });
  }
};

export const createLogin = async (req, res) => {
  try {
    const { registrationToken, code } = req.body;

    if (!registrationToken || !code) {
      return res.status(400).json({ message: 'Falta el token de registro o el código' });
    }

    let decoded;
    try {
      decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    if (decoded.verificationCode !== code) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    const { email, contrasena, tipo_identificacion, numero_identificacion } = decoded;

    await pool.query('BEGIN');

    // 1. Buscar el usuario
    const userResult = await pool.query(
      selectUser.selectUser, 
      [tipo_identificacion, numero_identificacion]
    );

    // Validar si existe antes de acceder a rows[0]
    if (userResult.rows.length === 0) {
      await pool.query('ROLLBACK'); // ¡Importante!
      return res.status(404).json({ message: 'Usuario no encontrado en el momento de crear' });
    }

    const usuario_id = userResult.rows[0].usuario_id;

    // 2. Encriptar contraseña correctamente
    const encriptedPassword = await bcrypt.hash(contrasena, 10);

    // 3. Crear el login
    const response = await pool.query(
      loginModel.createLogin, 
      [usuario_id, email, encriptedPassword]
    );

    await pool.query('COMMIT');
    res.json(response.rows[0]);

    } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al crear el login:', error);
    res.status(500).json({ message: 'Error al crear el login' });
  }
}

export const sendResetCode = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    // Verificar si el correo existe
    const result = await pool.query("SELECT * FROM login WHERE email = $1 AND estado = 'Activo'", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Correo no registrado o inactivo' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`\n========================================`);
    console.log(`[CÓDIGO DE RECUPERACIÓN]`);
    console.log(`Correo: ${email}`);
    console.log(`Código: ${verificationCode}`);
    console.log(`========================================\n`);

    try {
      await sendPasswordResetEmail(email, verificationCode);
    } catch (emailError) {
      console.error('⚠️  Advertencia: No se pudo enviar el correo, pero el código sigue siendo válido:', emailError.message);
    }

    // Guardar la nueva contraseña de una vez en el token para evitar doble peticion
    const resetToken = jwt.sign(
      { email, nuevaContrasena: contrasena, verificationCode },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ message: 'Código de recuperación enviado al correo', resetToken });

  } catch (error) {
    console.error('Error al enviar el código de recuperación:', error);
    res.status(500).json({ message: 'Error al enviar el código de recuperación', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, code } = req.body;

    if (!resetToken || !code) {
      return res.status(400).json({ message: 'Falta el token o el código' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'El código expiró o el token es inválido' });
    }

    if (decoded.verificationCode !== code) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    const { email, nuevaContrasena } = decoded;
    const encriptedPassword = await bcrypt.hash(nuevaContrasena, 10);

    await pool.query('BEGIN');

    const result = await pool.query(loginModel.restoreLogin, [encriptedPassword, email]);

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'No se pudo actualizar la contraseña' });
    }

    await pool.query('COMMIT');
    res.json({ message: 'Contraseña restablecida exitosamente' });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al restablecer la contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};
