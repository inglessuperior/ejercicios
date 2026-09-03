// ================================================================
//  drag-and-drop.js - Soporte para oraciones individuales y bloques de texto
// ================================================================

// ================================================================
// 1. DETECTAR MODO
// ================================================================
function detectMode() {
    if (typeof story !== 'undefined' && story.parts) {
        return 'story';
    } else if (typeof data !== 'undefined' && Array.isArray(data)) {
        return 'sentences';
    } else {
        console.error('drag-and-drop.js: No se encontraron datos válidos (data o story)');
        return null;
    }
}

// ================================================================
// 2. RENDERIZAR
// ================================================================
function renderQuiz() {
    const mode = detectMode();
    const wordBank = document.getElementById('word-bank');
    const container = document.getElementById('sentences-container');

    if (!wordBank || !container) return;

    wordBank.innerHTML = '';
    container.innerHTML = '';

    let allWords = [];

    if (mode === 'sentences') {
        data.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'question-item';

            row.innerHTML = `
                <p class="font-medium text-lg mb-2" style="line-height: 2.2;">
                    <span class="font-bold text-slate-400 mr-2">${index + 1}.</span>
                    <span>${item.textBefore}</span>
                    <span class="sentence-dropzone" data-expected="${item.answer}" data-slot-id="${item.id}"></span>
                    <span>${item.textAfter}</span>
                </p>
                <div class="feedback-text"></div>
            `;
            container.appendChild(row);
        });

        allWords = [
            ...data.map(d => ({ id: d.id, text: d.answer })),
            ...distractors
        ];

    } else if (mode === 'story') {
        const p = document.createElement('p');
        p.className = 'story-text';
        p.style.lineHeight = '2.2';
        p.style.fontSize = '1.125rem';

        let textBuffer = '';
        const dropItems = [];

        story.parts.forEach(part => {
            if (part.type === 'text') {
                textBuffer += part.content;
            } else if (part.type === 'drop') {
                if (textBuffer) {
                    const textNode = document.createTextNode(textBuffer);
                    p.appendChild(textNode);
                    textBuffer = '';
                }

                const zone = document.createElement('span');
                zone.className = 'sentence-dropzone';
                zone.dataset.expected = part.answer;
                zone.dataset.slotId = part.id;
                // SIN TEXTO INTERNO - solo el recuadro
                p.appendChild(zone);

                dropItems.push(part);
                allWords.push({ id: part.id, text: part.answer });
            }
        });

        if (textBuffer) {
            const textNode = document.createTextNode(textBuffer);
            p.appendChild(textNode);
        }

        container.appendChild(p);

        const feedbacksWrapper = document.createElement('div');
        feedbacksWrapper.className = 'feedbacks-wrapper';
        feedbacksWrapper.style.marginTop = '16px';

        dropItems.forEach((item, index) => {
            const feedback = document.createElement('div');
            feedback.className = 'feedback-text';
            feedback.dataset.slotId = item.id;
            feedback.style.marginTop = '4px';
            feedbacksWrapper.appendChild(feedback);
        });

        container.appendChild(feedbacksWrapper);

        window._dropItems = dropItems;
        window._feedbacksWrapper = feedbacksWrapper;

        allWords = [...allWords, ...distractors];
    }

    const shuffledWords = allWords.sort(() => Math.random() - 0.5);

    shuffledWords.forEach(word => {
        const chip = createChip(word.text, word.id);
        wordBank.appendChild(chip);
    });

    setupDragAndDrop();

    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
}

// ================================================================
// 3. CREAR FICHA ARRASTRABLE
// ================================================================
function createChip(text, id) {
    const chip = document.createElement('span');
    chip.className = 'draggable-item';
    chip.draggable = true;
    chip.innerText = text;
    chip.dataset.wordId = id;
    chip.dataset.text = text;
    chip.style.display = 'inline-block';
    chip.style.padding = '4px 12px';
    chip.style.backgroundColor = '#ffffff';
    chip.style.border = '1px solid #cbd5e1';
    chip.style.borderRadius = '6px';
    chip.style.cursor = 'grab';
    chip.style.fontWeight = '600';
    chip.style.color = '#1e293b';
    chip.style.userSelect = 'none';
    chip.style.margin = '2px';
    chip.style.verticalAlign = 'middle';

    chip.addEventListener('dragstart', (e) => {
        chip.classList.add('dragging');
        chip.style.opacity = '0.5';
        e.dataTransfer.setData('text/plain', text);
        e.dataTransfer.setData('word-id', id);
    });

    chip.addEventListener('dragend', () => {
        chip.classList.remove('dragging');
        chip.style.opacity = '1';
    });

    return chip;
}

