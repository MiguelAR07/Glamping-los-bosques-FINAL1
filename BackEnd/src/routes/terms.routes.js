import { Router } from "express";
import {
  getTerms,
  getTermById,
  createTerm,
  updateTerm,
  deleteTerm
} from "../controllers/terms.controller.js";

const router = Router();

router.get('/', getTerms);
router.get('/:id', getTermById);
router.post('/', createTerm);
router.put('/:id', updateTerm);
router.delete('/:id', deleteTerm);

export default router;
