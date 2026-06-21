import { Router } from "express";
import {
    getreservations,
    getReservationByInvoice,
    activateReservation,
    cancelReservation,
    reservationFilters,
    getReservationStats,
    createReservation,
    uploadPaymentReceipt,
    confirmReservationPayment,
    rejectReservationPayment,
    getLatestReservationId,
    rescheduleReservation,
    getReservationServices,
    cancelReservationForceMajeure
} from '../controllers/reservation.controller.js';

import { validateRules } from "../middleware/validate.middleware.js";
import {
    rulesCreateReservation,
    rulesUpdateReservation
} from '../validators/reservation.rules.js';
import upload from "../services/multer.service.js";

const router = Router();

router.post('/', upload.single('comprobante'), createReservation);
router.put('/:id/payment', upload.single('comprobante'), uploadPaymentReceipt);
router.put('/confirm/:id', confirmReservationPayment);
router.put('/reject/:id', rejectReservationPayment);
router.post('/force-cancel/:id', cancelReservationForceMajeure);

router.get('/', getreservations);
router.post('/search', getReservationByInvoice);
router.get('/latest-id', getLatestReservationId);
router.get('/services/:id', getReservationServices);
router.put('/activate/:id', activateReservation);
router.put('/reschedule/:id', rescheduleReservation);
router.delete('/delete/:id', cancelReservation);
router.get('/filters', reservationFilters);
router.get('/stats', getReservationStats);

export default router;
