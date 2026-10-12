import { body, param } from "express-validator";

export const rulesCreateService = [
  body("nombre")
    .trim()
    .notEmpty().withMessage("El nombre es requerido")
    .isLength({ min: 5 }).withMessage("El nombre debe tener al menos 5 caracteres"),
  body("encargado")
    .trim()
    .notEmpty().withMessage("El encargado es requerido")
    .isLength({ min: 7 }).withMessage("El encargado debe tener al menos 5 caracteres"),
  body("duracion_minutos")
    .notEmpty().withMessage("La duracion es requerida")
    .isNumeric().withMessage("La duracion debe ser un numero"),
  body("precio")
    .notEmpty().withMessage("El precio es requerido")
    .isNumeric().withMessage("El precio debe ser un numero"),
];

export const rulesUpdateService = [
  body("nombre")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres"),
  body("encargado")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3 }).withMessage("El encargado debe tener al menos 3 caracteres"),
  body("duracion_minutos")
    .optional({ values: "falsy" })
    .isNumeric().withMessage("La duracion debe ser un numero"),
  body("precio")
    .optional({ values: "falsy" })
    .isNumeric().withMessage("El precio debe ser un numero"),
];