// ================================================================
// 4. CONFIGURAR DRAG AND DROP
// ================================================================
function setupDragAndDrop() {
    const dropzones = document.querySelectorAll('.sentence-dropzone');
    const wordBank = document.getElementById('word-bank');

    dropzones.forEach(zone => {
        zone.style.display = 'inline-block';
        zone.style.minWidth = '90px';
        zone.style.minHeight = '34px';
        zone.style.border = '2px dashed #94a3b8';
        zone.style.borderRadius = '6px';
        zone.style.backgroundColor = '#f8fafc';
        zone.style.padding = '2px 6px';
        zone.style.textAlign = 'center';
        zone.style.color = '#94a3b8';
        zone.style.fontWeight = '500';
        zone.style.verticalAlign = 'middle';
        zone.style.lineHeight = '1.6';
        zone.style.transition = 'all 0.2s ease';
        zone.style.boxSizing = 'border-box';

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.style.backgroundColor = '#eff6ff';
            zone.style.borderColor = '#2563eb';
        });

        zone.addEventListener('dragleave', () => {
            if (zone.dataset.filled !== 'true') {
                zone.style.backgroundColor = '#f8fafc';
                zone.style.borderColor = '#94a3b8';
            }
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();

            const wordText = e.dataTransfer.getData('text/plain');
            const wordId = e.dataTransfer.getData('word-id');

            if (zone.dataset.filled === 'true') {
                const existingChip = zone.querySelector('.draggable-item');
                if (existingChip) {
                    wordBank.appendChild(existingChip);
                }
                zone.dataset.filled = 'false';
                zone.textContent = '';
                zone.style.backgroundColor = '#f8fafc';
                zone.style.border = '2px dashed #94a3b8';
                zone.style.color = '#94a3b8';
                zone.style.padding = '2px 6px';
                zone.style.minWidth = '90px';
                zone.style.minHeight = '34px';
            }

            let originalChip = document.querySelector(`[data-word-id='${wordId}'].draggable-item`);
            if (!originalChip) {
                originalChip = createChip(wordText, wordId);
            }

            if (originalChip.parentNode === wordBank) {
                originalChip.remove();
            }

            zone.innerHTML = '';
            zone.style.padding = '0';
            zone.style.backgroundColor = 'transparent';
            zone.style.border = 'none';
            zone.style.minWidth = 'auto';
            zone.style.minHeight = 'auto';
            zone.appendChild(originalChip);
            zone.dataset.filled = 'true';
            zone.dataset.userAnswer = wordText;
        });
    });

    wordBank.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    wordBank.addEventListener('drop', (e) => {
        e.preventDefault();
        const wordId = e.dataTransfer.getData('word-id');
        const originalChip = document.querySelector(`[data-word-id='${wordId}'].draggable-item`);
        if (originalChip) {
            const parentZone = originalChip.closest('.sentence-dropzone');
            if (parentZone) {
                parentZone.innerHTML = '';
                parentZone.textContent = '';
                parentZone.dataset.filled = 'false';
                parentZone.dataset.userAnswer = '';
                parentZone.style.backgroundColor = '#f8fafc';
                parentZone.style.border = '2px dashed #94a3b8';
                parentZone.style.borderRadius = '6px';
                parentZone.style.color = '#94a3b8';
                parentZone.style.padding = '2px 6px';
                parentZone.style.minWidth = '90px';
                parentZone.style.minHeight = '34px';
            }
            wordBank.appendChild(originalChip);
        }
    });
}

