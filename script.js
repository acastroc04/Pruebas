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

    // Elementos UI para Daniela (Submenú y Escudos)
    const danielaMenuCard = document.getElementById('danielaMenuCard');
    const danielaOptionPistas = document.getElementById('danielaOptionPistas');
    const danielaOptionEscudos = document.getElementById('danielaOptionEscudos');
    const escudosCard = document.getElementById('escudosCard');
    const escudoImage = document.getElementById('escudoImage');
    const escudoInput = document.getElementById('escudoInput');
    const escudoCheckBtn = document.getElementById('escudoCheckBtn');
    const escudoFeedback = document.getElementById('escudoFeedback');
    
    const escudosSuccessModal = document.getElementById('escudosSuccessModal');
    const modalFinalMessage = document.getElementById('modalFinalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Estado de la aplicación
    let currentSetId = localStorage.getItem('selectedSet') || null;
    let unlockedIds = [];
    let danielaSubMode = localStorage.getItem('daniela_submode') || 'menu';

    // Estado GPS para Olea
    let watchId = null;
    let currentGpsIndex = 0;


    // Eventos de selección
    selectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const setId = btn.getAttribute('data-set');
            selectSet(setId);
        });
    });

    backBtn.addEventListener('click', () => {
        if (currentSetId === 'daniela') {
            if (danielaSubMode === 'pistas' || danielaSubMode === 'escudos') {
                danielaSubMode = 'menu';
                localStorage.setItem('daniela_submode', 'menu');
                showGame('daniela');
                return;
            }
        }
        
        stopGpsTracking();
        localStorage.removeItem('selectedSet');
        localStorage.removeItem('daniela_submode');
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

        // Cambiar color de acento según la aventura
        const root = document.documentElement;
        if (setId === 'daniela') root.style.setProperty('--primary', 'var(--theme-daniela)');
        else if (setId === 'karla') root.style.setProperty('--primary', 'var(--theme-karla)');
        else if (setId === 'carolina') root.style.setProperty('--primary', 'var(--theme-carolina)');
        else if (setId === 'olea') root.style.setProperty('--primary', 'var(--theme-olea)');

        gameTitle.textContent = setData.title;
        selectionScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        // Cargar progreso específico de este set
        unlockedIds = JSON.parse(localStorage.getItem(`unlocked_${setId}`)) || [];
        renderClues();

        // Control de interfaz y servicios GPS para Olea
        const gpsCard = document.getElementById('gpsCard');
        
        // Inicialmente ocultamos paneles de Daniela
        if (danielaMenuCard) danielaMenuCard.style.display = 'none';
        if (escudosCard) escudosCard.style.display = 'none';

        if (setId === 'olea') {
            unlockCard.style.display = 'none';
            if (gpsCard) gpsCard.style.display = 'block';
            startGpsTracking();
        } else if (setId === 'daniela') {
            if (gpsCard) gpsCard.style.display = 'none';
            stopGpsTracking();
            
            // Lógica de submodos de Daniela
            if (danielaSubMode === 'menu') {
                danielaMenuCard.style.display = 'block';
                unlockCard.style.display = 'none';
                document.querySelector('.clues-container').style.display = 'none';
            } else if (danielaSubMode === 'pistas') {
                danielaMenuCard.style.display = 'none';
                unlockCard.style.display = 'block';
                document.querySelector('.clues-container').style.display = 'block';
            } else if (danielaSubMode === 'escudos') {
                danielaMenuCard.style.display = 'none';
                unlockCard.style.display = 'none';
                document.querySelector('.clues-container').style.display = 'none';
                if (escudosCard) escudosCard.style.display = 'block';
                initEscudosGame();
            }
        } else {
            unlockCard.style.display = 'block';
            if (gpsCard) gpsCard.style.display = 'none';
            document.querySelector('.clues-container').style.display = 'block';
            stopGpsTracking();
        }

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

        cluesList.innerHTML = '';

        // Si hay una pista o instrucción inicial, la mostramos siempre arriba
        if (setData.initialClue) {
            const initialEl = document.createElement('div');
            initialEl.className = 'clue-item initial';
            initialEl.innerHTML = `
                <div class="clue-header">
                    <i data-lucide="info"></i>
                    <h3>Pista Inicial</h3>
                </div>
                <p>${setData.initialClue}</p>
            `;
            cluesList.appendChild(initialEl);
        }

        if (cluesToShow.length > 0) {
            noCluesMsg.style.display = 'none';
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
        } else if (!setData.initialClue) {
            noCluesMsg.style.display = 'flex'; // Usar flex para centrar con el icono
            cluesList.appendChild(noCluesMsg);
        } else {
            noCluesMsg.style.display = 'none';
        }

        if (window.lucide) window.lucide.createIcons();
    }

    function resetProgress() {
        if (confirm('¿Estás seguro de que quieres borrar TODO el progreso de todas las aventuras?')) {
            stopGpsTracking(); // Detener GPS por si estuviera activo
            unlockedIds = [];
            // Borrar todas las posibles claves de localStorage
            Object.keys(window.CLUES_SETS).forEach(setId => {
                localStorage.removeItem(`unlocked_${setId}`);
            });
            localStorage.removeItem('selectedSet');
            localStorage.removeItem('daniela_submode');
            localStorage.removeItem('daniela_escudo_index');
            localStorage.removeItem('daniela_escudos_completed');

            showFeedback('Todo el progreso ha sido borrado.', 'success');

            // Recargar para volver al menú principal limpio
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    }

    function showFeedback(message, type) {
        if (!feedback) return;
        
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i data-lucide="check-circle-2"></i>';
            feedback.className = 'feedback-msg success show';
        } else if (type === 'info') {
            iconHtml = '<i data-lucide="info"></i>';
            feedback.className = 'feedback-msg info show';
        } else {
            iconHtml = '<i data-lucide="alert-circle"></i>';
            feedback.className = 'feedback-msg error show';
        }
        
        feedback.innerHTML = `${iconHtml} <span>${message}</span>`;
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
            if (feedback) {
                feedback.classList.remove('show');
            }
        }, 3000);
    }

    function triggerError() {
        unlockCard.classList.add('shake');
        showFeedback('Código incorrecto.', 'error');
        setTimeout(() => unlockCard.classList.remove('shake'), 400);
    }

    // ==========================================
    // SERVICIOS GPS Y GEOLOCALIZACIÓN (OLEA)
    // ==========================================
    const gpsStatusBadge = document.getElementById('gpsStatusBadge');
    const gpsStatusText = document.getElementById('gpsStatusText');
    const gpsDistanceVal = document.getElementById('gpsDistanceVal');
    const gpsTargetName = document.getElementById('gpsTargetName');
    const gpsWarningBox = document.getElementById('gpsWarningBox');
    const gpsWarningMsg = document.getElementById('gpsWarningMsg');
    const gpsRetryBtn = document.getElementById('gpsRetryBtn');
    const gpsResetBtn = document.getElementById('gpsResetBtn');
    const gpsCodeInput = document.getElementById('gpsCodeInput');
    const gpsUnlockBtn = document.getElementById('gpsUnlockBtn');
    const gpsFeedback = document.getElementById('gpsFeedback');
    const radarTarget = document.getElementById('radarTarget');

    // Botón de reintento en caso de fallo de permisos
    if (gpsRetryBtn) {
        gpsRetryBtn.addEventListener('click', () => {
            gpsWarningBox.style.display = 'none';
            startGpsTracking();
        });
    }

    // Botón de reinicio para la aventura de Olea
    if (gpsResetBtn) {
        gpsResetBtn.addEventListener('click', () => {
            if (confirm('¿Quieres reiniciar tu progreso en la aventura de Olea y empezar la búsqueda desde el primer punto?')) {
                stopGpsTracking();

                // Limpiar progreso específico de Olea en localStorage
                localStorage.removeItem('unlocked_olea');

                // Resetear estado
                unlockedIds = [];
                currentGpsIndex = 0;

                // Actualizar la interfaz de pistas (las vacía)
                renderClues();

                showFeedback('Progreso de Olea reiniciado.', 'success');

                // Iniciar de nuevo el rastreo desde el Punto 1
                startGpsTracking();
            }
        });
    }

    // Manejador del desbloqueo por código de rescate manual
    function handleGpsRescueUnlock() {
        if (!gpsCodeInput || !gpsFeedback) return;
        const inputCode = gpsCodeInput.value.trim().toUpperCase();
        if (!inputCode) return;

        const setData = window.CLUES_SETS['olea'];
        if (currentGpsIndex >= setData.coordinates.length) {
            showGpsFeedback('¡La aventura ya está completada!', 'info');
            gpsCodeInput.value = '';
            return;
        }

        const activeClue = setData.clues[currentGpsIndex];

        if (activeClue && activeClue.code.toUpperCase() === inputCode) {
            gpsCodeInput.value = '';
            showGpsFeedback('¡Código de rescate aceptado!', 'success');
            // Desbloquear activando el GPS real para el siguiente punto (vibrará en móviles)
            unlockGpsCheckpoint(false);
        } else {
            showGpsFeedback('Código incorrecto.', 'error');
            // Efecto shake visual en el panel de rescate
            const rescuePanel = document.querySelector('.gps-rescue-panel');
            if (rescuePanel) {
                rescuePanel.classList.add('shake');
                setTimeout(() => rescuePanel.classList.remove('shake'), 400);
            }
        }
    }

    function showGpsFeedback(message, type) {
        if (!gpsFeedback) return;
        gpsFeedback.textContent = message;
        gpsFeedback.style.color = type === 'success' ? 'var(--success)' :
            type === 'info' ? 'var(--primary)' : 'var(--error)';
        setTimeout(() => { if (gpsFeedback) gpsFeedback.textContent = ''; }, 3000);
    }

    if (gpsUnlockBtn) {
        gpsUnlockBtn.addEventListener('click', handleGpsRescueUnlock);
    }
    if (gpsCodeInput) {
        gpsCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleGpsRescueUnlock();
        });
    }

    // Fórmula de Haversine para calcular la distancia en metros entre dos coordenadas
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c); // Distancia en metros
    }

    function startGpsTracking() {
        stopGpsTracking(); // Detener rastreador existente antes de iniciar

        currentGpsIndex = unlockedIds.length;
        updateTimeline();

        const setData = window.CLUES_SETS['olea'];

        // Verificar si ya completamos todas las coordenadas de Olea
        if (currentGpsIndex >= setData.coordinates.length) {
            showGpsSuccessState();
            return;
        }

        const target = setData.coordinates[currentGpsIndex];
        gpsTargetName.textContent = `Objetivo: ${target.name}`;

        // MODO ESPECIAL DE PRUEBAS LOCALES (file://)
        // Permite avanzar en local de forma fluida sin llamar al GPS del navegador
        if (window.location.protocol === 'file:') {
            updateStatusBadge('success', 'Modo Simulador');
            gpsDistanceVal.textContent = '--';
            if (gpsWarningBox) gpsWarningBox.style.display = 'none';
            if (radarTarget) radarTarget.style.display = 'none';

            // Actualizar dinámicamente el texto de instrucción en pantalla
            const isFinalPoint = (currentGpsIndex === setData.coordinates.length - 1);
            const threshold = isFinalPoint ? 15 : 20;
            const gpsInstructionEl = document.querySelector('.gps-instruction');
            if (gpsInstructionEl) {
                gpsInstructionEl.innerHTML = `Cuando estés a menos de <strong>${threshold} metros</strong> del punto, la pista se desbloqueará sola.`;
            }
            return;
        }

        // Verificar soporte del navegador
        if (!navigator.geolocation) {
            showGpsError('La geolocalización no está soportada en tu navegador actual.');
            return;
        }

        updateStatusBadge('warning', 'Buscando señal...');

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const fetchPosition = () => {
            navigator.geolocation.getCurrentPosition(
                handleGpsSuccess,
                handleGpsError,
                options
            );
        };

        try {
            // Realizar una primera actualización inmediata de la ubicación
            fetchPosition();

            // Configurar actualización periódica cada 5 segundos (5000ms)
            watchId = setInterval(fetchPosition, 5000);
        } catch (err) {
            console.error('Error sincrónico de GPS:', err);
            handleGpsError({ code: 1, message: err.message });
        }
    }

    function stopGpsTracking() {
        if (watchId !== null) {
            clearInterval(watchId);
            watchId = null;
        }
    }

    function handleGpsSuccess(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m)` : '';
        updateStatusBadge('success', `GPS Conectado${accuracyText}`);
        gpsWarningBox.style.display = 'none';

        processPosition(lat, lng);
    }

    function handleGpsError(err) {
        console.error('Error de GPS:', err);
        let errorMsg = 'No se ha podido acceder a tu ubicación.';

        if (err.code === 1) { // PERMISSION_DENIED
            errorMsg = 'Acceso a la ubicación denegado. Concede permisos de ubicación en tu navegador para continuar.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
            errorMsg = 'Señal GPS no disponible. Asegúrate de estar al aire libre o con buena cobertura.';
        } else if (err.code === 3) { // TIMEOUT
            errorMsg = 'Se agotó el tiempo al buscar señal. Reintentando de forma automática...';
            // No bloqueamos la UI por timeout, dejamos que siga intentando de fondo
            return;
        }

        // Validación de contexto seguro (HTTPS) y protocolo file://
        if (window.location.protocol === 'file:') {
            errorMsg = '<strong>¡Restricción del Navegador!</strong><br>' +
                'Has abierto la web abriendo el archivo directamente (<code>file://</code>). ' +
                'Los navegadores modernos bloquean el GPS por seguridad en archivos locales sin servidor.<br><br>' +
                '<strong>Para probar en PC:</strong> Abre el <strong>Panel de Pruebas GPS</strong> que tienes abajo para simular tu avance.<br>' +
                '<strong>Para jugar con GPS real:</strong> Deberás alojar esta carpeta en un servidor local (como Live Server) o subirla a un hosting HTTPS (como GitHub Pages).';
        } else if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            errorMsg = '¡Alerta! La geolocalización requiere una conexión segura (HTTPS) en dispositivos móviles. Por favor, accede con HTTPS.';
        }

        showGpsError(errorMsg);
    }

    function showGpsError(msg) {
        updateStatusBadge('error', 'Sin Señal');
        gpsWarningMsg.innerHTML = msg;
        gpsWarningBox.style.display = 'flex';
        gpsDistanceVal.textContent = '--';
        gpsTargetName.textContent = 'GPS Desconectado';
        if (radarTarget) radarTarget.style.display = 'none';
    }

    // Calcular rumbo/azimut real entre dos coordenadas GPS (retorna radianes: 0 = Norte, horario)
    function calculateBearing(lat1, lon1, lat2, lon2) {
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;

        const y = Math.sin(dLon) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

        return Math.atan2(y, x);
    }

    function processPosition(lat, lng, isSimulated = false) {
        const setData = window.CLUES_SETS['olea'];

        if (currentGpsIndex >= setData.coordinates.length) {
            showGpsSuccessState();
            return;
        }

        // Si estamos simulando o procesando una posición válida, ocultamos el error del file:// o GPS real
        if (gpsWarningBox) gpsWarningBox.style.display = 'none';
        if (isSimulated) {
            updateStatusBadge('success', 'Modo Simulador');
        }

        const target = setData.coordinates[currentGpsIndex];
        gpsTargetName.textContent = `Objetivo: ${target.name}`;

        const distance = calculateDistance(lat, lng, target.lat, target.lng);

        // Actualizar visualizador de distancia
        gpsDistanceVal.textContent = distance;

        // Mover el punto del radar proporcionalmente con dirección real
        updateRadarDot(distance, lat, lng, target.lat, target.lng);

        // DETERMINACIÓN DE UMBRAL: 15 metros para el punto final, 20 metros para los demás
        const isFinalPoint = (currentGpsIndex === setData.coordinates.length - 1);
        const threshold = isFinalPoint ? 15 : 20;

        // Actualizar dinámicamente el texto de instrucción en pantalla
        const gpsInstructionEl = document.querySelector('.gps-instruction');
        if (gpsInstructionEl) {
            gpsInstructionEl.innerHTML = `Cuando estés a menos de <strong>${threshold} metros</strong> del punto, la pista se desbloqueará sola.`;
        }

        // CONDICIÓN CRÍTICA: Desbloqueo según umbral dinámico (15m o 20m)
        if (distance <= threshold) {
            unlockGpsCheckpoint(isSimulated);
        }
    }

    function updateRadarDot(distance, userLat, userLng, targetLat, targetLng) {
        if (!radarTarget) return;
        radarTarget.style.display = 'block';

        // Cuanto más cerca, más cerca del centro del radar
        const maxRange = 150; // Rango máximo representado en el radar
        const normalized = Math.min(distance, maxRange) / maxRange; // 0 a 1

        // 70px es el radio útil máximo del círculo de radar (180px de ancho total)
        const radius = normalized * 70;

        // Calcular la dirección real (rumbo/bearing) del objetivo con respecto al usuario
        const bearing = calculateBearing(userLat, userLng, targetLat, targetLng);

        // Convertir rumbo (0 = Norte, arriba) a coordenadas cartesianas de pantalla (arriba es -Y, derecha es +X)
        const x = Math.round(radius * Math.sin(bearing));
        const y = Math.round(-radius * Math.cos(bearing));

        radarTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    function unlockGpsCheckpoint(isSimulated = false) {
        const setData = window.CLUES_SETS['olea'];
        const clue = setData.clues[currentGpsIndex];

        if (clue && !unlockedIds.includes(clue.id)) {
            stopGpsTracking(); // Pausamos el watch para evitar multihilos durante la animación

            // Vibración háptica en móviles si está soportado y no es simulación
            if (navigator.vibrate && !isSimulated) {
                navigator.vibrate([200, 100, 300]);
            }

            // Desbloqueo oficial de la pista
            unlockedIds.push(clue.id);
            localStorage.setItem('unlocked_olea', JSON.stringify(unlockedIds));

            showFeedback('¡Objetivo alcanzado! Pista desbloqueada.', 'success');

            // Efecto visual en la tarjeta
            const gpsCardEl = document.getElementById('gpsCard');
            if (gpsCardEl) {
                gpsCardEl.style.borderColor = 'var(--success)';
                gpsCardEl.classList.add('shake');
                setTimeout(() => {
                    gpsCardEl.classList.remove('shake');
                    gpsCardEl.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                }, 1000);
            }

            renderClues();

            setTimeout(() => {
                const el = document.getElementById(`clue-${clue.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);

            // Incrementar índice de GPS
            currentGpsIndex++;
            updateTimeline();

            // Reanudar GPS si quedan más objetivos, sino finalizar
            setTimeout(() => {
                if (currentGpsIndex < setData.coordinates.length) {
                    startGpsTracking();
                } else {
                    showGpsSuccessState();
                }
            }, 1800);
        }
    }

    function showGpsSuccessState() {
        updateStatusBadge('success', '¡Aventura Completada!');
        gpsDistanceVal.textContent = '0';
        gpsTargetName.textContent = '¡Has encontrado todos los puntos!';
        if (radarTarget) {
            radarTarget.style.display = 'block';
            radarTarget.style.transform = 'translate(-50%, -50%)'; // Justo en el centro
        }
        updateTimeline();
    }

    function updateStatusBadge(type, text) {
        if (!gpsStatusBadge || !gpsStatusText) return;
        gpsStatusBadge.className = `status-badge ${type}`;
        gpsStatusText.textContent = text;
    }

    function updateTimeline() {
        const steps = document.querySelectorAll('.checkpoint-step');
        const lines = document.querySelectorAll('.timeline-line');

        steps.forEach((step, idx) => {
            step.className = 'checkpoint-step';
            if (idx < currentGpsIndex) {
                step.classList.add('completed');
                // Reemplazar icono con check
                const dot = step.querySelector('.step-dot');
                if (dot) dot.innerHTML = '<i data-lucide="check"></i>';
            } else if (idx === currentGpsIndex) {
                step.classList.add('active');
            }
        });

        lines.forEach((line, idx) => {
            line.className = 'timeline-line';
            if (idx < currentGpsIndex) {
                line.classList.add('active');
            }
        });

        if (window.lucide) window.lucide.createIcons();
    }

    // ==========================================
    // CONTROLADOR DEL SIMULADOR GPS (MODO PRUEBAS)
    // ==========================================
    const ENABLE_DEV_PANEL = false; // Cambiar a true para habilitar y poder acceder al panel de pruebas
    const simToggleBtn = document.getElementById('simToggleBtn');
    const simContent = document.getElementById('simContent');
    const simLatInput = document.getElementById('simLat');
    const simLngInput = document.getElementById('simLng');
    const simCoordsBtn = document.getElementById('simCoordsBtn');
    const gpsSimulatorPanel = document.getElementById('gpsSimulator');

    // Activador Secreto: Doble clic en el título de la cabecera (icono brújula / "Aventura de Geolocalización")
    const gpsHeaderTitle = document.querySelector('.gps-header .header-left');
    if (ENABLE_DEV_PANEL && gpsHeaderTitle && gpsSimulatorPanel) {
        gpsHeaderTitle.addEventListener('dblclick', () => {
            const isCurrentlyHidden = gpsSimulatorPanel.style.display === 'none';
            gpsSimulatorPanel.style.display = isCurrentlyHidden ? 'block' : 'none';

            if (isCurrentlyHidden) {
                // Expandir controles automáticamente al revelarlo
                if (simContent) {
                    simContent.style.display = 'block';
                    if (simToggleBtn) simToggleBtn.classList.add('open');
                }
                // Scroll suave hasta el panel
                setTimeout(() => {
                    gpsSimulatorPanel.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }, 100);
            }
        });
    }

    if (simToggleBtn && simContent) {
        simToggleBtn.addEventListener('click', () => {
            const isOpen = simContent.style.display === 'block';
            simContent.style.display = isOpen ? 'none' : 'block';
            simToggleBtn.classList.toggle('open', !isOpen);
        });
    }

    // Exportar simulador a window para botones HTML onclick
    window.gpsSimulator = {
        arrive: function (stepIndex) {
            const setData = window.CLUES_SETS['olea'];
            if (stepIndex >= setData.coordinates.length) return;

            // Sincronizar índice para simular este paso específico
            currentGpsIndex = stepIndex;
            updateTimeline();

            const target = setData.coordinates[stepIndex];
            console.log(`[SIMULADOR] Llegando a: ${target.name} (${target.lat}, ${target.lng})`);
            processPosition(target.lat, target.lng, true);
        },
        near: function (stepIndex) {
            const setData = window.CLUES_SETS['olea'];
            if (stepIndex >= setData.coordinates.length) return;

            // Sincronizar índice para simular este paso específico
            currentGpsIndex = stepIndex;
            updateTimeline();

            const target = setData.coordinates[stepIndex];

            // Sumar un desfase muy pequeño (aproximadamente 25 metros de distancia)
            const simLat = target.lat + 0.00022;
            const simLng = target.lng;

            console.log(`[SIMULADOR] Cercanía a: ${target.name} (Distancia ~25m)`);
            processPosition(simLat, simLng, true);
        },
        inject: function (lat, lng) {
            console.log(`[SIMULADOR] Inyección de posición exacta: ${lat}, ${lng}`);
            processPosition(lat, lng, true);
        }
    };

    if (simCoordsBtn && simLatInput && simLngInput) {
        simCoordsBtn.addEventListener('click', () => {
            const lat = parseFloat(simLatInput.value);
            const lng = parseFloat(simLngInput.value);
            if (!isNaN(lat) && !isNaN(lng)) {
                window.gpsSimulator.inject(lat, lng);
            } else {
                alert('Introduce valores numéricos correctos.');
            }
        });
    }

    // ==========================================
    // DETECTOR DE BOTÓN PREDOMINANTE EN MÓVIL
    // ==========================================
    function updatePredominantButton() {
        // Solo se ejecuta en pantallas de tipo móvil (ancho <= 600px) y si la pantalla de selección está visible
        if (window.innerWidth > 600 || selectionScreen.style.display === 'none') {
            selectionBtns.forEach(btn => btn.classList.remove('mobile-active'));
            return;
        }

        const viewportCenter = window.innerHeight / 2;
        let closestBtn = null;
        let minDistance = Infinity;

        selectionBtns.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const btnCenter = rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenter - btnCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestBtn = btn;
            }
        });

        selectionBtns.forEach(btn => {
            if (btn === closestBtn) {
                btn.classList.add('mobile-active');
            } else {
                btn.classList.remove('mobile-active');
            }
        });
    }

    // Registrar eventos para actualizar el botón activo
    window.addEventListener('scroll', updatePredominantButton, { passive: true });
    window.addEventListener('resize', updatePredominantButton);

    // ==========================================
    // NAVEGACIÓN Y EVENTOS DEL SUBMENÚ DE DANIELA
    // ==========================================
    if (danielaOptionPistas) {
        danielaOptionPistas.addEventListener('click', () => {
            danielaSubMode = 'pistas';
            localStorage.setItem('daniela_submode', 'pistas');
            showGame('daniela');
        });
    }

    if (danielaOptionEscudos) {
        danielaOptionEscudos.addEventListener('click', () => {
            danielaSubMode = 'escudos';
            localStorage.setItem('daniela_submode', 'escudos');
            showGame('daniela');
        });
    }

    // ==========================================
    // JUEGO DE ESCUDOS (DANIELA)
    // ==========================================
    // Carga los escudos definidos de forma editable en data.js
    const ESCUDOS = window.DANIELA_ESCUDOS || [];

    let currentEscudoIndex = 0;

    function initEscudosGame() {
        currentEscudoIndex = parseInt(localStorage.getItem('daniela_escudo_index')) || 0;
        
        // Si ya estaba completado de antes, mostramos el modal final directamente
        const completed = localStorage.getItem('daniela_escudos_completed') === 'true';
        if (completed) {
            showEscudosSuccessModal();
        }
        
        loadEscudo(currentEscudoIndex);
    }

    function loadEscudo(index) {
        if (index >= ESCUDOS.length) {
            index = ESCUDOS.length - 1;
        }
        
        const escudo = ESCUDOS[index];
        if (escudoImage) {
            escudoImage.src = escudo.image;
            escudoImage.alt = `Escudo del equipo ${index + 1}`;
        }
        if (escudoInput) {
            escudoInput.value = '';
            escudoInput.placeholder = `EQUIPO ${index + 1}...`;
            setTimeout(() => escudoInput.focus(), 150);
        }
        if (escudoFeedback) {
            escudoFeedback.innerHTML = '';
            escudoFeedback.className = 'feedback-msg';
        }
        
        updateEscudosProgress(index);
    }

    function updateEscudosProgress(currentIndex) {
        const dots = document.querySelectorAll('.progress-dot');
        const lines = document.querySelectorAll('.progress-line');
        
        dots.forEach((dot, idx) => {
            dot.className = 'progress-dot';
            if (idx < currentIndex) {
                dot.classList.add('completed');
            } else if (idx === currentIndex) {
                dot.classList.add('active');
            }
        });
        
        lines.forEach((line, idx) => {
            line.className = 'progress-line';
            if (idx < currentIndex) {
                line.classList.add('completed');
            } else if (idx === currentIndex) {
                line.classList.add('active');
            }
        });
    }

    function handleEscudoCheck() {
        if (!escudoInput || !escudoFeedback) return;
        
        const userInput = escudoInput.value.trim().toUpperCase();
        if (!userInput) return;
        
        const currentEscudo = ESCUDOS[currentEscudoIndex];
        
        // Validar si coincide con alguna respuesta válida (insensible a acentos/mayúsculas)
        const isCorrect = currentEscudo.answers.some(ans => {
            return ans.toUpperCase().trim() === userInput;
        });
        
        if (isCorrect) {
            showEscudoFeedback('¡Correcto!', 'success');
            
            // Iluminar el dot de progreso actual inmediatamente como completado
            const currentDot = document.querySelector(`.progress-dot[data-step="${currentEscudoIndex}"]`);
            if (currentDot) {
                currentDot.className = 'progress-dot completed';
            }
            
            // Iluminar la línea de progreso actual inmediatamente como completada
            const lines = document.querySelectorAll('.progress-line');
            if (lines[currentEscudoIndex]) {
                lines[currentEscudoIndex].className = 'progress-line completed';
            }
            
            currentEscudoIndex++;
            
            if (currentEscudoIndex >= ESCUDOS.length) {
                // Fin del juego
                localStorage.setItem('daniela_escudo_index', ESCUDOS.length - 1);
                localStorage.setItem('daniela_escudos_completed', 'true');
                
                setTimeout(() => {
                    showEscudosSuccessModal();
                }, 800);
            } else {
                localStorage.setItem('daniela_escudo_index', currentEscudoIndex);
                setTimeout(() => {
                    loadEscudo(currentEscudoIndex);
                }, 1000);
            }
        } else {
            showEscudoFeedback('Nombre incorrecto, ¡sigue intentándolo!', 'error');
            
            // Efecto shake en la tarjeta de escudos
            if (escudosCard) {
                escudosCard.classList.add('shake');
                setTimeout(() => escudosCard.classList.remove('shake'), 400);
            }
        }
    }

    function showEscudoFeedback(message, type) {
        if (!escudoFeedback) return;
        
        let iconHtml = '';
        if (type === 'success') {
            iconHtml = '<i data-lucide="check-circle-2"></i>';
            escudoFeedback.className = 'feedback-msg success show';
        } else {
            iconHtml = '<i data-lucide="alert-circle"></i>';
            escudoFeedback.className = 'feedback-msg error show';
        }
        
        escudoFeedback.innerHTML = `${iconHtml} <span>${message}</span>`;
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
            if (escudoFeedback.classList.contains('show') && type === 'error') {
                escudoFeedback.classList.remove('show');
            }
        }, 3000);
    }

    function showEscudosSuccessModal() {
        if (escudosSuccessModal && modalFinalMessage) {
            modalFinalMessage.textContent = window.DANIELA_ESCUDOS_FINAL_MSG || '¡Felicidades!';
            escudosSuccessModal.style.display = 'flex';
            if (window.lucide) window.lucide.createIcons();
        }
    }

    // Registrar eventos para el juego de escudos
    if (escudoCheckBtn) {
        escudoCheckBtn.addEventListener('click', handleEscudoCheck);
    }
    if (escudoInput) {
        escudoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleEscudoCheck();
        });
    }
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            if (escudosSuccessModal) {
                escudosSuccessModal.style.display = 'none';
            }
            // Resetear progreso para que puedan jugar de nuevo si quieren
            localStorage.removeItem('daniela_escudo_index');
            localStorage.removeItem('daniela_escudos_completed');
            currentEscudoIndex = 0;
            
            // Regresar al submenú de Daniela
            danielaSubMode = 'menu';
            localStorage.setItem('daniela_submode', 'menu');
            showGame('daniela');
        });
    }

    // ==========================================
    // INICIALIZACIÓN DE LA APLICACIÓN
    // ==========================================
    // Se ejecuta al final para asegurar que todos los listeners estén registrados
    if (currentSetId) {
        showGame(currentSetId);
    } else {
        updatePredominantButton();
    }
});
