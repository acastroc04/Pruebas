document.addEventListener('DOMContentLoaded', () => {
    // Elementos UI
    const selectionScreen = document.getElementById('selectionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const selectionBtns = document.querySelectorAll('.selection-btn');
    const backBtn = document.getElementById('backBtn');
    const gameTitle = document.getElementById('gameTitle');
    
    const codeInput = document.getElementById('codeInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const cluesList = document.getElementById('cluesList');
    const feedback = document.getElementById('feedback');
    const unlockCard = document.getElementById('unlockCard');
    const noCluesMsg = document.getElementById('noCluesMsg');

    // Estado de la aplicación
    let currentSetId = localStorage.getItem('selectedSet') || null;
    let unlockedIds = [];

    // Inicializar
    if (currentSetId) {
        showGame(currentSetId);
    }

    // Eventos de selección
    selectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const setId = btn.getAttribute('data-set');
            selectSet(setId);
        });
    });

    backBtn.addEventListener('click', () => {
        localStorage.removeItem('selectedSet');
        location.reload(); // Recargar para volver al estado inicial limpio
    });

    // Eventos de juego
    unlockBtn.addEventListener('click', handleUnlock);
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUnlock();
    });

    function selectSet(setId) {
        currentSetId = setId;
        localStorage.setItem('selectedSet', setId);
        showGame(setId);
    }

    function showGame(setId) {
        const setData = window.CLUES_SETS[setId];
        if (!setData) return;

        gameTitle.textContent = setData.title;
        selectionScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        // Cargar progreso específico de este set
        unlockedIds = JSON.parse(localStorage.getItem(`unlocked_${setId}`)) || [];
        renderClues();
        if (window.lucide) window.lucide.createIcons();
    }

    function handleUnlock() {
        const inputCode = codeInput.value.trim().toUpperCase();
        if (!inputCode) return;

        // Caso especial: Borrar progreso
        if (inputCode === 'BORRAR') {
            resetProgress();
            codeInput.value = '';
            return;
        }

        const setData = window.CLUES_SETS[currentSetId];
        const clueIndex = setData.clues.findIndex(c => c.code.toUpperCase() === inputCode);
        const foundClue = setData.clues[clueIndex];

        if (foundClue) {
            if (unlockedIds.includes(foundClue.id)) {
                showFeedback('Ya has desbloqueado esta pista.', 'info');
            } else {
                // Verificar si es la pista que toca (orden secuencial)
                if (clueIndex > 0) {
                    const previousClue = setData.clues[clueIndex - 1];
                    if (!unlockedIds.includes(previousClue.id)) {
                        showFeedback('Debes desbloquear la pista anterior primero.', 'error');
                        triggerError();
                        return;
                    }
                }
                unlockClue(foundClue);
            }
        } else {
            triggerError();
        }

        codeInput.value = '';
    }

    function unlockClue(clue) {
        unlockedIds.push(clue.id);
        localStorage.setItem(`unlocked_${currentSetId}`, JSON.stringify(unlockedIds));
        
        showFeedback('¡Pista desbloqueada!', 'success');
        renderClues();
        
        setTimeout(() => {
            const el = document.getElementById(`clue-${clue.id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }

    function renderClues() {
        const setData = window.CLUES_SETS[currentSetId];
        const cluesToShow = setData.clues
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
                    <div class="clue-header">
                        <i data-lucide="${clue.isFinal ? 'trophy' : 'map-pin'}"></i>
                        <h3>${clue.title}</h3>
                    </div>
                    <p>${clue.description}</p>
                `;
                cluesList.appendChild(clueEl);
            });
            if (window.lucide) window.lucide.createIcons();
        } else {
            noCluesMsg.style.display = 'flex'; // Usar flex para centrar con el icono
            cluesList.innerHTML = '';
            cluesList.appendChild(noCluesMsg);
        }
    }

    function resetProgress() {
        if (confirm('¿Estás seguro de que quieres borrar TODO el progreso de todas las aventuras?')) {
            unlockedIds = [];
            // Borrar todas las posibles claves de localStorage
            Object.keys(window.CLUES_SETS).forEach(setId => {
                localStorage.removeItem(`unlocked_${setId}`);
            });
            localStorage.removeItem('selectedSet');
            
            showFeedback('Todo el progreso ha sido borrado.', 'success');
            
            // Recargar para volver al menú principal limpio
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    }

    function showFeedback(message, type) {
        feedback.textContent = message;
        feedback.style.color = type === 'success' ? 'var(--success)' : 
                              type === 'info' ? 'var(--primary)' : 'var(--error)';
        setTimeout(() => feedback.textContent = '', 3000);
    }

    function triggerError() {
        unlockCard.classList.add('shake');
        showFeedback('Código incorrecto.', 'error');
        setTimeout(() => unlockCard.classList.remove('shake'), 400);
    }
});
