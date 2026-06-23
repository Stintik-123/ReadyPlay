// === APP STATE ===
const state = {
    currentQuestion: 0,
    userAnswers: [],
    isTransitioning: false
};

// === CONFIGURATION ===
const CONFIG = {
    // ЗАМЕНИ НА СВОЙ API-КЛЮЧ GEMINI
    GEMINI_API_KEY: 'AQ.Ab8RN6L5CSYpJ9jaKHR-2wCLTQl10i8HZ_a6RGC8oanRrmIPTA',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    ANALYSIS_STEPS_DURATION: 6000,
    PRELOADER_DURATION: 2500
};

// === SCREENS ===
const screens = {
    preloader: document.getElementById('screen-preloader'),
    start: document.getElementById('screen-start'),
    test: document.getElementById('screen-test'),
    analysis: document.getElementById('screen-analysis'),
    result: document.getElementById('screen-result')
};

function showScreen(screenId) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    
    audioEngine.playTransition();
    
    // Hide all screens
    Object.values(screens).forEach(s => {
        s.style.opacity = '0';
        s.style.transform = 'translateY(20px)';
        setTimeout(() => s.classList.remove('active'), 300);
    });
    
    // Show target screen
    setTimeout(() => {
        screens[screenId].classList.add('active');
        requestAnimationFrame(() => {
            screens[screenId].style.opacity = '1';
            screens[screenId].style.transform = 'translateY(0)';
        });
        state.isTransitioning = false;
    }, 350);
}

// === INITIALIZATION ===
function init() {
    // Start preloader
    setTimeout(() => {
        screens.preloader.style.opacity = '0';
        setTimeout(() => {
            screens.preloader.classList.remove('active');
            showScreen('start');
        }, 500);
    }, CONFIG.PRELOADER_DURATION);
    
    // Start DNA animation
    if (mainDNA) mainDNA.start();
    
    // Add event listeners
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => audioEngine.playHover());
    });
}

// === START TEST ===
function initiateTest() {
    state.currentQuestion = 0;
    state.userAnswers = [];
    audioEngine.playClick();
    showScreen('test');
    setTimeout(() => loadQuestion(), 400);
}

// === LOAD QUESTION ===
function loadQuestion() {
    if (state.currentQuestion >= questions.length) {
        startAnalysis();
        return;
    }
    
    const q = questions[state.currentQuestion];
    const questionBlock = document.querySelector('.question-block');
    
    // Animate out
    questionBlock.style.opacity = '0';
    questionBlock.style.transform = 'translateY(15px)';
    
    setTimeout(() => {
        // Update content
        document.getElementById('question-number').textContent = `Вопрос ${state.currentQuestion + 1}`;
        document.getElementById('question-text').textContent = q.text;
        document.getElementById('progress-text').textContent = `${state.currentQuestion + 1}/${questions.length}`;
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        progressFill.style.width = `${(state.currentQuestion / questions.length) * 100}%`;
        
        // Render answers
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        q.answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = answer;
            btn.addEventListener('click', () => selectAnswer(index, btn));
            btn.addEventListener('mouseenter', () => audioEngine.playHover());
            answersContainer.appendChild(btn);
        });
        
        // Animate in
        requestAnimationFrame(() => {
            questionBlock.style.opacity = '1';
            questionBlock.style.transform = 'translateY(0)';
        });
    }, 300);
}

// === SELECT ANSWER ===
function selectAnswer(answerIndex, button) {
    // Prevent double clicks
    if (button.classList.contains('selected')) return;
    
    audioEngine.playClick();
    
    // Visual feedback
    document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    
    // Save answer
    state.userAnswers.push({
        question: questions[state.currentQuestion].text,
        answer: questions[state.currentQuestion].answers[answerIndex],
        index: answerIndex
    });
    
    // Move to next question after delay
    setTimeout(() => {
        state.currentQuestion++;
        loadQuestion();
    }, 400);
}

// === ANALYSIS PHASE ===
async function startAnalysis() {
    showScreen('analysis');
    
    // Start badge animation
    if (badgeDNA) badgeDNA.start();
    
    const steps = [
        'Сбор генетического материала...',
        'Анализ игровых паттернов...',
        'Определение психотипа...',
        'Поиск идеальных игр...'
    ];
    
    const stepsContainer = document.getElementById('analysis-steps');
    stepsContainer.innerHTML = '';
    
    // Show steps sequentially
    for (let i = 0; i < steps.length; i++) {
        const step = document.createElement('div');
        step.className = 'analysis-step';
        step.innerHTML = `
            <span class="step-indicator"></span>
            <span>${steps[i]}</span>
        `;
        stepsContainer.appendChild(step);
    }
    
    const stepElements = document.querySelectorAll('.analysis-step');
    const analysisTitle = document.getElementById('analysis-title');
    
    // Animate steps
    for (let i = 0; i < stepElements.length; i++) {
        await delay(800);
        stepElements[i].classList.add('active');
        audioEngine.playAnalysis();
        
        if (i > 0) {
            stepElements[i-1].classList.remove('active');
            stepElements[i-1].classList.add('completed');
        }
    }
    
    analysisTitle.textContent = 'Геном расшифрован';
    
    // Call Gemini API
    let result;
    try {
        result = await callGeminiAPI(state.userAnswers);
    } catch (error) {
        console.error('API Error:', error);
        result = getFallbackResult();
    }
    
    // Final step
    stepElements[stepElements.length - 1].classList.remove('active');
    stepElements[stepElements.length - 1].classList.add('completed');
    
    await delay(1000);
    audioEngine.playResult();
    showResult(result);
}

