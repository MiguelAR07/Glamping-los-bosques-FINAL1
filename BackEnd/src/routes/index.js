import { Router } from 'express';
import { verificarToken } from '../middleware/auth.middleware.js';

import loginRouter from './login.routes.js';
import cabinRouter from './cabin.routes.js';
import cabinDamageRouter from './cabinDamage.routes.js';
import clientRouter from './customer.routes.js';
import reservationRouter from './reservation.routes.js';
import paymentRouter from './payment.routes.js';
import packageRouter from './package.routes.js';
import serviceRouter from './service.routes.js';
import userRouter from './user.routes.js';
import typesRouter from './types.routes.js';
import refoundRouter from './refound.routes.js';
import invoiceRouter from './invoice.routes.js';
import notificationRouter from './notification.routes.js';
import dashboardRouter from './dashboard.routes.js';
import reviewRouter from './review.routes.js';
import promocionRouter from './promocion.routes.js';
import availabilityRouter from './availability.routes.js';
import comprobanteRouter from './comprobante.routes.js';

const router = Router();

router.use('/login', loginRouter);

router.use(verificarToken);
router.use('/cabins', cabinRouter);
router.use('/cabinDamage', cabinDamageRouter);
router.use('/customers', clientRouter);
router.use('/reservations', reservationRouter);
router.use('/payments', paymentRouter);
router.use('/packages', packageRouter);
router.use('/services', serviceRouter);
router.use('/users', userRouter);
router.use('/refounds', refoundRouter);
router.use('/invoices', invoiceRouter);
router.use('/notifications', notificationRouter);
router.use('/dashboard', dashboardRouter);
router.use('/promociones', promocionRouter);
router.use('/availability', availabilityRouter);
router.use('/comprobantes', comprobanteRouter);

router.use('/types', typesRouter);
router.use('/reviews', reviewRouter);

export default router;
