/**
 * CONFIGURACIÓN DE PISTAS POR CATEGORÍA
 */
const CLUES_SETS = {
    "daniela": {
        title: "Desafío de Daniela",
        clues: [
            {
                id: 1,
                code: "HOLA",
                title: "Pista 1",
                description: "Ejemplo para Daniela.",
                isFinal: false
            }
        ]
    },
    "karla": {
        title: "Aventura de Karla",
        clues: [
            {
                id: 1,
                code: "SOL",
                title: "Pista 1",
                description: "Ejemplo para Karla.",
                isFinal: false
            }
        ]
    },
    "carolina": {
        title: "Misión de Carolina",
        clues: [
            {
                id: 1,
                code: "LUNA",
                title: "Pista 1",
                description: "Ejemplo para Carolina.",
                isFinal: false
            }
        ]
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.CLUES_SETS = CLUES_SETS;
}
