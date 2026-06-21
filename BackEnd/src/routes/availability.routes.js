import { Router } from "express";
import { getEvents, addBlockedDate, deleteBlockedDate } from "../controllers/availability.controller.js";

const router = Router();

router.get('/', getEvents);
router.post('/block', addBlockedDate);
router.delete('/block/:id', deleteBlockedDate);

export default router;
