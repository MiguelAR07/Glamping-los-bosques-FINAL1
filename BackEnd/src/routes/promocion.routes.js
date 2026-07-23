import { Router } from 'express';
import { 
  getPromociones, 
  createPromocion, 
  updatePromocion, 
  deletePromocion,
  activatePromocion,
  deactivatePromocion
} from '../controllers/promocion.controller.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint público para el Landing Page
router.get('/', getPromociones);

// Endpoints protegidos para el Panel de Control
router.post('/', verificarToken, createPromocion);
router.put('/:id', verificarToken, updatePromocion);
router.delete('/delete/:id', verificarToken, deletePromocion);
router.put('/deactivate/:id', verificarToken, deactivatePromocion);
router.put('/activate/:id', verificarToken, activatePromocion);

export default router;
