const questionsContainer = document.getElementById('questions-container');

function initQuiz() {
    if (!questionsContainer) return;
    
    questionsContainer.innerHTML = '';
    data.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'question-item';
        row.setAttribute('data-correct', item.correct);
        row.setAttribute('data-explanation', item.explanation);
        
        let optionsHtml = '';
        item.options.forEach(option => {
            optionsHtml += `<button type="button" class="option-btn" onclick="selectOption(this)">${option}</button>`;
        });
        
        row.innerHTML = `
            <p class="font-medium text-lg mb-3">
                <span class="font-bold text-slate-400 mr-2">${index + 1}.</span>
                <span>${item.textBefore}</span><span class="blank-line"></span><span>${item.textAfter}</span>
            </p>
            <div class="options-container">${optionsHtml}</div>
            <div class="feedback-text"></div>
        `;
        questionsContainer.appendChild(row);
    });
    
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
}

function selectOption(button) {
    const parent = button.parentElement;
    const buttons = parent.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function checkAnswers() {
    const questions = document.querySelectorAll('.question-item');
    let totalCorrect = 0;
    
    questions.forEach(q => {
        const correctAnswer = q.getAttribute('data-correct');
        const explanation = q.getAttribute('data-explanation');
        const selectedBtn = q.querySelector('.option-btn.selected');
        const feedback = q.querySelector('.feedback-text');
        const allBtns = q.querySelectorAll('.option-btn');
        
        allBtns.forEach(btn => btn.classList.remove('correct', 'incorrect'));
        feedback.className = 'feedback-text';
        
        if (selectedBtn) {
            const selectedValue = selectedBtn.innerText.trim();
            if (selectedValue === correctAnswer) {
                selectedBtn.classList.add('correct');
                feedback.innerHTML = `<strong>Correct!</strong> Well done.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
                feedback.classList.add('show-correct');
                totalCorrect++;
            } else {
                selectedBtn.classList.add('incorrect');
                allBtns.forEach(btn => { if (btn.innerText.trim() === correctAnswer) btn.classList.add('correct'); });
                feedback.innerHTML = `<strong>Incorrect.</strong> The correct answer is <strong>"${correctAnswer}"</strong>.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
                feedback.classList.add('show-incorrect');
            }
        } else {
            feedback.innerHTML = `<strong>Not answered.</strong> The correct answer is <strong>"${correctAnswer}"</strong>.<br><span class="text-sm mt-1 block"><strong>Why?</strong> ${explanation}</span>`;
            feedback.classList.add('show-incorrect');
        }
    });

    const totalQuestions = questions.length;
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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
        emojiDisplay.innerText = percentage >= 80 ? '🎉' : (percentage >= 50 ? '🚀' : '📚');
        emojiDisplay.className = 'text-4xl';
        resultsCard.className = 'text-container text-center border-0 shadow-md bg-white space-y-3';
        scoreTextContainer.className = 'text-xl font-bold text-slate-800';
        scorePercentageContainer.className = 'text-xl font-bold text-slate-800';
    }

    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    window.scrollTo({ top: resultsSection.getBoundingClientRect().top + window.pageYOffset - 40, behavior: 'smooth' });
}

function resetQuiz() {
    initQuiz();
    const resultsCard = document.getElementById('results-card');
    if (resultsCard) {
        resultsCard.className = 'text-container text-center border-0 shadow-lg bg-white space-y-3';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

initQuiz();