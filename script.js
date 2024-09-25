const firebaseConfig = {
    apiKey: "AIzaSyB2WLxMJnha_SorNDz2sXyRwi4SOH94304",
    authDomain: "cuestionario-5368c.firebaseapp.com",
    databaseURL: "https://cuestionario-5368c-default-rtdb.firebaseio.com",
    projectId: "cuestionario-5368c",
    storageBucket: "cuestionario-5368c.appspot.com",
    messagingSenderId: "789259356506",
    appId: "1:789259356506:web:63c9b3bfba13218bb80b63"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class SurveyResponse {
    constructor(email, fullName) {
        this.email = email;
        this.fullName = fullName;
        this.responses = {};
    }

    addResponse(question, answer) {
        this.responses[question] = answer;
    }

    toFirebase() {
        return {
            email: this.email,
            fullName: this.fullName,  // Incluir nombre completo en Firestore
            responses: this.responses,
        };
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const surveyForm = document.getElementById('surveyForm');
    const questions = document.querySelectorAll('.question');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    let currentQuestionIndex = 0;
    let surveyResponse;

    function showQuestion(index) {
        questions.forEach((question, i) => {
            question.style.display = i === index ? 'block' : 'none';
        });

        prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        nextBtn.textContent = index === questions.length - 1 ? 'Enviar' : 'Siguiente';
    }

    function saveResponse() {
        const currentQuestion = questions[currentQuestionIndex];
        const inputs = currentQuestion.querySelectorAll('input, textarea');
        let answer = [];

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    answer.push(input.value);
                }
            } else if (input.type === 'textarea' || input.type === 'text') {
                answer.push(input.value);
            }
        });

        surveyResponse.addResponse(currentQuestion.querySelector('label').textContent, answer);
    }

    function setupOtrosLogic() {
        const otrosCheckboxes = document.querySelectorAll('.Otros');

        otrosCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const relatedTextarea = this.parentNode.querySelector('.otrosInteresText');
                if (this.checked) {
                    relatedTextarea.style.display = 'block';
                } else {
                    relatedTextarea.style.display = 'none';
                }
            });
        });
    }

    nextBtn.addEventListener('click', function () {
        if (!surveyResponse) {
            const email = document.getElementById('email').value;
            const fullName = document.getElementById('name').value;
            surveyResponse = new SurveyResponse(email, fullName);
        }

        saveResponse();

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            saveResponse();
            // Enviar a Firebase Realtime Database
            db.ref('surveyResponses').push(surveyResponse.toFirebase())
                .then(() => {
                    alert('Encuesta enviada con éxito. ¡Gracias por tu participación!');
                    surveyForm.reset();
                    currentQuestionIndex = 0; // Reiniciar el índice de preguntas
                    showQuestion(currentQuestionIndex); // Mostrar la primera pregunta de nuevo
                })
                .catch((error) => {
                    console.error('Error al enviar la encuesta: ', error);
                    alert('Hubo un error al enviar la encuesta. Por favor, intenta de nuevo.');
                });
        }
    });

    prevBtn.addEventListener('click', function () {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    showQuestion(currentQuestionIndex);
    setupOtrosLogic();  // Inicializa la lógica para los checkboxes de "Otros"
});