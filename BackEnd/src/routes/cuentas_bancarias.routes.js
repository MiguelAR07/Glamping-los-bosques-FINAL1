import { Router } from 'express';
import { getCuentasBancarias, createCuentaBancaria, updateCuentaBancaria, deleteCuentaBancaria } from '../controllers/cuentas_bancarias.controller.js';

const router = Router();

router.get('/', getCuentasBancarias);
router.post('/', createCuentaBancaria);
router.put('/:id', updateCuentaBancaria);
router.delete('/:id', deleteCuentaBancaria);

export default router;