// ================================================================
// 5. VERIFICAR RESPUESTAS
// ================================================================
function checkAnswers() {
    const mode = detectMode();

    if (mode === 'sentences') {
        const rows = document.querySelectorAll('.question-item');
        let totalCorrect = 0;
        let totalQuestions = rows.length;

        rows.forEach((row, index) => {
            const zone = row.querySelector('.sentence-dropzone');
            const feedback = row.querySelector('.feedback-text');
            if (!zone || !feedback) return;

            const expected = zone.dataset.expected;
            const chip = zone.querySelector('.draggable-item');
            const item = data[index];
            const explanation = item ? item.explanation : '';

            feedback.className = 'feedback-text';

            if (chip) {
                const userText = chip.dataset.text;
                if (userText.toLowerCase() === expected.toLowerCase()) {
                    totalCorrect++;
                    chip.style.backgroundColor = '#d1e7dd';
                    chip.style.borderColor = '#a3cfbb';
                    chip.style.color = '#0f5132';
                    feedback.innerHTML = `<strong>¡Correcto!</strong> ${explanation}`;
                    feedback.classList.add('show-correct');
                } else {
                    chip.style.backgroundColor = '#fee2e2';
                    chip.style.borderColor = '#ef4444';
                    chip.style.color = '#991b1b';
                    feedback.innerHTML = `<strong>Incorrecto.</strong> La respuesta correcta es <strong>"${expected}"</strong>. ${explanation}`;
                    feedback.classList.add('show-incorrect');
                }
            } else {
                feedback.innerHTML = `<strong>Sin responder.</strong> La respuesta correcta es <strong>"${expected}"</strong>. ${explanation}`;
                feedback.classList.add('show-incorrect');
            }
        });

        const percentage = Math.round((totalCorrect / totalQuestions) * 100);
        updateScore(percentage, totalCorrect, totalQuestions);

    } else if (mode === 'story') {
        const dropzones = document.querySelectorAll('.sentence-dropzone');
        const feedbacks = document.querySelectorAll('.feedbacks-wrapper .feedback-text');
        const dropItems = window._dropItems || [];

        let totalCorrect = 0;
        let totalQuestions = dropzones.length;

        dropzones.forEach((zone, index) => {
            const feedback = feedbacks[index];
            if (!feedback) return;

            const expected = zone.dataset.expected;
            const chip = zone.querySelector('.draggable-item');
            const item = dropItems[index];
            const explanation = item ? item.explanation : '';

            feedback.className = 'feedback-text';

            if (chip) {
                const userText = chip.dataset.text;
                if (userText.toLowerCase() === expected.toLowerCase()) {
                    totalCorrect++;
                    chip.style.backgroundColor = '#d1e7dd';
                    chip.style.borderColor = '#a3cfbb';
                    chip.style.color = '#0f5132';
                    zone.style.border = 'none';
                    zone.style.backgroundColor = 'transparent';
                    feedback.innerHTML = `<strong>¡Correcto!</strong> ${explanation}`;
                    feedback.classList.add('show-correct');
                } else {
                    chip.style.backgroundColor = '#fee2e2';
                    chip.style.borderColor = '#ef4444';
                    chip.style.color = '#991b1b';
                    zone.style.border = 'none';
                    zone.style.backgroundColor = 'transparent';
                    feedback.innerHTML = `<strong>Incorrecto.</strong> La respuesta correcta es <strong>"${expected}"</strong>. ${explanation}`;
                    feedback.classList.add('show-incorrect');
                }
            } else {
                zone.style.border = '1px solid #ef4444';
                zone.style.backgroundColor = '#fee2e2';
                zone.style.color = '#991b1b';
                feedback.innerHTML = `<strong>Sin responder.</strong> La respuesta correcta es <strong>"${expected}"</strong>. ${explanation}`;
                feedback.classList.add('show-incorrect');
            }
        });

        const percentage = Math.round((totalCorrect / totalQuestions) * 100);
        updateScore(percentage, totalCorrect, totalQuestions);
    }
}

