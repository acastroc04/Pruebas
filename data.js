/**
 * CONFIGURACIÓN DE PISTAS POR CATEGORÍA
 * 5 pistas para cada persona con códigos de 6 caracteres.
 */
const CLUES_SETS = {
    "daniela": {
        title: "Desafío de Daniela",
        clues: [
            { id: 1, code: "A7X9P2", title: "Pista 1", description: "Veo historias sin hablar, brillo sin ser sol, y mando en la sala desde mi sitio.", isFinal: false },
            { id: 2, code: "B3M1K8", title: "Pista 2", description: "Tu siguiente código es la Palabra del Wordle de hoy: https://lapalabradeldia.com/", isFinal: false },
            { id: 3, code: "COLMO", title: "Pista 3", description: "No busques la marca en el camino, sino en quien lo soporta. Hay un portal pequeño, escondido bajo cada paso: por fuera parecen normales, pero por dentro el suelo se ha rendido.", isFinal: false },
            { id: 4, code: "D2W0Q7", title: "Pista 4", description: "Busca en el cuarto que duerme cerrado, donde se guardan cosas que nadie reclama; allí, un objeto hecho para sostener prendas conserva una pista sin vestir", isFinal: false },
            { id: 5, code: "E8V4Z1", title: "¡FINAL!", description: "No todo hechizo vive en un libro, ni todo monstruo nace en una pantalla. Busca una carta donde otro mundo se mezcla con el juego, y donde Hawkins se convierte en estrategia.", isFinal: true }
        ]
    },
    "karla": {
        title: "Aventura de Karla",
        clues: [
            { id: 1, code: "F1Y3S9", title: "Pista 1", description: "Detrás del cielo quieto donde vuelan y paran sombras con alas.", isFinal: false },
            { id: 2, code: "G6N2L0", title: "Pista 2", description: "[ESCRIBE AQUÍ LA PISTA 2]", isFinal: false },
            { id: 3, code: "H4P7V2", title: "Pista 3", description: "[ESCRIBE AQUÍ LA PISTA 3]", isFinal: false },
            { id: 4, code: "J9W1R5", title: "Pista 4", description: "[ESCRIBE AQUÍ LA PISTA 4]", isFinal: false },
            { id: 5, code: "K2X8M4", title: "¡FINAL!", description: "[ESCRIBE AQUÍ LA PISTA FINAL]", isFinal: true }
        ]
    },
    "carolina": {
        title: "Misión de Carolina",
        clues: [
            { id: 1, code: "L5Z9T3", title: "Pista 1", description: "Busca al testigo que no conserva recuerdos, pero repite cada gesto sin equivocarse.", isFinal: false },
            { id: 2, code: "M1K4Q8", title: "Pista 2", description: "Busca en la estantería el pequeño guardián del olor del bebe desnudo.", isFinal: false },
            { id: 3, code: "N7V2R6", title: "Pista 3", description: "Busca el rincón pequeño donde la casa guarda su poder en silencio; no parece importante, pero desde ahí puede despertar entera o quedarse muda.", isFinal: false },
            { id: 4, code: "P0W3S9", title: "Pista 4", description: "El secreto se guarda en la pisada del orco que odiaba el ruido.", isFinal: false },
            { id: 5, code: "Q8X1M5", title: "¡FINAL!", description: "Dentro de tu virginidad intacta está la respuesta", isFinal: true }
        ]
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.CLUES_SETS = CLUES_SETS;
}
