import express from 'express';
import { getBalanceDetails, uploadBalanceReceipt, getPendingBalances, approveBalance, rejectBalance } from '../controllers/balance.controller.js';
import upload from '../services/multer.service.js';
import { verificarToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/pending', verificarToken, getPendingBalances);
router.get('/:id', getBalanceDetails);
router.post('/upload/:id', upload.single('comprobante'), uploadBalanceReceipt);
router.post('/approve/:id', verificarToken, approveBalance);
router.post('/reject/:id', verificarToken, rejectBalance);

export default router;
