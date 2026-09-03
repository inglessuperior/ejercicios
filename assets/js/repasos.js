// ================================================================
//  repasos.js - Lógica centralizada para TODOS los repasos
// ================================================================

function renderQuiz() {
    const container = document.getElementById("quizContainer");
    if (!container) return;

    let html = "";

    sectionsData.forEach(section => {
        html += `<div class="text-container">`;
        html += `<h2 class="titulo2 mb-2">${section.sectionTitle}</h2>`;

        section.subsections.forEach(sub => {
            html += `<h3 class="subtitulo">${sub.subtitle}</h3>`;

            sub.items.forEach(item => {
                html += `<div class="question-item">`;
                html += `<p class="font-medium text-slate-800 mb-3">${item.question}</p>`;

                if (item.type === "radio") {
                    item.options.forEach(opt => {
                        html += `
                            <label class="radio-label">
                                <input type="radio" name="${item.id}" value="${opt}">
                                <span>${opt}</span>
                            </label>
                        `;
                    });
                } else if (item.type === "text") {
                    html += `<input type="text" id="${item.id}" name="${item.id}_text" class="text-input" placeholder="Escribe tu respuesta...">`;
                }

                html += `<div id="result-${item.id}" class="result-container hidden-initial"></div>`;
                html += `</div>`;
            });
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

function normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text.toLowerCase().trim().replace(/[\.,?!]$/, '');
}

function checkQuiz() {
    let score = 0;
    let totalQuestions = 0;

    sectionsData.forEach(section => {
        section.subsections.forEach(sub => {
            sub.items.forEach(item => {
                totalQuestions++;
                const resultDiv = document.getElementById(`result-${item.id}`);
                if (!resultDiv) return;

                resultDiv.className = 'result-container';
                let isCorrect = false;

                if (item.type === "radio") {
                    const selected = document.querySelector(`input[name="${item.id}"]:checked`);
                    if (selected && selected.value === item.correct) {
                        isCorrect = true;
                    }
                } else if (item.type === "text") {
                    const inputElement = document.getElementById(item.id);
                    const rawAnswer = inputElement ? inputElement.value : '';
                    const userAnswer = normalizeText(rawAnswer);
                    const expectedAnswers = item.correct.map(normalizeText);

                    if (rawAnswer !== '' && expectedAnswers.some(exp => userAnswer.includes(exp))) {
                        isCorrect = true;
                    }
                }

                const correctDisplay = Array.isArray(item.correct) ? item.correct[0].toUpperCase() : item.correct.toUpperCase();

                if (isCorrect) {
                    score++;
                    resultDiv.textContent = `¡Correcto! ${item.explanation}`;
                    resultDiv.classList.add('correct');
                } else {
                    const userSelected = document.querySelector(`input[name="${item.id}"]:checked`);
                    const isTextEmpty = item.type === "text" && document.getElementById(item.id)?.value === '';
                    if ((!userSelected && item.type === 'radio') || isTextEmpty) {
                        resultDiv.textContent = `Sin responder. La respuesta correcta es: ${correctDisplay}. ${item.explanation}`;
                    } else {
                        resultDiv.textContent = `Incorrecto. La respuesta correcta es: ${correctDisplay}. ${item.explanation}`;
                    }
                    resultDiv.classList.add('incorrect');
                }
            });
        });
    });

    const grade = (score / totalQuestions) * 10;
    const percentage = Math.round((score / totalQuestions) * 100);

    const finalScoreElement = document.getElementById('finalScore');
    const printResultSummary = document.getElementById('printResultSummary');

    let emoji = percentage === 100 ? '🏆' : (percentage >= 80 ? '🎉' : (percentage >= 50 ? '🚀' : '📚'));

    if (finalScoreElement) {
        finalScoreElement.innerHTML = `
            <div class="text-4xl mb-1">${emoji}</div>
            <p class="text-xl font-bold text-slate-800">Aciertos: ${score} de ${totalQuestions}</p>
            <p class="text-2xl font-extrabold text-blue-600">Calificación: ${grade.toFixed(1)} (${percentage}%)</p>
        `;
        finalScoreElement.classList.remove('hidden');
    }

    if (printResultSummary) {
        printResultSummary.innerHTML = `
            <p>Aciertos: ${score} de ${totalQuestions} | Calificación: ${grade.toFixed(1)}</p>
        `;
    }

    const pdfButton = document.getElementById('pdfButton');
    if (pdfButton) pdfButton.classList.remove('hidden');

    if (percentage === 100 && typeof confetti !== 'undefined') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (finalScoreElement) {
        finalScoreElement.scrollIntoView({ behavior: 'smooth' });
    }
}

function generatePDF() {
    const finalScore = document.getElementById('finalScore');
    const checkBtn = document.getElementById('checkButton');
    const pdfBtn = document.getElementById('pdfButton');

    if (finalScore) finalScore.classList.remove('hidden');
    if (checkBtn) checkBtn.style.display = 'none';
    if (pdfBtn) pdfBtn.style.display = 'none';

    window.print();

    if (checkBtn) checkBtn.style.display = 'block';
    if (pdfBtn) pdfBtn.style.display = 'block';
}

// ================================================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Verificar que sectionsData existe
    if (typeof sectionsData !== 'undefined') {
        renderQuiz();
        
        const checkBtn = document.getElementById('checkButton');
        const pdfBtn = document.getElementById('pdfButton');
        
        if (checkBtn) checkBtn.addEventListener('click', checkQuiz);
        if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);
    } else {
        console.error('Error: sectionsData no está definido');
    }
});