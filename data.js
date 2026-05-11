/**
 * CONFIGURACIÓN DE PISTAS POR CATEGORÍA
 */
const CLUES_SETS = {
    "set1": {
        title: "Aventura Alpha",
        clues: [
            {
                id: 1,
                code: "INICIO",
                title: "Pista 1-A",
                description: "Busca donde se guardan las llaves del castillo.",
                isFinal: false
            },
            {
                id: 2,
                code: "LLAVE",
                title: "Pista 2-A",
                description: "En el jardín, bajo la piedra que parece una tortuga.",
                isFinal: true
            }
        ]
    },
    "set2": {
        title: "Desafío Beta",
        clues: [
            {
                id: 1,
                code: "SOL",
                title: "Pista 1-B",
                description: "Donde el sol toca la ventana al amanecer.",
                isFinal: false
            },
            {
                id: 2,
                code: "LUZ",
                title: "Pista 2-B",
                description: "Dentro del libro de tapas rojas en la estantería.",
                isFinal: true
            }
        ]
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.CLUES_SETS = CLUES_SETS;
}
