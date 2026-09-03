const sentencesContainer = document.getElementById('sentences-container');

function initQuiz() {
    if (!sentencesContainer) return;
    
    sentencesContainer.innerHTML = '';

    // Renderizar oraciones con múltiples inputs dinámicos según la estructura de parts
    data.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'question-item';
        
        let htmlContent = `
            <p class="font-medium text-lg mb-2">
                <span class="font-bold text-slate-400 mr-2">${index + 1}.</span>
        `;

        item.parts.forEach(part => {
            if (part.type === "text") {
                htmlContent += `<span>${part.content}</span>`;
            } else if (part.type === "input") {
                // part.answer puede ser un string único ("went") o un array de respuestas válidas (["wasn't", "was not"])
                const acceptedAnswers = Array.isArray(part.answer) ? part.answer : [part.answer];
                const expectedAttr = acceptedAnswers.join('|');
                htmlContent += `<input type="text" class="sentence-input" data-expected="${expectedAttr}" autocomplete="off" autocapitalize="off" spellcheck="false">`;
            } else if (part.type === "hint") {
                htmlContent += `<span class="text-slate-500 font-normal mr-2">${part.content}</span>`;
            }
        });

        htmlContent += `</p><div class="feedback-text"></div>`;
        row.innerHTML = htmlContent;
        sentencesContainer.appendChild(row);
    });

    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
}

// Compara el texto del alumno contra la lista de respuestas aceptadas de un input
function isAnswerAccepted(userText, expectedAttr) {
    const acceptedAnswers = expectedAttr.split('|');
    return acceptedAnswers.some(answer => userText.toLowerCase() === answer.toLowerCase());
}

// Arma el texto de respuestas esperadas para mostrar en el feedback (ej. "wasn't" / "was not")
function formatExpectedAnswers(expectedAttr) {
    return expectedAttr.split('|').map(answer => `"${answer}"`).join(' / ');
}

function checkAnswers() {
    const rows = document.querySelectorAll('.question-item');
    let totalCorrect = 0;

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('.sentence-input');
        const feedback = row.querySelector('.feedback-text');
        const explanation = data[index].explanation;
        
        feedback.className = 'feedback-text';
        let rowAllCorrect = true;
        let rowAnsweredAll = true;

        inputs.forEach(input => {
            const expected = input.dataset.expected;
            const userText = input.value.trim();

            if (userText === "") {
                rowAnsweredAll = false;
                rowAllCorrect = false;
            } else if (isAnswerAccepted(userText, expected)) {
                // Correcto individual
            } else {
                rowAllCorrect = false;
            }
        });

        // Dar estilo visual a los inputs de la fila
        if (rowAnsweredAll && rowAllCorrect) {
            inputs.forEach(input => {
                input.className = 'sentence-input bg-emerald-50 border-emerald-500 text-emerald-900';
            });
            feedback.innerHTML = `<strong>Correct!</strong> Well done.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
            feedback.classList.add('show-correct');
            totalCorrect++;
        } else {
            inputs.forEach(input => {
                const expected = input.dataset.expected;
                const userText = input.value.trim();
                if (userText !== "" && isAnswerAccepted(userText, expected)) {
                    input.className = 'sentence-input bg-emerald-50 border-emerald-500 text-emerald-900';
                } else {
                    input.className = 'sentence-input bg-rose-50 border-rose-500 text-rose-900';
                }
            });
            
            let expectedFullStr = data[index].parts
                .filter(p => p.type === 'input')
                .map(p => {
                    const acceptedAnswers = Array.isArray(p.answer) ? p.answer : [p.answer];
                    return acceptedAnswers.map(a => `"${a}"`).join(' / ');
                })
                .join(' + ');
            
            if (!rowAnsweredAll) {
                feedback.innerHTML = `<strong>Not fully answered.</strong> Expected: <strong>${expectedFullStr}</strong>.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
            } else {
                feedback.innerHTML = `<strong>Incorrect.</strong> Expected: <strong>${expectedFullStr}</strong>.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
            }
            feedback.classList.add('show-incorrect');
        }
    });

    const totalQuestions = data.length;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);

    document.getElementById('score-text').innerText = `${totalCorrect}/${totalQuestions}`;
    document.getElementById('score-percentage').innerText = `${percentage}%`;

    const emojiDisplay = document.getElementById('score-emoji');
    const resultsCard = document.getElementById('results-card');
    const scoreTextContainer = document.getElementById('score-text-container');
    const scorePercentageContainer = document.getElementById('score-percentage-container');

    if (percentage === 100) {
        emojiDisplay.innerText = '🏆';
        emojiDisplay.className = 'text-6xl my-4';
        resultsCard.className = 'text-container text-center border-0 shadow-lg bg-amber-100 space-y-3';
        scoreTextContainer.className = 'text-xl font-bold text-amber-700';
        scorePercentageContainer.className = 'text-xl font-bold text-amber-700';

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        emojiDisplay.innerText = percentage >= 80 ? '🎉' : (percentage >= 50 ? '🚀' : '📚');
        emojiDisplay.className = 'text-4xl';
        resultsCard.className = 'text-container text-center border-0 shadow-md bg-white space-y-3';
        scoreTextContainer.className = 'text-xl font-bold text-slate-600';
        scorePercentageContainer.className = 'text-xl font-bold text-slate-600';
    }

    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');

    const yOffset = -40;
    const targetPosition = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

function resetQuiz() {
    initQuiz();
    const resultsCard = document.getElementById('results-card');
    if (resultsCard) {
        resultsCard.className = 'text-container text-center border-0 shadow-lg bg-white space-y-3';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicializar al cargar
initQuiz();
