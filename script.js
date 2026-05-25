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
        stopGpsTracking();
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
        if (setData.isGPS) {
            unlockCard.style.display = 'none';
            if (gpsCard) gpsCard.style.display = 'block';
            startGpsTracking();
        } else {
            unlockCard.style.display = 'block';
            if (gpsCard) gpsCard.style.display = 'none';
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
            stopGpsTracking(); // Detener GPS por si estuviera activo
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

        try {
            watchId = navigator.geolocation.watchPosition(
                handleGpsSuccess,
                handleGpsError,
                options
            );
        } catch (err) {
            console.error('Error sincrónico de GPS:', err);
            handleGpsError({ code: 1, message: err.message });
        }
    }

    function stopGpsTracking() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
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
        
        // Mover el punto del radar proporcionalmente
        updateRadarDot(distance);

        // DETERMINACIÓN DE UMBRAL: 15 metros para el punto final, 20 metros para los demás
        const isFinalPoint = (currentGpsIndex === setData.coordinates.length - 1);
        const threshold = isFinalPoint ? 15 : 20;

        // Actualizar dinámicamente el texto de instrucción en pantalla
        const gpsInstructionEl = document.querySelector('.gps-instruction');
        if (gpsInstructionEl) {
            gpsInstructionEl.innerHTML = `Muévete en el mundo real. Cuando estés a menos de <strong>${threshold} metros</strong> del punto, la pista se desbloqueará sola.`;
        }

        // CONDICIÓN CRÍTICA: Desbloqueo según umbral dinámico (15m o 20m)
        if (distance <= threshold) {
            unlockGpsCheckpoint(isSimulated);
        }
    }

    function updateRadarDot(distance) {
        if (!radarTarget) return;
        radarTarget.style.display = 'block';
        
        // Cuanto más cerca, más cerca del centro del radar
        const maxRange = 150; // Rango máximo representado en el radar
        const normalized = Math.min(distance, maxRange) / maxRange; // 0 a 1
        
        // 70px es el radio útil máximo del círculo de radar (180px de ancho total)
        const radius = normalized * 70; 
        
        // Usamos un ángulo característico para cada checkpoint (90 grados por punto para 4 puntos)
        const angle = (currentGpsIndex * 90 + 35) * Math.PI / 180;
        
        const x = Math.round(radius * Math.cos(angle));
        const y = Math.round(radius * Math.sin(angle));
        
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
                    if (!isSimulated) {
                        startGpsTracking();
                    } else {
                        // En simulación solo actualizamos textos
                        const nextTarget = setData.coordinates[currentGpsIndex];
                        gpsTargetName.textContent = `Objetivo: ${nextTarget.name}`;
                        gpsDistanceVal.textContent = '--';
                        if (radarTarget) radarTarget.style.display = 'none';
                    }
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
    const simToggleBtn = document.getElementById('simToggleBtn');
    const simContent = document.getElementById('simContent');
    const simLatInput = document.getElementById('simLat');
    const simLngInput = document.getElementById('simLng');
    const simCoordsBtn = document.getElementById('simCoordsBtn');
    const gpsSimulatorPanel = document.getElementById('gpsSimulator');

    // Activador Secreto: Doble clic en el título de la cabecera (icono brújula / "Aventura de Geolocalización")
    const gpsHeaderTitle = document.querySelector('.gps-header .header-left');
    if (gpsHeaderTitle && gpsSimulatorPanel) {
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
        arrive: function(stepIndex) {
            const setData = window.CLUES_SETS['olea'];
            if (stepIndex >= setData.coordinates.length) return;
            
            // Sincronizar índice para simular este paso específico
            currentGpsIndex = stepIndex;
            updateTimeline();
            
            const target = setData.coordinates[stepIndex];
            console.log(`[SIMULADOR] Llegando a: ${target.name} (${target.lat}, ${target.lng})`);
            processPosition(target.lat, target.lng, true);
        },
        near: function(stepIndex) {
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
        inject: function(lat, lng) {
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
    // INICIALIZACIÓN DE LA APLICACIÓN
    // ==========================================
    // Se ejecuta al final para asegurar que todos los listeners estén registrados
    if (currentSetId) {
        showGame(currentSetId);
    }
});
