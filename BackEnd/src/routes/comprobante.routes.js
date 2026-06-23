import { Router } from "express";
import { getComprobantes } from "../controllers/comprobante.controller.js";

const router = Router();

router.get('/', getComprobantes);

export default router;
