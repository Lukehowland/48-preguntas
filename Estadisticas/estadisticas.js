// Inicializar Firebase
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

let generalChart, questionChart, userChart;

// Función para cargar las estadísticas generales
function loadGeneralStats() {
    db.ref('surveyResponses').once('value', snapshot => {
        if (snapshot.exists()) {
            const responses = snapshot.val();
            const aggregatedData = {};

            // Agrupar respuestas por pregunta y opción
            Object.values(responses).forEach(response => {
                Object.entries(response.responses).forEach(([question, answer]) => {
                    if (!aggregatedData[question]) {
                        aggregatedData[question] = {};
                    }
                    answer.forEach(ans => {
                        aggregatedData[question][ans] = (aggregatedData[question][ans] || 0) + 1;
                    });
                });
            });

            // Preparar datos para el gráfico
            const labels = Object.keys(aggregatedData);
            const datasets = Object.keys(aggregatedData[labels[0]]).map((ans, idx) => ({
                label: ans,
                data: labels.map(question => aggregatedData[question][ans] || 0),
                backgroundColor: `rgba(59, 177, 179, ${0.5 + idx * 0.1})`,
                borderColor: 'rgba(59, 177, 179, 1)',
                borderWidth: 1
            }));

            // Crear gráfico
            if (generalChart) generalChart.destroy();
            const ctx = document.getElementById('generalChart').getContext('2d');
            generalChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } else {
            document.getElementById('generalChart').parentElement.innerHTML = '<p>Nadie ha realizado el cuestionario aún.</p>';
        }
    });
}

// Función para cargar estadísticas por pregunta
function loadQuestionStats() {
    const questionSelect = document.getElementById('questionSelect');
    db.ref('surveyResponses').once('value', snapshot => {
        if (snapshot.exists()) {
            const responses = snapshot.val();
            const questions = Object.keys(responses[Object.keys(responses)[0]].responses);

            questionSelect.innerHTML = '<option value="">Seleccione una pregunta</option>';
            questions.forEach(question => {
                const option = document.createElement('option');
                option.value = question;
                option.textContent = question;
                questionSelect.appendChild(option);
            });

            questionSelect.addEventListener('change', function () {
                const selectedQuestion = this.value;
                if (selectedQuestion !== '') {
                    const questionData = {};

                    Object.values(responses).forEach(response => {
                        response.responses[selectedQuestion].forEach(ans => {
                            questionData[ans] = (questionData[ans] || 0) + 1;
                        });
                    });

                    const labels = Object.keys(questionData);
                    const data = Object.values(questionData);

                    if (questionChart) questionChart.destroy();
                    const ctx = document.getElementById('questionChart').getContext('2d');
                    questionChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: selectedQuestion,
                                data: data,
                                backgroundColor: 'rgba(59, 177, 179, 0.5)',
                                borderColor: 'rgba(59, 177, 179, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                } else {
                    document.getElementById('questionChart').parentElement.innerHTML = '<p>Seleccione una pregunta para ver las estadísticas.</p>';
                }
            });
        } else {
            document.getElementById('questionChart').parentElement.innerHTML = '<p>Nadie ha realizado el cuestionario aún.</p>';
        }
    });
}

// Función para cargar estadísticas por usuario
function loadUserStats() {
    const userSelect = document.getElementById('userSelect');
    db.ref('surveyResponses').once('value', snapshot => {
        if (snapshot.exists()) {
            const responses = snapshot.val();
            const users = Object.keys(responses);

            userSelect.innerHTML = '<option value="">Seleccione un usuario</option>';
            users.forEach(userId => {
                const option = document.createElement('option');
                option.value = userId;
                option.textContent = responses[userId].fullName || 'Usuario Anónimo';
                userSelect.appendChild(option);
            });

            userSelect.addEventListener('change', function () {
                const selectedUserId = this.value;
                if (selectedUserId !== '') {
                    const userResponses = responses[selectedUserId].responses;

                    const labels = Object.keys(userResponses);
                    const data = labels.map(question => userResponses[question].length);

                    if (userChart) userChart.destroy();
                    const ctx = document.getElementById('userChart').getContext('2d');
                    userChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: `Respuestas de ${responses[selectedUserId].fullName || 'Usuario Anónimo'}`,
                                data: data,
                                backgroundColor: 'rgba(59, 177, 179, 0.5)',
                                borderColor: 'rgba(59, 177, 179, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });
                } else {
                    document.getElementById('userChart').parentElement.innerHTML = '<p>Seleccione un usuario para ver las estadísticas.</p>';
                }
            });
        } else {
            document.getElementById('userChart').parentElement.innerHTML = '<p>Nadie ha realizado el cuestionario aún.</p>';
        }
    });
}

// Inicializar todas las estadísticas
loadGeneralStats();
loadQuestionStats();
loadUserStats();
