document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const cluesList = document.getElementById('cluesList');
    const feedback = document.getElementById('feedback');
    const unlockCard = document.getElementById('unlockCard');
    const noCluesMsg = document.getElementById('noCluesMsg');

    // Cargar progreso desde localStorage
    let unlockedIds = JSON.parse(localStorage.getItem('unlockedClues')) || [];

    // Inicializar la interfaz
    renderClues();

    // Evento de clic en el botón
    unlockBtn.addEventListener('click', handleUnlock);

    // Evento de tecla Enter
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUnlock();
    });

    function handleUnlock() {
        const inputCode = codeInput.value.trim().toUpperCase();
        
        if (!inputCode) return;

        // Caso especial: Borrar progreso
        if (inputCode === 'BORRAR') {
            resetProgress();
            codeInput.value = '';
            return;
        }

        // Buscar el código en los datos
        const foundClue = window.CLUES_DATA.find(c => c.code.toUpperCase() === inputCode);

        if (foundClue) {
            if (unlockedIds.includes(foundClue.id)) {
                showFeedback('Ya has desbloqueado esta pista.', 'info');
            } else {
                unlockClue(foundClue);
            }
        } else {
            triggerError();
        }

        codeInput.value = '';
    }

    function resetProgress() {
        if (unlockedIds.length === 0) {
            showFeedback('No hay nada que borrar.', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres borrar todo tu progreso?')) {
            unlockedIds = [];
            localStorage.removeItem('unlockedClues');
            renderClues();
            showFeedback('Progreso borrado correctamente.', 'success');
        }
    }

    function unlockClue(clue) {
        unlockedIds.push(clue.id);
        // Guardar en localStorage
        localStorage.setItem('unlockedClues', JSON.stringify(unlockedIds));
        
        showFeedback('¡Pista desbloqueada correctamente!', 'success');
        renderClues();
        
        // Scroll hacia la nueva pista
        setTimeout(() => {
            const newClueElement = document.getElementById(`clue-${clue.id}`);
            if (newClueElement) {
                newClueElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    function renderClues() {
        // Filtrar y ordenar las pistas desbloqueadas
        const cluesToShow = window.CLUES_DATA
            .filter(c => unlockedIds.includes(c.id))
            .sort((a, b) => a.id - b.id);

        if (cluesToShow.length > 0) {
            noCluesMsg.style.display = 'none';
            cluesList.innerHTML = '';
            
            cluesToShow.forEach(clue => {
                const clueEl = document.createElement('div');
                clueEl.id = `clue-${clue.id}`;
                clueEl.className = `clue-item ${clue.isFinal ? 'final' : ''}`;
                clueEl.innerHTML = `
                    <h3>${clue.title}</h3>
                    <p>${clue.description}</p>
                `;
                cluesList.appendChild(clueEl);
            });
        } else {
            noCluesMsg.style.display = 'block';
        }
    }

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.style.color = type === 'success' ? 'var(--success)' : 
                              type === 'info' ? 'var(--primary)' : 'var(--error)';
        
        setTimeout(() => {
            feedback.textContent = '';
        }, 3000);
    }

    function triggerError() {
        unlockCard.classList.add('shake');
        showFeedback('Código incorrecto. Inténtalo de nuevo.', 'error');
        
        setTimeout(() => {
            unlockCard.classList.remove('shake');
        }, 400);
    }
});
