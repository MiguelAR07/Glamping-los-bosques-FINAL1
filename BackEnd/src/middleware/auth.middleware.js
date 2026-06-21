import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  // Permitir solicitudes públicas (solo lectura GET) para la Landing Page
  if (req.method === 'GET') {
    const publicPaths = ['/cabins', '/services', '/packages', '/products', '/types', '/reviews', '/promociones'];
    
    const baseRoute = req.baseUrl ? req.baseUrl.replace('/api', '') : req.path;
    
    if (publicPaths.some(publicPath => req.path.startsWith(publicPath) || req.baseUrl.includes(publicPath))) {
      return next();
    }
  }

  // Rutas públicas que permiten POST (Landing Page)
  if (req.method === 'POST') {
    if (req.baseUrl.includes('/reviews') || req.path.startsWith('/reviews')) {
      return next();
    }
    // Permitir crear reserva desde la Landing Page
    if (req.path === '/reservations' || req.path === '/reservations/') {
      return next();
    }
  }

  // Rutas públicas que permiten PUT (Landing Page)
  if (req.method === 'PUT') {
    if (req.path.startsWith('/reservations') && req.path.includes('/payment')) {
      return next();
    }
  }

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "Formato de token inválido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch(err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
} 