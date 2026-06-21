/**
 * Datos centralizados de cabañas y servicios.
 * Se utiliza como una base de datos local simulada para la aplicación web.
 */
export const CABINS = [
  {
    id: "palmas",
    name: "Cabaña Palmas",
    description: "Ideal para parejas, con todas las comodidades de lujo en medio del bosque para una experiencia inolvidable.",
    images: [
      "/cabins/palmas/3.webp",
      "/cabins/palmas/1.webp",
      "/cabins/palmas/2.webp",
      "/cabins/palmas/4.webp",
      "/cabins/palmas/5.webp",
      "/cabins/palmas/6.webp"
    ],
    features: ["Jacuzzi privado", "Nevera mini bar", "TV con TDT", "Wifi", "BBQ", "Maya catamaran", "Parqueadero", "Zona de fogata", "Zona verde"],
    plans: {
      occasional: 160000,
      week: 280000,
      weekend: 350000,
      sun_day: 220000
    },
    maxGuests: 4,
    additionalPersonPrice: 70000
  },
  {
    id: "bambu",
    name: "Cabaña Bambú",
    description: "Una inmersión rústica con acabados en bambú, perfecta para quienes buscan conexión profunda con la naturaleza.",
    images: [
      "/cabins/bambu/3.webp",
      "/cabins/bambu/2.webp",
      "/cabins/bambu/1.webp",
      "/cabins/bambu/4.webp",
      "/cabins/bambu/5.webp",
      "/cabins/bambu/6.webp"
    ],
    features: ["Jacuzzi privado", "Nevera mini bar", "TV con TDT", "Wifi", "BBQ", "Parqueadero", "Zona de fogata", "Zona verde"],
    plans: {
      occasional: 160000,
      week: 280000,
      weekend: 350000,
      sun_day: 220000
    },
    maxGuests: 3,
    additionalPersonPrice: 70000
  },
  {
    id: "roble",
    name: "Cabaña Roble",
    description: "Estructura de madera noble con vistas panorámicas, pozo de fuego y jacuzzi privado para veladas románticas.",
    images: [
      "/cabins/roble/3.webp",
      "/cabins/roble/2.webp",
      "/cabins/roble/1.webp",
      "/cabins/roble/4.webp",
      "/cabins/roble/5.webp",
      "/cabins/roble/6.webp"
    ],
    features: ["Jacuzzi privado", "Nevera mini bar", "TV con TDT", "Wifi", "BBQ", "Parqueadero", "Pozo de fuego", "Zona verde"],
    plans: {
      occasional: 150000,
      week: 250000,
      weekend: 290000,
      sun_day: 180000
    },
    maxGuests: 2,
    additionalPersonPrice: 0
  }
];

/**
 * Servicios adicionales que el cliente puede contratar.
 * 'price: 0' indica que se coordina externamente o es bajo pedido.
 */
export const SERVICES = [
  { id: 'cumple_sencillo', name: 'Decoración Cumpleaños (Sencilla)', price: 60000, desc: 'Letrero luminoso, bombas, luces' },
  { id: 'cumple_especial', name: 'Decoración Cumpleaños (Especial)', price: 180000, desc: 'Letrero, luces, bombas, pétalos, vino, torta' },
  { id: 'aniv_sencillo', name: 'Decoración Aniversario (Sencilla)', price: 50000, desc: 'Luces, pétalos, letrero' },
  { id: 'aniv_especial', name: 'Decoración Aniversario (Especial)', price: 180000, desc: 'Letrero, bombas, luces, vino, torta, pétalos' }
];

