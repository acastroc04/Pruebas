/**
 * CONFIGURACIÓN DE PISTAS POR CATEGORÍA
 * 5 pistas para cada persona con códigos de 6 caracteres.
 */
const CLUES_SETS = {
    "daniela": {
        title: "Desafío de Daniela",
        clues: [
            { id: 1, code: "A7X9P2", title: "Pista 1", description: "[ESCRIBE AQUÍ LA PISTA 1]", isFinal: false },
            { id: 2, code: "B3M1K8", title: "Pista 2", description: "[ESCRIBE AQUÍ LA PISTA 2]", isFinal: false },
            { id: 3, code: "C5R6T4", title: "Pista 3", description: "[ESCRIBE AQUÍ LA PISTA 3]", isFinal: false },
            { id: 4, code: "D2W0Q7", title: "Pista 4", description: "[ESCRIBE AQUÍ LA PISTA 4]", isFinal: false },
            { id: 5, code: "E8V4Z1", title: "¡FINAL!", description: "[ESCRIBE AQUÍ LA PISTA FINAL]", isFinal: true }
        ]
    },
    "karla": {
        title: "Aventura de Karla",
        clues: [
            { id: 1, code: "F1Y3S9", title: "Pista 1", description: "[ESCRIBE AQUÍ LA PISTA 1]", isFinal: false },
            { id: 2, code: "G6N2L0", title: "Pista 2", description: "[ESCRIBE AQUÍ LA PISTA 2]", isFinal: false },
            { id: 3, code: "H4P7V2", title: "Pista 3", description: "[ESCRIBE AQUÍ LA PISTA 3]", isFinal: false },
            { id: 4, code: "J9W1R5", title: "Pista 4", description: "[ESCRIBE AQUÍ LA PISTA 4]", isFinal: false },
            { id: 5, code: "K2X8M4", title: "¡FINAL!", description: "[ESCRIBE AQUÍ LA PISTA FINAL]", isFinal: true }
        ]
    },
    "carolina": {
        title: "Misión de Carolina",
        clues: [
            { id: 1, code: "L5Z9T3", title: "Pista 1", description: "[ESCRIBE AQUÍ LA PISTA 1]", isFinal: false },
            { id: 2, code: "M1K4Q8", title: "Pista 2", description: "[ESCRIBE AQUÍ LA PISTA 2]", isFinal: false },
            { id: 3, code: "N7V2R6", title: "Pista 3", description: "[ESCRIBE AQUÍ LA PISTA 3]", isFinal: false },
            { id: 4, code: "P0W3S9", title: "Pista 4", description: "[ESCRIBE AQUÍ LA PISTA 4]", isFinal: false },
            { id: 5, code: "Q8X1M5", title: "¡FINAL!", description: "[ESCRIBE AQUÍ LA PISTA FINAL]", isFinal: true }
        ]
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.CLUES_SETS = CLUES_SETS;
}