// === GEMINI API CALL ===
async function callGeminiAPI(answers) {
    const answersText = answers.map((a, i) => 
        `Вопрос ${i+1}: ${a.question}\nОтвет: ${a.answer}`
    ).join('\n\n');
    
    const systemPrompt = `Ты — продвинутый нейроинтерфейс "NEUROGENE", анализирующий игровую психологию на глубинном уровне.

На основе ответов пользователя определи его игровой архетип, составь точный психологический портрет и подбери 3 идеальные игры.

АРХЕТИПЫ:
1. КИЛЛЕР (The Killer) — агрессивный, доминирующий, соревновательный, любит PvP и рейтинги. Девиз: "Победить любой ценой".
2. ИССЛЕДОВАТЕЛЬ (The Explorer) — любопытный, ищет секреты, лор и пасхалки, изучает каждый уголок карты. Девиз: "Знание — сила".
3. СОЦИАЛЬЩИК (The Socializer) — играет ради общения, кооператива, гильдий и совместных приключений. Девиз: "Вместе мы сила".
4. МАНЧКИН (The Optimizer) — оптимизирует всё, ищет лучший билд, мету, максимальные цифры. Девиз: "Эффективность превыше всего".

ОПРЕДЕЛИ ТОЧНЫЙ ПРОЦЕНТ СООТВЕТСТВИЯ КАЖДОМУ АРХЕТИПУ (сумма = 100%).

ДИАГНОЗ должен быть написан харизматично, с использованием игрового сленга (агр, криты, тильт, нерф, бафф, фарм, etc.).

Ответ дай СТРОГО в JSON формате (без markdown-обёрток, только чистый JSON):
{
    "primaryArchetype": "НАЗВАНИЕ_ОСНОВНОГО_АРХЕТИПА",
    "description": "Развёрнутое описание твоего игрового стиля (2-3 предложения)",
    "diagnosis": "ОДНО ЯРКОЕ ПРЕДЛОЖЕНИЕ-ДИАГНОЗ С ИГРОВЫМ СЛЕНГОМ",
    "traits": ["черта1", "черта2", "черта3", "черта4"],
    "archetypes": {
        "Киллер": 25,
        "Исследователь": 30,
        "Социальщик": 15,
        "Манчкин": 30
    },
    "games": [
        {"tier": "INDIE", "name": "Название", "type": "Жанр"},
        {"tier": "AA", "name": "Название", "type": "Жанр"},
        {"tier": "AAA", "name": "Название", "type": "Жанр"}
    ]
}`;

    const response = await fetch(`${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: systemPrompt + '\n\nОТВЕТЫ ПОЛЬЗОВАТЕЛЯ:\n' + answersText }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000
            }
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON (remove possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonStr);
}

// === FALLBACK RESULT ===
function getFallbackResult() {
    return {
        primaryArchetype: "ИССЛЕДОВАТЕЛЬ",
        description: "Ты — цифровой археолог, который видит игру как бесконечную вселенную возможностей. Твоя страсть — раскрывать секреты, которые разработчики спрятали для самых внимательных.",
        diagnosis: "Твой агр-радиус ограничен только размерами игровой карты.",
        traits: ["Любопытство", "Внимательность", "Самостоятельность", "Перфекционизм"],
        archetypes: {
            "Киллер": 15,
            "Исследователь": 60,
            "Социальщик": 10,
            "Манчкин": 15
        },
        games: [
            {"tier": "INDIE", "name": "Outer Wilds", "type": "Приключение"},
            {"tier": "AA", "name": "Hollow Knight", "type": "Метроидвания"},
            {"tier": "AAA", "name": "Elden Ring", "type": "Action RPG"}
        ]
    };
}

// === SHOW RESULT ===
function showResult(data) {
    showScreen('result');
    
    // Primary archetype
    document.getElementById('result-archetype').textContent = data.primaryArchetype;
    
    // Description
    document.getElementById('archetype-description').textContent = data.description;
    
    // Traits
    const traitsContainer = document.getElementById('traits-container');
    traitsContainer.innerHTML = '';
    data.traits.forEach(trait => {
        const tag = document.createElement('span');
        tag.className = 'trait-tag';
        tag.textContent = trait;
        traitsContainer.appendChild(tag);
    });
    
    // Diagnosis
    document.getElementById('diagnosis-text').textContent = `"${data.diagnosis}"`;
    
    // Games
    const gamesGrid = document.getElementById('games-grid');
    gamesGrid.innerHTML = '';
    data.games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-tier">${game.tier}</div>
            <div class="game-name">${game.name}</div>
            <div class="game-type">${game.type}</div>
        `;
        gamesGrid.appendChild(card);
    });
    
    // Start badge animation
    if (badgeDNA) badgeDNA.start();
    
    // Animate result cards
    document.querySelectorAll('.game-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * i);
    });
}

// === RESTART ===
function restartTest() {
    audioEngine.playClick();
    state.currentQuestion = 0;
    state.userAnswers = [];
    showScreen('start');
}

// === SHARE ===
function shareResult() {
    audioEngine.playGlitch();
    
    if (navigator.share) {
        navigator.share({
            title: 'NEUROGENE — Мой геймерский геном',
            text: `Мой игровой архетип: ${document.getElementById('result-archetype').textContent}. Узнай свой на NEUROGENE!`,
            url: window.location.href
        }).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        const text = `Мой игровой архетип: ${document.getElementById('result-archetype').textContent}. Узнай свой на NEUROGENE! ${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Ссылка скопирована! Отправь друзьям.');
        });
    }
}

// === UTILS ===
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// === GLOBAL FUNCTIONS ===
window.initiateTest = initiateTest;
window.restartTest = restartTest;
window.shareResult = shareResult;

// === START ON LOAD ===
document.addEventListener('DOMContentLoaded', init);
