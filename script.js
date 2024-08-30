const startBtn = document.getElementById('start-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerDisplay = document.getElementById('timer');
const selectionTimer = document.getElementById('selection-timer');
const resultsTable = document.getElementById('results-table');
const resultsBody = document.getElementById('results-body');
const questionContainer = document.getElementById('question-container');

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let timer;
let canSelect = false;

// API'den Soruları Çekme
async function fetchQuestions() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    // İlk 10 postu seçip soruları oluşturuyoruz
    questions = data.slice(0, 10).map(post => ({
        question: post.title,
        options: generateOptions(post.body),
        answer: post.body.split(' ')[0] // Örnek cevap, ihtiyaca göre ayarlanabilir
    }));
}

// Şıkları oluşturma
function generateOptions(text) {
    const words = text.split(' ');
    return ['A) ' + words[0], 'B) ' + words[1], 'C) ' + words[2], 'D) ' + words[3]];
}

// Quiz Başlat
startBtn.addEventListener('click', startQuiz);

function startQuiz() {
    startBtn.classList.add('hidden');
    resultsTable.classList.add('hidden');
    document.getElementById('timer-container').classList.add('hidden'); // Bilgilendirme mesajını ve içeriğini gizle
    document.getElementById('question-progress').classList.remove('hidden'); // İlerleme göstergesini görünür yap
    currentQuestionIndex = 0;
    selectedAnswers = [];
    fetchQuestions().then(() => {
        showQuestion();
    });
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    // Sorunun ilerleme durumunu güncelleme
    document.getElementById('question-progress').textContent = `${currentQuestionIndex + 1}/${questions.length}`;

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';

    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.disabled = true;
        button.addEventListener('click', () => selectAnswer(option));
        optionsContainer.appendChild(button);
    });

    canSelect = false;
    document.querySelector('.timer-container img').classList.remove('hidden'); // İkonu göster
    selectionTimer.classList.remove('hidden'); // Bilgilendirme mesajını göster
    startTimer();
}



// Cevap Seçimi İşleme
function selectAnswer(option) {
    if (canSelect) {
        selectedAnswers.push({ question: questions[currentQuestionIndex].question, answer: option });
        clearTimeout(timer);
        nextQuestion();
    }
}

// Cevap seçilmezse boş bırakılanları da tabloya ekle
function nextQuestion() {
    if (!selectedAnswers[currentQuestionIndex]) {
        selectedAnswers.push({ question: questions[currentQuestionIndex].question, answer: 'Cevaplanmadı' });
    }
    currentQuestionIndex++;
    showQuestion();
}

// Zamanlayıcıyı Başlat
function startTimer() {
    let timeLeft = 30;  // Toplam süre
    let selectionTimeLeft = 10; // Seçim yapılana kadar geçen süreyi 10 saniye olarak başlat
    
    // Sayaç ve görseli her yeni soru için tekrar görünür yap
    selectionTimer.style.opacity = '1';
    document.querySelector('.timer-container img').style.opacity = '1';
    timerDisplay.style.display = 'block';

    timerDisplay.textContent = `Bu soru için kalan süre: ${timeLeft} sn`; // Sayacın başlangıçta 30 göstermesini sağlar
    selectionTimer.textContent = `${selectionTimeLeft} saniye sonra seçim yapabilirsiniz...`; // İlk bilgilendirme mesajını güncelle

    canSelect = false;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Bu soru için kalan süre: ${timeLeft} sn`;

        if (selectionTimeLeft > 0) {
            selectionTimeLeft--;
            selectionTimer.textContent = `${selectionTimeLeft} saniye sonra seçim yapabilirsiniz...`;

            if (selectionTimeLeft === 0) {
                // 10 saniye geçince şıkların seçimine izin ver
                canSelect = true;
                selectionTimer.style.opacity = '0'; // Bilgilendirme mesajını yavaşça gizle
                document.querySelector('.timer-container img').style.opacity = '0'; // Görseli yavaşça gizle
                document.querySelectorAll('#options-container button').forEach(btn => {
                    btn.disabled = false;
                    btn.style.backgroundColor = 'white'; // Butonun rengini beyaza çevir
                    btn.style.color = 'rgb(0, 0, 0)'; // Butonun metin rengini siyah yap
                    btn.style.fontWeight = '700'; 
                    // Hover efekti için event listener ekleme
                    btn.addEventListener('mouseover', () => {
                        btn.style.backgroundColor = 'rgb(181, 219, 250)'; // Hover sırasında arka plan rengini değiştir
                    });

                    btn.addEventListener('mouseout', () => {
                        btn.style.backgroundColor = 'white'; // Hover efekti bitince eski rengi geri getir
                    });
                });
            }
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}






// Quiz Bitiş ve Sonuçları Göster
function endQuiz() {
    questionContainer.classList.add('hidden'); // Soru ve şıkları gizle
    timerDisplay.classList.add('hidden'); // Zamanlayıcıyı gizle
    resultsTable.classList.remove('hidden'); // Sonuçları göster
    document.getElementById('timer').style.display = 'none'; // sayacı gizle
    document.getElementById('question-progress').style.display = 'none'; // soru sayısını gizle
    resultsBody.innerHTML = '';

    selectedAnswers.forEach(answer => {
        const row = document.createElement('tr');
        const questionCell = document.createElement('td');
        const answerCell = document.createElement('td');

        questionCell.textContent = answer.question;
        answerCell.textContent = answer.answer;

        row.appendChild(questionCell);
        row.appendChild(answerCell);
        resultsBody.appendChild(row);
    });
}