// ================================================================
// 6. ACTUALIZAR PUNTUACIÓN
// ================================================================
function updateScore(percentage, totalCorrect, totalQuestions) {
    const scoreText = document.getElementById('score-text');
    const scorePercentage = document.getElementById('score-percentage');
    const emojiDisplay = document.getElementById('score-emoji');
    const resultsCard = document.getElementById('results-card');
    const scoreTextContainer = document.getElementById('score-text-container');
    const scorePercentageContainer = document.getElementById('score-percentage-container');

    if (scoreText) scoreText.innerText = `${totalCorrect}/${totalQuestions}`;
    if (scorePercentage) scorePercentage.innerText = `${percentage}%`;

    if (percentage === 100) {
        if (emojiDisplay) emojiDisplay.innerText = '🏆';
        if (emojiDisplay) emojiDisplay.className = 'text-6xl my-4';
        if (resultsCard) resultsCard.className = 'text-container text-center border-0 shadow-lg bg-amber-100 space-y-3';
        if (scoreTextContainer) scoreTextContainer.className = 'text-xl font-bold text-amber-700';
        if (scorePercentageContainer) scorePercentageContainer.className = 'text-xl font-bold text-amber-700';

        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    } else if (percentage >= 80) {
        if (emojiDisplay) emojiDisplay.innerText = '🎉';
        if (emojiDisplay) emojiDisplay.className = 'text-4xl';
        if (resultsCard) resultsCard.className = 'text-container text-center border-0 shadow-md bg-emerald-50 space-y-3';
        if (scoreTextContainer) scoreTextContainer.className = 'text-xl font-bold text-emerald-700';
        if (scorePercentageContainer) scorePercentageContainer.className = 'text-xl font-bold text-emerald-700';
    } else if (percentage >= 50) {
        if (emojiDisplay) emojiDisplay.innerText = '🚀';
        if (emojiDisplay) emojiDisplay.className = 'text-4xl';
        if (resultsCard) resultsCard.className = 'text-container text-center border-0 shadow-md bg-blue-50 space-y-3';
        if (scoreTextContainer) scoreTextContainer.className = 'text-xl font-bold text-blue-700';
        if (scorePercentageContainer) scorePercentageContainer.className = 'text-xl font-bold text-blue-700';
    } else {
        if (emojiDisplay) emojiDisplay.innerText = '📚';
        if (emojiDisplay) emojiDisplay.className = 'text-4xl';
        if (resultsCard) resultsCard.className = 'text-container text-center border-0 shadow-md bg-slate-50 space-y-3';
        if (scoreTextContainer) scoreTextContainer.className = 'text-xl font-bold text-slate-600';
        if (scorePercentageContainer) scorePercentageContainer.className = 'text-xl font-bold text-slate-600';
    }

    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        const yOffset = -40;
        const targetPosition = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
}

// ================================================================
// 7. REINICIAR
// ================================================================
function resetQuiz() {
    document.querySelectorAll('.sentence-dropzone').forEach(zone => {
        while (zone.firstChild) {
            zone.removeChild(zone.firstChild);
        }
        zone.textContent = '';
        zone.dataset.filled = 'false';
        zone.dataset.userAnswer = '';
        zone.style.backgroundColor = '#f8fafc';
        zone.style.border = '2px dashed #94a3b8';
        zone.style.borderRadius = '6px';
        zone.style.color = '#94a3b8';
        zone.style.padding = '2px 6px';
        zone.style.minWidth = '90px';
        zone.style.minHeight = '34px';
    });

    document.querySelectorAll('.feedback-text').forEach(el => {
        el.className = 'feedback-text';
        el.innerHTML = '';
        el.style.display = 'none';
    });

    renderQuiz();

    const resultsCard = document.getElementById('results-card');
    if (resultsCard) {
        resultsCard.className = 'text-container text-center border-0 shadow-lg bg-white space-y-3';
    }

    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// 8. INICIALIZAR
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    const mode = detectMode();
    if (!mode) return;

    renderQuiz();
    window.checkAnswers = checkAnswers;
    window.resetQuiz = resetQuiz;
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const mode = detectMode();
        if (!mode) return;
        renderQuiz();
        window.checkAnswers = checkAnswers;
        window.resetQuiz = resetQuiz;
    });
} else {
    const mode = detectMode();
    if (mode) {
        renderQuiz();
        window.checkAnswers = checkAnswers;
        window.resetQuiz = resetQuiz;
    }
}