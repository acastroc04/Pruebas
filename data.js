/**
 * CONFIGURACIÓN DE PISTAS
 * Puedes añadir tantas como quieras siguiendo el formato.
 */
const CLUES_DATA = [
    {
        id: 1,
        code: "INICIO",
        title: "La Primera Pista",
        description: "Busca debajo de la mesa del salón, donde el tiempo se detiene.",
        isFinal: false
    },
    {
        id: 2,
        code: "TIEMPO",
        title: "El Segundo Paso",
        description: "Mira detrás del cuadro del pasillo, el que tiene flores azules.",
        isFinal: false
    },
    {
        id: 3,
        code: "AZUL",
        title: "Casi al Final",
        description: "En la cocina, donde guardas el café, encontrarás un pequeño sobre.",
        isFinal: false
    },
    {
        id: 4,
        code: "CAFE",
        title: "¡EL TESORO!",
        description: "¡Felicidades! Has completado el desafío. El regalo está en el maletero del coche.",
        isFinal: true
    }
];

// Exportar para que script.js pueda usarlo
if (typeof window !== 'undefined') {
    window.CLUES_DATA = CLUES_DATA;
}
