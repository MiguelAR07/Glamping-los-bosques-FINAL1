import { Router } from "express";

import {
  getCabins,
  getCabinByName,
  getCabinImages,
  getAllCabinImages,
  updateCabin,
  deleteCabin,
  createCabin,
  getCabinStats,
  activateCabin,
  getCabinFilters,
  updateImagesOrder,
  uploadCabinImage,
  deleteCabinImage
} from '../controllers/cabin.controller.js';

import { validateRules } from "../middleware/validate.middleware.js";
import {
  rulesCreateCabin,
  rulesUpdateCabin
} from '../validators/cabin.rules.js';

import upload from "../services/multer.service.js";

const router = Router();

router.get('/', getCabins);
router.get('/filters', getCabinFilters);
router.post('/search', getCabinByName);
router.get('/images', getAllCabinImages);
router.put('/images/order', updateImagesOrder);
router.get('/images/:id', getCabinImages);
router.post('/images/:id', upload.single("image"), uploadCabinImage);
router.delete('/images/:imageId', deleteCabinImage);
router.post('/', rulesCreateCabin, validateRules, createCabin);
router.put('/:id', rulesUpdateCabin, validateRules, updateCabin);
router.delete('/delete/:id', deleteCabin);
router.put('/activate/:id', activateCabin);
router.get('/stats', getCabinStats);

export default router;