"use strict";

/* =========================
   CONFIGURAZIONE
========================= */

const TOTAL_SETS = 3;
const REST_TIME = 60;

const STORAGE_KEY = "myFitnessWorkoutData";
const HISTORY_KEY = "myFitnessWorkoutHistory";
const MEASUREMENTS_KEY = "myFitnessBodyMeasurements";

const initialMeasurements = [
    { id: "initial-2026-09-19", date: "2026-09-19", weight: 77.15, waist: 96 },
    { id: "initial-2026-09-26", date: "2026-09-26", weight: 77.1, waist: 95 },
    { id: "initial-2026-10-03", date: "2026-10-03", weight: 75.9, waist: 95 },
    { id: "initial-2026-10-10", date: "2026-10-10", weight: 77.3, waist: 95 }
];

function loadMeasurements() {
    const saved = loadJSON(MEASUREMENTS_KEY, null);

    if (!Array.isArray(saved)) {
        saveJSON(MEASUREMENTS_KEY, initialMeasurements);
        return initialMeasurements.map(function (item) {
            return { ...item };
        });
    }

    // Importa le misurazioni iniziali mancanti senza duplicarle.
    const merged = saved.slice();

    initialMeasurements.forEach(function (initial) {
        const exists = merged.some(function (item) {
            return item.date === initial.date &&
                Number(item.weight) === initial.weight &&
                Number(item.waist) === initial.waist;
        });

        if (!exists) {
            merged.push({ ...initial });
        }
    });

    if (merged.length !== saved.length) {
        saveJSON(MEASUREMENTS_KEY, merged);
    }

    return merged;
}

let bodyMeasurements = loadMeasurements();
let editingMeasurementId = null;

/* =========================
   SCHEDE DI ALLENAMENTO
========================= */

const defaultWorkouts = {
    lunedi: {
        title: "Petto, spalle e tricipiti",
        exercises: [
            { name: "Panca piana bilanciere", reps: 8, range: "6-8", weight: 30 },
            { name: "Panca inclinata manubri", reps: 8, range: "8-10", weight: 17.5 },
            { name: "Croci ai cavi", reps: 10, range: "10-12", weight: 20 },
            { name: "Shoulder press", reps: 8, range: "8-10", weight: 16 },
            { name: "Alzate laterali", reps: 10, range: "10-12", weight: 6 },
            { name: "Pushdown al cavo", reps: 10, range: "8-12", weight: 45 }
        ]
    },

    mercoledi: {
        title: "Schiena, bicipiti e addome",
        exercises: [
            { name: "Trazioni assistite", reps: 8, range: "8-10", weight: 55 },
            { name: "Rematore", reps: 8, range: "8-10", weight: 40 },
            { name: "Pulley basso", reps: 8, range: "8-10", weight: 50 },
            { name: "Face pull", reps: 10, range: "10-12", weight: 15 },
            { name: "Curl bilanciere", reps: 8, range: "8-10", weight: 20 },
            { name: "Curl manubri", reps: 8, range: "8-10", weight: 12 },
            { name: "Cable crunch", reps: 12, range: "10-15", weight: 45 },
            { name: "Leg raises", reps: 10, range: "8-12", weight: null }
        ]
    },

    venerdi: {
        title: "Gambe, esplosività e addome",
        exercises: [
            { name: "Squat jump", reps: 5, range: "5", weight: null },
            { name: "Box jump", reps: 4, range: "4-5", weight: null },
            { name: "Salti verticali", reps: 4, range: "4", weight: null },
            { name: "Hack squat", reps: 8, range: "6-8", weight: 40 },
            { name: "Pressa", reps: 10, range: "8-10", weight: 100 },
            { name: "Stacco rumeno", reps: 8, range: "8-10", weight: 40 },
            { name: "Leg curl", reps: 10, range: "10-12", weight: 20 },
            { name: "Calf raise", reps: 12, range: "10-15", weight: 60 },
            { name: "Cable crunch", reps: 12, range: "10-15", weight: 50 },
            { name: "Leg raises", reps: 10, range: "8-12", weight: null }
        ]
    }
};

/* =========================
   ELEMENTI HTML
========================= */

const homeScreen = document.getElementById("homeScreen");
const workoutScreen = document.getElementById("workoutScreen");
const restScreen = document.getElementById("restScreen");
const summaryScreen = document.getElementById("summaryScreen");
const measurementsScreen = document.getElementById("measurementsScreen");
const bodyMeasurementsButton = document.getElementById("bodyMeasurementsButton");
const measurementsHomeButton = document.getElementById("measurementsHomeButton");
const measurementDate = document.getElementById("measurementDate");
const measurementWeight = document.getElementById("measurementWeight");
const measurementWaist = document.getElementById("measurementWaist");
const saveMeasurementButton = document.getElementById("saveMeasurementButton");
const cancelMeasurementEditButton = document.getElementById("cancelMeasurementEditButton");
const measurementMessage = document.getElementById("measurementMessage");
const measurementHistoryEmpty = document.getElementById("measurementHistoryEmpty");
const measurementHistoryList = document.getElementById("measurementHistoryList");
const measurementPeriod = document.getElementById("measurementPeriod");
const weightChartContainer = document.getElementById("weightChartContainer");
const waistChartContainer = document.getElementById("waistChartContainer");
const measurementStats = document.getElementById("measurementStats");
const tabataScreen = document.getElementById("tabataScreen");
const tabataButton = document.getElementById("tabataButton");
const tabataReturnButton = document.getElementById("tabataReturnButton");
const tabataModeSelect = document.getElementById("tabataModeSelect");
const tabataWorkSeconds = document.getElementById("tabataWorkSeconds");
const tabataRestSeconds = document.getElementById("tabataRestSeconds");
const tabataRounds = document.getElementById("tabataRounds");
const tabataBlocks = document.getElementById("tabataBlocks");
const tabataBlockRestSeconds = document.getElementById("tabataBlockRestSeconds");

const tabataStartButton = document.getElementById("tabataStartButton");
const tabataActivePanel = document.getElementById("tabataActivePanel");
const tabataSetupPanel = document.getElementById("tabataSetupPanel");
const tabataPhase = document.getElementById("tabataPhase");
const tabataCountdown = document.getElementById("tabataCountdown");
const tabataTimerDisplay = document.getElementById("tabataTimerDisplay");
const tabataCurrentExercise = document.getElementById("tabataCurrentExercise");
const tabataProgress = document.getElementById("tabataProgress");
const tabataPauseButton = document.getElementById("tabataPauseButton");
const tabataSkipButton = document.getElementById("tabataSkipButton");
const tabataFinishButton = document.getElementById("tabataFinishButton");
const tabataExerciseDoneButton = document.getElementById("tabataExerciseDoneButton");
const workoutSelect = document.getElementById("workoutSelect");
const repsRange = document.getElementById("repsRange");

const startButton = document.getElementById("startButton");
const completeButton = document.getElementById("completeButton");
const saveExerciseButton = document.getElementById("saveExerciseButton");
const cancelWorkoutButton = document.getElementById("cancelWorkoutButton");

const exerciseName = document.getElementById("exerciseName");
const exerciseProgress = document.getElementById("exerciseProgress");
const setNumber = document.getElementById("setNumber");
const repsInput = document.getElementById("repsInput");
const weightInput = document.getElementById("weightInput");
const saveMessage = document.getElementById("saveMessage");

const timer = document.getElementById("timer");
const restHeading = document.getElementById("restHeading");
const nextExerciseText = document.getElementById("nextExerciseText");
const pauseButton = document.getElementById("pauseButton");
const resetButton = document.getElementById("resetButton");

const summaryWorkoutTitle = document.getElementById("summaryWorkoutTitle");
const summaryStats = document.getElementById("summaryStats");
const summaryContent = document.getElementById("summaryContent");
const summaryHomeButton = document.getElementById("summaryHomeButton");

const historyEmpty = document.getElementById("historyEmpty");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

/* =========================
   DATI E STATO
========================= */

function loadJSON(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        return fallback;
    }
}

function saveJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("Errore nel salvataggio dei dati:", error);
        alert("Impossibile salvare i dati. Controlla lo spazio disponibile nel browser.");
        return false;
    }
}

function createWorkouts() {
    const saved = loadJSON(STORAGE_KEY, null);
    const result = {};

    for (const key in defaultWorkouts) {
        const defaults = defaultWorkouts[key];
        const savedWorkout = saved && saved[key];

        result[key] = {
            title: defaults.title,
            exercises: defaults.exercises.map(function (exercise, index) {
                const oldExercise =
                    savedWorkout &&
                    savedWorkout.exercises &&
                    savedWorkout.exercises[index];

                if (
                    oldExercise &&
                    oldExercise.name === exercise.name
                ) {
                    return {
                        ...exercise,
                        reps: oldExercise.reps,
                        weight: oldExercise.weight
                    };
                }

                return { ...exercise };
            })
        };
    }

    return result;
}

const workouts = createWorkouts();
let workoutHistory = loadJSON(HISTORY_KEY, []);

let selectedWorkout = workoutSelect.value;
let exercises = workouts[selectedWorkout].exercises;
let currentExercise = 0;
let currentSet = 1;
let seconds = REST_TIME;
let countdown = null;
let paused = false;
let workoutStarted = false;
let workoutFinished = false;
let historySavedForWorkout = false;
let completedSets = [];
let workoutStartTime = null;
let workoutDuration = 0;

/* =========================
   FUNZIONI DI SALVATAGGIO
========================= */

function saveWorkouts() {
    return saveJSON(STORAGE_KEY, workouts);
}

/* =========================
   SCHERMATA INIZIALE
========================= */

function updateWorkoutDescription() {
    const workout = workouts[workoutSelect.value];

    repsRange.textContent =
        workout.exercises.length +
        " esercizi · " +
        TOTAL_SETS +
        " serie per esercizio";
}

workoutSelect.addEventListener("change", function () {
    if (workoutStarted) {
        return;
    }

    selectedWorkout = workoutSelect.value;
    exercises = workouts[selectedWorkout].exercises;
    updateWorkoutDescription();
});

updateWorkoutDescription();

/* =========================
   AVVIO ALLENAMENTO
========================= */

startButton.addEventListener("click", function () {
    stopTimer();

    selectedWorkout = workoutSelect.value;
    exercises = workouts[selectedWorkout].exercises;

    currentExercise = 0;
    currentSet = 1;
    seconds = REST_TIME;
    paused = false;
    workoutStarted = true;
    workoutFinished = false;
    historySavedForWorkout = false;
    completedSets = [];
    workoutStartTime = Date.now();
    workoutDuration = 0;

    showScreen(workoutScreen);
    showExercise();
});

function showScreen(screenToShow) {
    homeScreen.style.display = "none";
    workoutScreen.style.display = "none";
    restScreen.style.display = "none";
    summaryScreen.style.display = "none";
    measurementsScreen.style.display = "none";
    tabataScreen.style.display = "none";

    screenToShow.style.display = "block";
}
bodyMeasurementsButton.addEventListener("click", function () {
    showScreen(measurementsScreen);
});
tabataButton.addEventListener("click", function () {
    showScreen(tabataScreen);
    
});
tabataReturnButton.addEventListener("click", function () {
    showScreen(homeScreen);
});
measurementsHomeButton.addEventListener("click", function () {
    showScreen(homeScreen);
});

/* =========================
   VISUALIZZAZIONE ESERCIZIO
========================= */

function showExercise() {
    const exercise = exercises[currentExercise];

    if (!exercise) {
        finishWorkout();
        return;
    }

    exerciseName.textContent = exercise.name;
    exerciseProgress.textContent =
        "Esercizio " + (currentExercise + 1) +
        " di " + exercises.length;

    setNumber.textContent = currentSet + " / " + TOTAL_SETS;
    repsInput.value = exercise.reps;
    weightInput.value = exercise.weight === null ? "" : exercise.weight;

    weightInput.disabled = false;
    saveMessage.textContent = "";
    completeButton.disabled = false;
    saveExerciseButton.disabled = false;

    showScreen(workoutScreen);
}

/* =========================
   SALVA MODIFICHE
========================= */

saveExerciseButton.addEventListener("click", function () {
    if (!workoutStarted || workoutFinished) {
        return;
    }

    const reps = Number(repsInput.value);
    const weightText = weightInput.value.trim();
    const weight = weightText === "" ? null : Number(weightText);

    if (!Number.isInteger(reps) || reps < 1) {
        alert("Inserisci un numero di ripetizioni valido.");
        return;
    }

    if (
        weight !== null &&
        (!Number.isFinite(weight) || weight < 0)
    ) {
        alert("Inserisci un peso valido oppure lascia il campo vuoto.");
        return;
    }

    const exercise = exercises[currentExercise];
    exercise.reps = reps;
    exercise.weight = weight;

    if (saveWorkouts()) {
        saveMessage.textContent = "Modifiche salvate!";
    }
});

/* =========================
   COMPLETAMENTO SERIE
========================= */

completeButton.addEventListener("click", function () {
    if (!workoutStarted || workoutFinished) {
        return;
    }

    const reps = Number(repsInput.value);
    const weightText = weightInput.value.trim();
    const weight = weightText === "" ? null : Number(weightText);

    if (!Number.isInteger(reps) || reps < 1) {
        alert("Inserisci un numero di ripetizioni valido.");
        return;
    }

    if (
        weight !== null &&
        (!Number.isFinite(weight) || weight < 0)
    ) {
        alert("Inserisci un peso valido oppure lascia il campo vuoto.");
        return;
    }

    const exercise = exercises[currentExercise];

    // Memorizza i valori effettivamente usati nella serie.
    exercise.reps = reps;
    exercise.weight = weight;
    saveWorkouts();

    completedSets.push({
        exerciseName: exercise.name,
        setNumber: currentSet,
        reps: reps,
        weight: weight
    });

    completeButton.disabled = true;
    saveExerciseButton.disabled = true;

    startRest();
});

/* =========================
   CRONOMETRO RECUPERO
========================= */

function stopTimer() {
    if (countdown !== null) {
        clearInterval(countdown);
        countdown = null;
    }
}

function updateTimerDisplay() {
    timer.textContent = seconds;
}

function startTimer() {
    stopTimer();

    if (paused || workoutFinished || !workoutStarted) {
        return;
    }

    countdown = setInterval(function () {
        if (paused || !workoutStarted || workoutFinished) {
            stopTimer();
            return;
        }

        seconds--;

        if (seconds <= 0) {
            seconds = 0;
            updateTimerDisplay();
            stopTimer();
            advanceWorkout();
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function startRest() {
    stopTimer();

    seconds = REST_TIME;
    paused = false;

    updateTimerDisplay();

    restHeading.textContent = "RECUPERO";
    pauseButton.textContent = "PAUSA";
    nextExerciseText.textContent = getNextExerciseDescription();

    showScreen(restScreen);
    startTimer();
}

function getNextExerciseDescription() {
    if (currentSet < TOTAL_SETS) {
        return "Prossima: serie " +
            (currentSet + 1) +
            " di " +
            exercises[currentExercise].name;
    }

    if (currentExercise + 1 < exercises.length) {
        return "Prossimo esercizio: " +
            exercises[currentExercise + 1].name;
    }

    return "Ultima serie completata: preparati a terminare!";
}

pauseButton.addEventListener("click", function () {
    if (!workoutStarted || workoutFinished) {
        return;
    }

    if (paused) {
        paused = false;
        pauseButton.textContent = "PAUSA";
        startTimer();
    } else {
        paused = true;
        stopTimer();
        pauseButton.textContent = "RIPRENDI";
    }
});

resetButton.addEventListener("click", function () {
    if (!workoutStarted || workoutFinished) {
        return;
    }

    stopTimer();
    paused = false;
    pauseButton.textContent = "PAUSA";

    advanceWorkout();
});
/* =========================
   PASSA ALLA SERIE SUCCESSIVA
========================= */

function advanceWorkout() {
    if (workoutFinished) {
        return;
    }

    stopTimer();
    paused = false;

    // Verifica se è stata completata l'ultima serie
    // dell'ultimo esercizio.
    const ultimaSerie =
        currentSet >= TOTAL_SETS;

    const ultimoEsercizio =
        currentExercise >= exercises.length - 1;

    if (ultimaSerie && ultimoEsercizio) {
        finishWorkout();
        return;
    }

    // Passa alla serie o all'esercizio successivo.
    if (!ultimaSerie) {
        currentSet++;
    } else {
        currentSet = 1;
        currentExercise++;
    }

    showExercise();
}

/* =========================
   RIEPILOGO FINALE
========================= */

function showWorkoutSummary() {
    summaryWorkoutTitle.textContent = workouts[selectedWorkout].title;
    summaryStats.replaceChildren();
    summaryContent.replaceChildren();

    const totalSetsCompleted = completedSets.length;
    const totalReps = completedSets.reduce(function (total, set) {
        return total + set.reps;
    }, 0);

    const stats = [
        { label: "Esercizi", value: exercises.length },
        { label: "Serie completate", value: totalSetsCompleted },
        { label: "Ripetizioni totali", value: totalReps }
    ];

    stats.forEach(function (stat) {
        const card = document.createElement("div");
        card.className = "stat-card";

        const value = document.createElement("strong");
        value.textContent = stat.value;

        const label = document.createElement("span");
        label.textContent = stat.label;

        card.append(value, label);
        summaryStats.appendChild(card);
    });

    if (completedSets.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Non risultano serie completate.";
        summaryContent.appendChild(message);
    }

    completedSets.forEach(function (set) {
        const line = document.createElement("div");
        line.className = "summary-line";

        const name = document.createElement("strong");
        name.textContent = set.exerciseName;

        const details = document.createElement("p");
        let description =
            "Serie " + set.setNumber +
            " · " + set.reps + " ripetizioni";

        if (set.weight !== null) {
            description += " · " + set.weight + " kg";
        } else {
            description += " · Corpo libero";
        }

        details.textContent = description;
        line.append(name, details);
        summaryContent.appendChild(line);
    });

    showScreen(summaryScreen);
}

function finishWorkout() {
    if (workoutFinished) {
        return;
    }

    stopTimer();

    workoutDuration = workoutStartTime
        ? Math.max(
            0,
            Math.floor((Date.now() - workoutStartTime) / 1000)
        )
        : 0;

    workoutStarted = false;
    workoutFinished = true;
    paused = false;

    pauseButton.textContent = "PAUSA";

    try {
        if (!historySavedForWorkout) {
            saveWorkoutToHistory();
            historySavedForWorkout = true;
        }
    } catch (error) {
        console.error("Errore nel salvataggio dello storico:", error);
    } finally {
        showWorkoutSummary();
    }
}

/* =========================
   RITORNO ALL'INIZIO
========================= */

function returnHome() {
    stopTimer();

    workoutStarted = false;
    workoutFinished = false;
    paused = false;

    currentExercise = 0;
    currentSet = 1;
    seconds = REST_TIME;
    completedSets = [];

    selectedWorkout = workoutSelect.value;
    exercises = workouts[selectedWorkout].exercises;

    timer.textContent = REST_TIME;
    pauseButton.textContent = "PAUSA";
    completeButton.disabled = false;
    saveExerciseButton.disabled = false;

    showScreen(homeScreen);
    updateWorkoutDescription();
}

summaryHomeButton.addEventListener("click", returnHome);

cancelWorkoutButton.addEventListener("click", function () {
    const confirmed = confirm(
        "Vuoi terminare l'allenamento? La sessione incompleta non verrà salvata nello storico."
    );

    if (confirmed) {
        returnHome();
    }
});

/* =========================
   STORICO ALLENAMENTI
========================= */

function saveWorkoutToHistory() {
    const endTime = Date.now();

    workoutDuration = workoutStartTime
        ? Math.max(0, Math.floor((endTime - workoutStartTime) / 1000))
        : 0;

    const totalReps = completedSets.reduce(function (total, set) {
        return total + set.reps;
    }, 0);

    const entry = {
        id: Date.now(),
        date: new Date().toLocaleString("it-IT"),
        workoutKey: selectedWorkout,
        title: workouts[selectedWorkout].title,
        durationSeconds: workoutDuration,
        exerciseCount: new Set(
            completedSets.map(function (set) {
                return set.exerciseName;
            })
        ).size,
        completedSetCount: completedSets.length,
        totalReps: totalReps,
        completedSets: completedSets.map(function (set) {
            return { ...set };
        })
    };

    workoutHistory.unshift(entry);

    if (!saveJSON(HISTORY_KEY, workoutHistory)) {
        workoutHistory.shift();
        return false;
    }

    renderWorkoutHistory();
    return true;
}
function renderWorkoutHistory() {
    historyList.replaceChildren();

    historyEmpty.style.display =
        workoutHistory.length === 0 ? "block" : "none";

    workoutHistory.forEach(function (entry) {
        const card = document.createElement("article");
        card.className = "history-card";

        const title = document.createElement("h3");
        title.textContent = entry.title || "Allenamento";

        const date = document.createElement("p");
        date.textContent = entry.date || "Data non disponibile";

        const duration = document.createElement("p");
        const totalSeconds = entry.durationSeconds || 0;

        duration.textContent =
            "Durata: " +
            Math.floor(totalSeconds / 60) +
            " min " +
            (totalSeconds % 60) +
            " sec";

        const sets = entry.completedSets || [];

        const detailsSummary = document.createElement("p");
        detailsSummary.textContent =
            "Esercizi: " + (entry.exerciseCount || 0) +
            " | Serie: " + (entry.completedSetCount ?? sets.length) +
            " | Ripetizioni: " + (entry.totalReps || 0);

        const details = document.createElement("div");
        details.style.display = "none";

        sets.forEach(function (set) {
            const line = document.createElement("p");

            line.textContent =
                (set.exerciseName || "Esercizio") +
                " - Serie " + set.setNumber +
                " - " + set.reps + " ripetizioni - " +
                (set.weight === null
                    ? "Corpo libero"
                    : set.weight + " kg");

            details.appendChild(line);
        });

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "MOSTRA DETTAGLI";

        button.addEventListener("click", function () {
            const isHidden = details.style.display === "none";

            details.style.display = isHidden ? "block" : "none";
            button.textContent = isHidden
                ? "NASCONDI DETTAGLI"
                : "MOSTRA DETTAGLI";
        });

        card.append(
            title,
            date,
            duration,
            detailsSummary,
            button,
            details
        );

        historyList.appendChild(card);
    });
}
clearHistoryButton.addEventListener("click", function () {
    if (workoutHistory.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Vuoi cancellare tutto lo storico degli allenamenti?"
    );

    if (!confirmed) {
        return;
    }

    const previousHistory = workoutHistory;
    workoutHistory = [];

    if (saveJSON(HISTORY_KEY, workoutHistory)) {
        renderWorkoutHistory();
    } else {
        workoutHistory = previousHistory;
        renderWorkoutHistory();
    }
});

/* =========================
   INIZIALIZZAZIONE
========================= */

renderWorkoutHistory();

/* =========================
   PESO E GIROVITA - SALVATAGGIO
========================= */

function resetMeasurementForm() {
    editingMeasurementId = null;
    measurementDate.value = getLocalDateString();
    measurementWeight.value = "";
    measurementWaist.value = "";
    saveMeasurementButton.textContent = "SALVA MISURAZIONE";
    cancelMeasurementEditButton.style.display = "none";
    measurementMessage.textContent = "";
}

function getLocalDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

saveMeasurementButton.addEventListener("click", function () {
    const date = measurementDate.value;
    const weightText = measurementWeight.value.trim();
    const waistText = measurementWaist.value.trim();
    const weight = Number(weightText);
    const waist = Number(waistText);

    if (!date || !weightText || !waistText) {
        alert("Inserisci la data, il peso e il girovita.");
        return;
    }

    if (
        !Number.isFinite(weight) || weight <= 0 ||
        !Number.isFinite(waist) || waist <= 0
    ) {
        alert("Inserisci valori validi per peso e girovita.");
        return;
    }

    if (editingMeasurementId !== null) {
        const index = bodyMeasurements.findIndex(function (item) {
            return item.id === editingMeasurementId;
        });

        if (index === -1) {
            alert("Misurazione non trovata. Riprova.");
            resetMeasurementForm();
            return;
        }

        bodyMeasurements[index] = {
            ...bodyMeasurements[index],
            date: date,
            weight: weight,
            waist: waist
        };
    } else {
        bodyMeasurements.push({
            id: "measurement-" + Date.now() + "-" +
                Math.random().toString(36).slice(2, 8),
            date: date,
            weight: weight,
            waist: waist
        });
    }

    bodyMeasurements.sort(function (a, b) {
        return a.date.localeCompare(b.date) ||
            String(a.id).localeCompare(String(b.id));
    });

    if (!saveJSON(MEASUREMENTS_KEY, bodyMeasurements)) {
        bodyMeasurements = loadJSON(MEASUREMENTS_KEY, []);
        renderMeasurementHistory();
        return;
    }

    resetMeasurementForm();
    renderMeasurementHistory();
    measurementMessage.textContent = "Misurazione salvata correttamente!";
});

cancelMeasurementEditButton.addEventListener("click", function () {
    resetMeasurementForm();
});

measurementPeriod.addEventListener("change", function () {
    renderMeasurementCharts();
});
/* =========================
   STORICO MISURAZIONI
========================= */

function getSortedMeasurements() {
    return bodyMeasurements.slice().sort(function (a, b) {
        return a.date.localeCompare(b.date) ||
            String(a.id).localeCompare(String(b.id));
    });
}

function formatMeasurementDate(dateString) {
    const parts = dateString.split("-");
    return parts.length === 3
        ? parts[2] + "/" + parts[1] + "/" + parts[0]
        : dateString;
}

function formatChange(value, unit) {
    const sign = value > 0 ? "+" : "";
    return sign + value.toLocaleString("it-IT", {
        maximumFractionDigits: 2
    }) + " " + unit;
}

function renderMeasurementHistory() {
    measurementHistoryList.replaceChildren();

    const sorted = getSortedMeasurements();

    measurementHistoryEmpty.style.display =
        sorted.length === 0 ? "block" : "none";

    // Mostra prima le misurazioni più recenti.
    sorted.reverse().forEach(function (item) {
        const card = document.createElement("article");
        card.className = "measurement-history-card";

        const title = document.createElement("h3");
        title.textContent = formatMeasurementDate(item.date);

        const weight = document.createElement("p");
        weight.textContent = "Peso: " +
            Number(item.weight).toLocaleString("it-IT") + " kg";

        const waist = document.createElement("p");
        waist.textContent = "Girovita: " +
            Number(item.waist).toLocaleString("it-IT") + " cm";

        const actions = document.createElement("div");
        actions.className = "measurement-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "secondary-button";
        editButton.textContent = "MODIFICA";

        editButton.addEventListener("click", function () {
            editingMeasurementId = item.id;
            measurementDate.value = item.date;
            measurementWeight.value = item.weight;
            measurementWaist.value = item.waist;

            saveMeasurementButton.textContent = "SALVA MODIFICHE";
            cancelMeasurementEditButton.style.display = "block";
            measurementMessage.textContent =
                "Stai modificando la misurazione del " +
                formatMeasurementDate(item.date) + ".";

            showScreen(measurementsScreen);
            measurementDate.focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "text-button";
        deleteButton.textContent = "ELIMINA";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Vuoi eliminare la misurazione del " +
                formatMeasurementDate(item.date) + "?"
            );

            if (!confirmed) {
                return;
            }

            const previous = bodyMeasurements;
            bodyMeasurements = bodyMeasurements.filter(function (entry) {
                return entry.id !== item.id;
            });

            if (!saveJSON(MEASUREMENTS_KEY, bodyMeasurements)) {
                bodyMeasurements = previous;
                return;
            }

            if (editingMeasurementId === item.id) {
                resetMeasurementForm();
            }

            renderMeasurementHistory();
            renderMeasurementCharts();
        });

        actions.append(editButton, deleteButton);
        card.append(title, weight, waist, actions);
        measurementHistoryList.appendChild(card);
    });

    renderMeasurementStats();
    renderMeasurementCharts();
}

/* =========================
   CONFRONTO DELLE MISURAZIONI
========================= */

function renderMeasurementStats() {
    measurementStats.replaceChildren();

    const sorted = getSortedMeasurements();

    if (sorted.length === 0) {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent = "Registra una misurazione per vedere i confronti.";
        measurementStats.appendChild(message);
        return;
    }

    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    const previous = sorted.length > 1
        ? sorted[sorted.length - 2]
        : null;

    const card = document.createElement("div");
    card.className = "measurement-stat-card";

    const heading = document.createElement("h3");
    heading.textContent = "Il tuo progresso";

    const latestDate = document.createElement("p");
    latestDate.textContent = "Ultima misurazione: " +
        formatMeasurementDate(latest.date);

    const firstWeight = document.createElement("p");
    firstWeight.textContent = "Variazione peso dalla prima misurazione: " +
        formatChange(latest.weight - first.weight, "kg");

    const firstWaist = document.createElement("p");
    firstWaist.textContent = "Variazione girovita dalla prima misurazione: " +
        formatChange(latest.waist - first.waist, "cm");

    card.append(heading, latestDate, firstWeight, firstWaist);

    if (previous) {
        const previousHeading = document.createElement("h3");
        previousHeading.textContent = "Rispetto alla misurazione precedente";

        const previousWeight = document.createElement("p");
        previousWeight.textContent = "Peso: " +
            formatChange(latest.weight - previous.weight, "kg");

        const previousWaist = document.createElement("p");
        previousWaist.textContent = "Girovita: " +
            formatChange(latest.waist - previous.waist, "cm");

        card.append(previousHeading, previousWeight, previousWaist);
    } else {
        const note = document.createElement("p");
        note.textContent =
            "Aggiungi un'altra misurazione per confrontare i cambiamenti.";
        card.appendChild(note);
    }

    measurementStats.appendChild(card);
}

/* =========================
   GRAFICI PESO E GIROVITA
========================= */

function drawMeasurementChart(container, records, field, unit, title) {
    container.replaceChildren();

    if (records.length === 0) {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent =
            "Nessuna misurazione disponibile per questo periodo.";
        container.appendChild(message);
        return;
    }

    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");

    svg.setAttribute("viewBox", "0 0 320 190");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Grafico " + title);
    svg.classList.add("measurement-chart");

    function addSvgElement(tag, attributes, textContent) {
        const element = document.createElementNS(namespace, tag);

        Object.keys(attributes).forEach(function (key) {
            element.setAttribute(key, attributes[key]);
        });

        if (textContent !== undefined) {
            element.textContent = textContent;
        }

        svg.appendChild(element);
        return element;
    }

    const values = records.map(function (item) {
        return Number(item[field]);
    });

    let min = Math.min(...values);
    let max = Math.max(...values);

    // Evita un grafico piatto quando tutti i valori sono uguali.
    if (min === max) {
        min -= field === "weight" ? 0.5 : 1;
        max += field === "weight" ? 0.5 : 1;
    } else {
        const padding = (max - min) * 0.2;
        min -= padding;
        max += padding;
    }

    const left = 43;
    const right = 306;
    const top = 25;
    const bottom = 137;

    function xPosition(index) {
        return records.length === 1
            ? (left + right) / 2
            : left + index * (right - left) / (records.length - 1);
    }

    function yPosition(value) {
        return bottom - ((value - min) / (max - min)) * (bottom - top);
    }

    // Linee orizzontali e valori di riferimento.
    for (let i = 0; i <= 4; i++) {
        const y = top + i * (bottom - top) / 4;
        const value = max - i * (max - min) / 4;

        addSvgElement("line", {
            x1: left,
            y1: y,
            x2: right,
            y2: y,
            stroke: "#334155",
            "stroke-width": 1
        });

        addSvgElement("text", {
            x: left - 6,
            y: y + 4,
            fill: "#9ca3af",
            "font-size": 10,
            "text-anchor": "end"
        }, value.toLocaleString("it-IT", {
            maximumFractionDigits: 1
        }));
    }

    const points = records.map(function (item, index) {
        return xPosition(index) + "," + yPosition(Number(item[field]));
    }).join(" ");

    addSvgElement("polyline", {
        points: points,
        fill: "none",
        stroke: "#60a5fa",
        "stroke-width": 2.5,
        "stroke-linejoin": "round",
        "stroke-linecap": "round"
    });

    records.forEach(function (item, index) {
        const x = xPosition(index);
        const y = yPosition(Number(item[field]));

        addSvgElement("circle", {
            cx: x,
            cy: y,
            r: 4,
            fill: "#60a5fa",
            stroke: "#0f172a",
            "stroke-width": 1.5
        });

        // Etichetta della prima e dell'ultima data,
        // oppure di ogni punto se ci sono solo due misurazioni.
        if (
            index === 0 ||
            index === records.length - 1 ||
            records.length <= 3
        ) {
            addSvgElement("text", {
                x: x,
                y: 157,
                fill: "#cbd5e1",
                "font-size": 10,
                "text-anchor": "middle"
            }, formatMeasurementDate(item.date).slice(0, 5));
        }
    });

    const latest = records[records.length - 1];

    addSvgElement("text", {
        x: 160,
        y: 181,
        fill: "#f3f4f6",
        "font-size": 11,
        "text-anchor": "middle"
    }, "Ultimo valore: " +
        Number(latest[field]).toLocaleString("it-IT") + " " + unit);

    container.appendChild(svg);
}

function renderMeasurementCharts() {
    const sorted = getSortedMeasurements();
    const period = measurementPeriod.value;
    let filtered = sorted;

    if (period !== "all") {
        const days = Number(period);
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - days);

        const cutoffString =
            cutoff.getFullYear() + "-" +
            String(cutoff.getMonth() + 1).padStart(2, "0") + "-" +
            String(cutoff.getDate()).padStart(2, "0");

        filtered = sorted.filter(function (item) {
            return item.date >= cutoffString;
        });
    }

    drawMeasurementChart(
        weightChartContainer,
        filtered,
        "weight",
        "kg",
        "del peso"
    );

    drawMeasurementChart(
        waistChartContainer,
        filtered,
        "waist",
        "cm",
        "del girovita"
    );
}

/* =========================
   AVVIO DELLA SEZIONE
========================= */

bodyMeasurementsButton.addEventListener("click", function () {
    if (!measurementDate.value) {
        measurementDate.value = getLocalDateString();
    }

    renderMeasurementHistory();
});

resetMeasurementForm();
renderMeasurementHistory();
/* ===== AUDIO TABATA ===== */

let tabataAudioContext = null;

function tabataPlayBeep(frequency = 880, duration = 180) {
    try {
        if (!tabataSoundEnabled.checked) return;

        if (!tabataAudioContext) {
            tabataAudioContext = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        if (tabataAudioContext.state === "suspended") {
            tabataAudioContext.resume();
        }

        const oscillator = tabataAudioContext.createOscillator();
        const gain = tabataAudioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = 0.15;

        oscillator.connect(gain);
        gain.connect(tabataAudioContext.destination);

        oscillator.start();
        oscillator.stop(
            tabataAudioContext.currentTime + duration / 1000
        );
    } catch (error) {
        console.warn("Audio Tabata non disponibile:", error);
    }
}

function tabataSpeak(message) {
    try {
        if (!tabataVoiceEnabled.checked) return;
        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "it-IT";
        utterance.rate = 1;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.warn("Voce Tabata non disponibile:", error);
    }
}
/* ===== MY FITNESS - MOTORE BASE TABATA ===== */

let tabataTimerInterval = null;
let tabataSession = null;
let tabataPaused = false;
let tabataEndTime = 0;
let tabataRemainingMs = 0;

function tabataFormatTime(seconds) {
    const safeSeconds = Math.max(0, Math.ceil(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}

function tabataUpdateDisplay() {
    if (!tabataSession) return;

tabataPhase.textContent =
    tabataSession.phase === "RIPETIZIONI"
        ? "LAVORO"
        : tabataSession.phase;

if (tabataSession.phase === "RIPETIZIONI" &&
    tabataSession.mode === "circuit") {
    const exercise =
        tabataSession.exercises[tabataSession.exerciseIndex];

    tabataTimerDisplay.textContent =
        exercise ? exercise.reps + " rip." : "0 rip.";
} else {
    tabataTimerDisplay.textContent =
        tabataFormatTime(tabataRemainingMs / 1000);
}        if (tabataSession.phase === "PREPARATI") {
    tabataCountdown.style.display = "block";
    tabataCountdown.textContent =
        String(Math.max(1, Math.ceil(tabataRemainingMs / 1000)));
    tabataTimerDisplay.style.display = "none";
} else {
    tabataCountdown.style.display = "none";
    tabataTimerDisplay.style.display = "block";
}

    tabataProgress.textContent =
        "Round " + tabataSession.round + "/" + tabataSession.rounds +
        " · Blocco " + tabataSession.block + "/" + tabataSession.blocks;

if (tabataSession.mode === "circuit") {
    const exercise =
        tabataSession.exercises[tabataSession.exerciseIndex];

    tabataCurrentExercise.textContent =
        tabataSession.phase === "PREPARATI"
            ? "Preparati a iniziare"
            : exercise ? exercise.name : "Circuito completato";
} else {
    tabataCurrentExercise.textContent =
        tabataSession.phase === "PREPARATI"
            ? "Preparati a iniziare"
            : "Tabata classico";
}
}

function tabataStopInterval() {
    if (tabataTimerInterval !== null) {
        clearInterval(tabataTimerInterval);
        tabataTimerInterval = null;
    }
}

function tabataStartPhase(phase, seconds) {
    tabataStopInterval();

    tabataSession.phase = phase;
    tabataRemainingMs = seconds * 1000;
    tabataEndTime = Date.now() + tabataRemainingMs;

    tabataUpdateDisplay();
// Segnale sonoro e annuncio della nuova fase
    if (phase === "PREPARATI") {
        tabataPlayBeep(660, 150);
        tabataSpeak("Preparati");
    } else if (phase === "LAVORO") {
        tabataPlayBeep(1000, 250);
        tabataSpeak("Inizia il lavoro");
    } else if (phase === "RECUPERO") {
        tabataPlayBeep(500, 350);
        tabataSpeak("Recupero");
    } else if (phase === "RECUPERO BLOCCO") {
        tabataPlayBeep(500, 350);
        tabataSpeak("Recupero tra i blocchi");
    }
    if (seconds <= 0) {
        tabataAdvancePhase();
        return;
    }

    tabataTimerInterval = setInterval(function () {
        if (tabataPaused || !tabataSession) return;

        tabataRemainingMs = Math.max(0, tabataEndTime - Date.now());
        tabataUpdateDisplay();
        // Segnali negli ultimi 3 secondi della fase
        if (tabataFinalBeepsEnabled.checked) {
            const secondiRimasti = Math.ceil(tabataRemainingMs / 1000);

            if (
                secondiRimasti >= 1 &&
                secondiRimasti <= 3 &&
                tabataSession.lastBeepSecond !== secondiRimasti
            ) {
                tabataSession.lastBeepSecond = secondiRimasti;
                tabataPlayBeep(800, 100);
            }
        }

        if (tabataRemainingMs <= 0) {
            tabataAdvancePhase();
        }
    }, 100);
}

function tabataAdvancePhase() {
    if (!tabataSession) return;

    tabataStopInterval();

    // Fine del conto alla rovescia iniziale
    if (tabataSession.phase === "PREPARATI") {
        if (tabataSession.mode === "circuit") {
            tabataStartCircuitExercise();
        } else {
            tabataStartPhase("LAVORO", tabataSession.workSeconds);
        }
        return;
    }

    // Gestione specifica dei circuiti
    if (tabataSession.mode === "circuit") {
        if (tabataSession.phase === "LAVORO") {
            const exercise =
                tabataSession.exercises[tabataSession.exerciseIndex];

            if (exercise.restSeconds > 0) {
                tabataStartPhase("RECUPERO", exercise.restSeconds);
            } else {
                tabataAdvanceCircuitProgress();
            }
            return;
        }

        if (tabataSession.phase === "RECUPERO") {
            tabataAdvanceCircuitProgress();
            return;
        }

        if (tabataSession.phase === "RECUPERO BLOCCO") {
            tabataStartCircuitExercise();
            return;
        }

        return;
    }

    // Gestione esistente di Tabata e HIIT
    if (tabataSession.phase === "LAVORO") {
        if (tabataSession.round >= tabataSession.rounds &&
            tabataSession.block >= tabataSession.blocks) {
            tabataFinishSession();
            return;
        }

        if (tabataSession.round < tabataSession.rounds) {
            tabataStartPhase("RECUPERO", tabataSession.restSeconds);
            return;
        }

        tabataStartPhase(
            "RECUPERO BLOCCO",
            tabataSession.blockRestSeconds
        );
        return;
    }

    if (tabataSession.phase === "RECUPERO") {
        tabataSession.round++;

        if (tabataSession.round > tabataSession.rounds) {
            tabataSession.round = 1;
            tabataSession.block++;
        }

        tabataStartPhase("LAVORO", tabataSession.workSeconds);
        return;
    }

    if (tabataSession.phase === "RECUPERO BLOCCO") {
        tabataSession.block++;
        tabataSession.round = 1;
        tabataStartPhase("LAVORO", tabataSession.workSeconds);
    }
}

function tabataFinishSession() {
    tabataStopInterval();

    // Salva la sessione prima di azzerare i dati
    if (tabataSession) {
        const historyKey = "myFitnessTabataHistory";
        let history = [];

        try {
            history = JSON.parse(
                localStorage.getItem(historyKey) || "[]"
            );
            if (!Array.isArray(history)) history = [];
        } catch (error) {
            history = [];
        }

        const sessionRecord = {
            date: new Date().toLocaleString("it-IT"),
            mode: tabataSession.mode,
            status: "completato",
            exercises: tabataSession.mode === "circuit"
                ? tabataSession.exercises.map(function (exercise) {
                    return {
                        name: exercise.name,
                        type: exercise.type,
                        seconds: exercise.seconds || 0,
                        reps: exercise.reps || 0,
                        restSeconds: exercise.restSeconds || 0
                    };
                })
                : [],
            settings: {
                workSeconds: tabataSession.workSeconds || 0,
                restSeconds: tabataSession.restSeconds || 0,
                rounds: tabataSession.rounds || 0,
                blocks: tabataSession.blocks || 1
            }
        };

        history.unshift(sessionRecord);

        try {
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (error) {
            alert("Attenzione: non è stato possibile salvare lo storico Tabata.");
            console.error("Errore salvataggio storico Tabata:", error);
        }
    }

    tabataSession = null;
    tabataPaused = false;

    tabataSetupPanel.style.display = "block";
    tabataActivePanel.style.display = "none";

    alert("Allenamento Tabata completato!");
}

function tabataStartSession() {
    if (tabataSession) return;

    const mode = tabataModeSelect.value;

    if (mode === "circuit") {
        if (tabataCircuitExercises.length === 0) {
            alert("Aggiungi almeno un esercizio al circuito.");
            return;
        }

        tabataSession = {
            mode: "circuit",
            phase: "PREPARATI",
            exercises: tabataCircuitExercises.map(function (exercise) {
                return { ...exercise };
            }),
            exerciseIndex: 0,
            round: 1,
            rounds: Number(tabataRounds.value),
            block: 1,
            blocks: Number(tabataBlocks.value),
            blockRestSeconds: Number(tabataBlockRestSeconds.value)
        };

        if (!Number.isInteger(tabataSession.rounds) ||
            tabataSession.rounds < 1 ||
            !Number.isInteger(tabataSession.blocks) ||
            tabataSession.blocks < 1 ||
            !Number.isFinite(tabataSession.blockRestSeconds) ||
            tabataSession.blockRestSeconds < 0) {
            tabataSession = null;
            alert("Controlla round, blocchi e recupero tra i blocchi.");
            return;
        }

        tabataPaused = false;
        tabataSetupPanel.style.display = "none";
        tabataActivePanel.style.display = "block";

        tabataStartPhase("PREPARATI", 5);
        return;
    }

    const workSeconds = Number(tabataWorkSeconds.value);
    const restSeconds = Number(tabataRestSeconds.value);
    const rounds = Number(tabataRounds.value);
    const blocks = Number(tabataBlocks.value);
    const blockRestSeconds = Number(tabataBlockRestSeconds.value);

    if (!Number.isFinite(workSeconds) || workSeconds < 1 ||
        !Number.isFinite(restSeconds) || restSeconds < 0 ||
        !Number.isInteger(rounds) || rounds < 1 ||
        !Number.isInteger(blocks) || blocks < 1 ||
        !Number.isFinite(blockRestSeconds) || blockRestSeconds < 0) {
        alert("Controlla i valori inseriti nel timer.");
        return;
    }

    tabataSession = {
        mode: mode,
        phase: "PREPARATI",
        workSeconds: workSeconds,
        restSeconds: restSeconds,
        rounds: rounds,
        blocks: blocks,
        blockRestSeconds: blockRestSeconds,
        round: 1,
        block: 1
    };

    tabataPaused = false;
    tabataSetupPanel.style.display = "none";
    tabataActivePanel.style.display = "block";

    tabataStartPhase("PREPARATI", 5);
}

tabataStartButton.addEventListener("click", tabataStartSession);

tabataPauseButton.addEventListener("click", function () {
    if (!tabataSession) return;

    if (!tabataPaused) {
        if (tabataSession.phase !== "RIPETIZIONI") {
            tabataRemainingMs = Math.max(
                0,
                tabataEndTime - Date.now()
            );
            tabataStopInterval();
        }

        tabataPaused = true;
        tabataPauseButton.textContent = "RIPRENDI";
        tabataUpdateDisplay();
    } else {
        tabataPaused = false;
        tabataPauseButton.textContent = "PAUSA";

        if (tabataSession.phase !== "RIPETIZIONI") {
            tabataStartPhase(
                tabataSession.phase,
                tabataRemainingMs / 1000
            );
        } else {
            const exercise =
                tabataSession.exercises[tabataSession.exerciseIndex];

            if (exercise) {
                tabataTimerDisplay.textContent =
                    exercise.reps + " rip.";
            }
        }
    }
});

tabataSkipButton.addEventListener("click", function () {
    if (!tabataSession) return;
    tabataAdvancePhase();
});

tabataFinishButton.addEventListener("click", function () {
    if (!tabataSession) return;

    if (confirm("Vuoi terminare l'allenamento in corso?")) {
        tabataFinishSession();
    }
});
/* ===== SELEZIONE MODALITÀ TABATA / HIIT / CIRCUITO ===== */

const tabataIntervalSettings = document.getElementById("tabataIntervalSettings");
const tabataCircuitEditor = document.getElementById("tabataCircuitEditor");

function tabataUpdateModeFields() {
    const mode = tabataModeSelect.value;

    if (mode === "circuit") {
        tabataIntervalSettings.style.display = "none";
        tabataCircuitEditor.style.display = "block";
    } else {
        tabataIntervalSettings.style.display = "block";
        tabataCircuitEditor.style.display = "none";

        if (mode === "classic") {
            tabataWorkSeconds.value = 20;
            tabataRestSeconds.value = 10;
            tabataRounds.value = 8;
            tabataBlocks.value = 1;
            tabataBlockRestSeconds.value = 60;
        }
    }
}

tabataModeSelect.addEventListener("change", tabataUpdateModeFields);

tabataUpdateModeFields();
/* ===== EDITOR CIRCUITI PERSONALIZZATI ===== */

const tabataExerciseName = document.getElementById("tabataExerciseName");
const tabataExerciseType = document.getElementById("tabataExerciseType");
const tabataExerciseSeconds = document.getElementById("tabataExerciseSeconds");
const tabataExerciseReps = document.getElementById("tabataExerciseReps");
const tabataExerciseRestSeconds = document.getElementById("tabataExerciseRestSeconds");
const tabataExerciseTimeField = document.getElementById("tabataExerciseTimeField");
const tabataExerciseRepsField = document.getElementById("tabataExerciseRepsField");
const tabataAddExerciseButton = document.getElementById("tabataAddExerciseButton");
const tabataExerciseList = document.getElementById("tabataExerciseList");
const tabataSaveProtocolButton = document.getElementById("tabataSaveProtocolButton");
const tabataNewProtocolButton = document.getElementById("tabataNewProtocolButton");
const tabataDuplicateProtocolButton = document.getElementById("tabataDuplicateProtocolButton");
const tabataDeleteProtocolButton = document.getElementById("tabataDeleteProtocolButton");
const tabataProtocolName = document.getElementById("tabataProtocolName");
const tabataProtocolSelect = document.getElementById("tabataProtocolSelect");

let tabataCircuitExercises = [];

function tabataUpdateExerciseFields() {
    const type = tabataExerciseType.value;

    tabataExerciseTimeField.style.display =
        type === "time" ? "block" : "none";

    tabataExerciseRepsField.style.display =
        type === "reps" ? "block" : "none";
}

function tabataRenderCircuitExercises() {
    tabataExerciseList.innerHTML = "";

    if (tabataCircuitExercises.length === 0) {
        tabataExerciseList.textContent =
            "Nessun esercizio aggiunto al circuito.";
        return;
    }

    tabataCircuitExercises.forEach(function (exercise, index) {
        const item = document.createElement("div");
        const description = document.createElement("p");
        const removeButton = document.createElement("button");

        description.textContent =
            (index + 1) + ". " + exercise.name + " — " +
            (exercise.type === "time"
                ? exercise.seconds + " secondi"
                : exercise.reps + " ripetizioni") +
            " · Recupero " + exercise.restSeconds + " secondi";

        removeButton.type = "button";
        removeButton.textContent = "RIMUOVI";
        removeButton.addEventListener("click", function () {
            tabataCircuitExercises.splice(index, 1);
            tabataRenderCircuitExercises();
        });

        item.appendChild(description);
        item.appendChild(removeButton);
        tabataExerciseList.appendChild(item);
    });
}
/* ===== PROTOCOLLI TABATA PERSONALIZZATI ===== */

const tabataProtocolsStorageKey = "myFitnessTabataProtocols";

let tabataProtocols = [];
let tabataCurrentProtocolId = null;

// Carica i protocolli salvati
function tabataLoadProtocols() {
    try {
        const saved = localStorage.getItem(tabataProtocolsStorageKey);
        const parsed = saved ? JSON.parse(saved) : [];

        tabataProtocols = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Errore nel caricamento dei protocolli:", error);
        tabataProtocols = [];
    }

    tabataRenderProtocols();
}

// Salva i protocolli nel browser
function tabataPersistProtocols() {
    try {
        localStorage.setItem(
            tabataProtocolsStorageKey,
            JSON.stringify(tabataProtocols)
        );
        return true;
    } catch (error) {
        console.error("Errore nel salvataggio dei protocolli:", error);
        alert("Impossibile salvare i protocolli nel browser.");
        return false;
    }
}

// Aggiorna il menu dei protocolli salvati
function tabataRenderProtocols() {
    const selectedId = tabataCurrentProtocolId;

    tabataProtocolSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Nuovo allenamento";
    tabataProtocolSelect.appendChild(defaultOption);

    tabataProtocols.forEach(function (protocol) {
        const option = document.createElement("option");
        option.value = protocol.id;
        option.textContent = protocol.name;
        tabataProtocolSelect.appendChild(option);
    });

    tabataProtocolSelect.value = selectedId || "";
}

// Crea una copia delle impostazioni correnti
function tabataGetCurrentSettings() {
    return {
        mode: tabataModeSelect.value,
        workSeconds: Number(tabataWorkSeconds.value),
        restSeconds: Number(tabataRestSeconds.value),
        rounds: Number(tabataRounds.value),
        blocks: Number(tabataBlocks.value),
        blockRestSeconds: Number(tabataBlockRestSeconds.value),
        exercises: tabataCircuitExercises.map(function (exercise) {
            return {
                name: exercise.name,
                type: exercise.type,
                seconds: Number(exercise.seconds) || 0,
                reps: Number(exercise.reps) || 0,
                restSeconds: Number(exercise.restSeconds) || 0
            };
        })
    };
}

// Applica le impostazioni di un protocollo
function tabataApplySettings(protocol) {
    tabataModeSelect.value = protocol.mode || "classic";

    tabataWorkSeconds.value = protocol.workSeconds ?? 20;
    tabataRestSeconds.value = protocol.restSeconds ?? 10;
    tabataRounds.value = protocol.rounds ?? 8;
    tabataBlocks.value = protocol.blocks ?? 1;
    tabataBlockRestSeconds.value = protocol.blockRestSeconds ?? 60;

    tabataCircuitExercises = Array.isArray(protocol.exercises)
        ? protocol.exercises.map(function (exercise) {
            return {
                name: exercise.name || "Esercizio",
                type: exercise.type === "reps" ? "reps" : "time",
                seconds: Number(exercise.seconds) || 0,
                reps: Number(exercise.reps) || 0,
                restSeconds: Number(exercise.restSeconds) || 0
            };
        })
        : [];

    if (typeof tabataUpdateModeFields === "function") {
        tabataUpdateModeFields();
    }

    tabataUpdateExerciseFields();
    tabataRenderCircuitExercises();
}

// Seleziona e carica un protocollo dal menu
tabataProtocolSelect.addEventListener("change", function () {
    const id = tabataProtocolSelect.value;

    if (!id) {
        tabataCurrentProtocolId = null;
        tabataProtocolName.value = "";
        return;
    }

    const protocol = tabataProtocols.find(function (item) {
        return item.id === id;
    });

    if (!protocol) return;

    tabataCurrentProtocolId = protocol.id;
    tabataProtocolName.value = protocol.name;
    tabataApplySettings(protocol);
});

// Salva un nuovo protocollo oppure aggiorna quello selezionato
tabataSaveProtocolButton.addEventListener("click", function () {
    const name = tabataProtocolName.value.trim();

    if (!name) {
        alert("Inserisci un nome per il protocollo.");
        tabataProtocolName.focus();
        return;
    }

    const settings = tabataGetCurrentSettings();

    let protocol = tabataProtocols.find(function (item) {
        return item.id === tabataCurrentProtocolId;
    });

    if (protocol) {
        protocol.name = name;
        Object.assign(protocol, settings);
    } else {
        protocol = {
            id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8),
            name: name,
            ...settings
        };

        tabataProtocols.push(protocol);
        tabataCurrentProtocolId = protocol.id;
    }

    if (tabataPersistProtocols()) {
        tabataRenderProtocols();
        tabataProtocolSelect.value = tabataCurrentProtocolId;
        alert("Protocollo salvato correttamente.");
    }
});

// Prepara un allenamento nuovo
tabataNewProtocolButton.addEventListener("click", function () {
    tabataCurrentProtocolId = null;
    tabataProtocolSelect.value = "";
    tabataProtocolName.value = "";

    tabataModeSelect.value = "classic";
    tabataWorkSeconds.value = 20;
    tabataRestSeconds.value = 10;
    tabataRounds.value = 8;
    tabataBlocks.value = 1;
    tabataBlockRestSeconds.value = 60;

    tabataCircuitExercises = [];

    if (typeof tabataUpdateModeFields === "function") {
        tabataUpdateModeFields();
    }

    tabataUpdateExerciseFields();
    tabataRenderCircuitExercises();
});

// Duplica il protocollo selezionato
tabataDuplicateProtocolButton.addEventListener("click", function () {
    const current = tabataProtocols.find(function (item) {
        return item.id === tabataCurrentProtocolId;
    });

    if (!current) {
        alert("Seleziona prima un protocollo salvato da duplicare.");
        return;
    }

    const copy = JSON.parse(JSON.stringify(current));

    copy.id = String(Date.now()) + "-" + Math.random().toString(36).slice(2, 8);
    copy.name = current.name + " (copia)";

    tabataProtocols.push(copy);

    if (tabataPersistProtocols()) {
        tabataCurrentProtocolId = copy.id;
        tabataProtocolName.value = copy.name;
        tabataRenderProtocols();
        tabataProtocolSelect.value = copy.id;
        alert("Protocollo duplicato correttamente.");
    }
});

// Elimina il protocollo selezionato
tabataDeleteProtocolButton.addEventListener("click", function () {
    const index = tabataProtocols.findIndex(function (item) {
        return item.id === tabataCurrentProtocolId;
    });

    if (index === -1) {
        alert("Seleziona prima un protocollo da eliminare.");
        return;
    }

    const name = tabataProtocols[index].name;

    if (!confirm('Vuoi eliminare il protocollo "' + name + '"?')) {
        return;
    }

    const removed = tabataProtocols.splice(index, 1)[0];

    if (tabataPersistProtocols()) {
        tabataCurrentProtocolId = null;
        tabataProtocolName.value = "";
        tabataProtocolSelect.value = "";
        tabataRenderProtocols();
        alert("Protocollo eliminato.");
    } else {
        tabataProtocols.splice(index, 0, removed);
        tabataRenderProtocols();
        tabataProtocolSelect.value = removed.id;
    }
});

// Caricamento iniziale
tabataLoadProtocols();

tabataExerciseType.addEventListener("change", tabataUpdateExerciseFields);

tabataAddExerciseButton.addEventListener("click", function () {
    const name = tabataExerciseName.value.trim();
    const type = tabataExerciseType.value;
    const restSeconds = Number(tabataExerciseRestSeconds.value);
    const seconds = Number(tabataExerciseSeconds.value);
    const reps = Number(tabataExerciseReps.value);

    if (!name) {
        alert("Inserisci il nome dell'esercizio.");
        return;
    }

    if (!Number.isFinite(restSeconds) || restSeconds < 0) {
        alert("Inserisci un recupero valido.");
        return;
    }

    if (type === "time" &&
        (!Number.isFinite(seconds) || seconds < 1)) {
        alert("Inserisci una durata valida.");
        return;
    }

    if (type === "reps" &&
        (!Number.isInteger(reps) || reps < 1)) {
        alert("Inserisci un numero di ripetizioni valido.");
        return;
    }

    const exercise = {
        name: name,
        type: type,
        seconds: type === "time" ? seconds : 0,
        reps: type === "reps" ? reps : 0,
        restSeconds: restSeconds
    };

    tabataCircuitExercises.push(exercise);
    tabataExerciseName.value = "";

    tabataRenderCircuitExercises();
});

tabataUpdateExerciseFields();
tabataRenderCircuitExercises();
/* ===== AVANZAMENTO CIRCUITI ===== */

function tabataStartCircuitExercise() {
    if (!tabataSession || tabataSession.mode !== "circuit") return;

    const exercise =
        tabataSession.exercises[tabataSession.exerciseIndex];

    if (!exercise) {
        tabataFinishSession();
        return;
    }

    tabataExerciseDoneButton.style.display =
        exercise.type === "reps" ? "inline-block" : "none";

    if (exercise.type === "time") {
        tabataStartPhase("LAVORO", exercise.seconds);
        tabataCurrentExercise.textContent = exercise.name;
        tabataUpdateDisplay();
        tabataCurrentExercise.textContent = exercise.name;
    } else {
        tabataStopInterval();
        tabataSession.phase = "RIPETIZIONI";
        tabataRemainingMs = 0;

        tabataCountdown.style.display = "none";
        tabataTimerDisplay.style.display = "block";
        tabataTimerDisplay.textContent = exercise.reps + " rip.";
        tabataPhase.textContent = "LAVORO";
        tabataCurrentExercise.textContent = exercise.name;
        tabataProgress.textContent =
            "Round " + tabataSession.round + "/" + tabataSession.rounds +
            " · Blocco " + tabataSession.block + "/" + tabataSession.blocks;

        tabataExerciseDoneButton.style.display = "inline-block";
    }
}

function tabataAdvanceCircuitProgress() {
    if (!tabataSession || tabataSession.mode !== "circuit") return;

    tabataExerciseDoneButton.style.display = "none";
    tabataSession.exerciseIndex++;

    if (tabataSession.exerciseIndex <
        tabataSession.exercises.length) {
        tabataStartCircuitExercise();
        return;
    }

    // È terminato un giro completo del circuito
    tabataSession.exerciseIndex = 0;
    tabataSession.round++;

    if (tabataSession.round <= tabataSession.rounds) {
        tabataStartCircuitExercise();
        return;
    }

    // Sono terminati i round del blocco
    tabataSession.round = 1;
    tabataSession.block++;

    if (tabataSession.block > tabataSession.blocks) {
        tabataFinishSession();
        return;
    }

    if (tabataSession.blockRestSeconds > 0) {
        tabataStartPhase(
            "RECUPERO BLOCCO",
            tabataSession.blockRestSeconds
        );
    } else {
        tabataStartCircuitExercise();
    }
}

tabataExerciseDoneButton.addEventListener("click", function () {
    if (!tabataSession ||
        tabataSession.mode !== "circuit" ||
        tabataSession.phase !== "RIPETIZIONI") {
        return;
    }

    const exercise =
        tabataSession.exercises[tabataSession.exerciseIndex];

    if (exercise.restSeconds > 0) {
        tabataStartPhase("RECUPERO", exercise.restSeconds);
    } else {
        tabataAdvanceCircuitProgress();
    }
});
/* ===== STORICO SESSIONI TABATA ===== */

const tabataHistoryPanel = document.getElementById("tabataHistoryPanel");
const tabataHistoryEmpty = document.getElementById("tabataHistoryEmpty");
const tabataHistoryList = document.getElementById("tabataHistoryList");
const tabataClearHistoryButton = document.getElementById("tabataClearHistoryButton");

function tabataRenderHistory() {
    if (!tabataHistoryList) return;

    let history = [];

    try {
        history = JSON.parse(
            localStorage.getItem("myFitnessTabataHistory") || "[]"
        );
        if (!Array.isArray(history)) history = [];
    } catch (error) {
        history = [];
    }

    tabataHistoryList.innerHTML = "";

    if (tabataHistoryEmpty) {
        tabataHistoryEmpty.style.display =
            history.length === 0 ? "block" : "none";
    }

    history.forEach(function (session) {
        const item = document.createElement("div");
        const title = document.createElement("h3");
        const details = document.createElement("p");

        title.textContent =
            "Tabata " + (session.mode || "classico");

        const settings = session.settings || {};

const dettagli = [
    session.date || "Data non disponibile",
    session.status || "completato",
    "Round: " + (settings.rounds || 0),
    "Blocchi: " + (settings.blocks || 1),
    "Lavoro: " + (settings.workSeconds || 0) + " sec",
    "Recupero: " + (settings.restSeconds || 0) + " sec"
];

details.textContent = dettagli.join(" · ");

        item.appendChild(title);
        item.appendChild(details);

        if (session.exercises && session.exercises.length > 0) {
    const exerciseList = document.createElement("p");

    exerciseList.textContent =
        "Esercizi: " +
        session.exercises.map(function (exercise) {
            const nome = exercise.name || "Esercizio";

            const lavoro = exercise.type === "reps"
                ? (exercise.reps || 0) + " ripetizioni"
                : (exercise.seconds || 0) + " secondi";

            const recupero =
                "recupero " + (exercise.restSeconds || 0) + " sec";

            return nome + " (" + lavoro + ", " + recupero + ")";
        }).join(" · ");

    item.appendChild(exerciseList);
}

        tabataHistoryList.appendChild(item);
    });
}

if (tabataClearHistoryButton) {
    tabataClearHistoryButton.addEventListener("click", function () {
        if (!confirm("Vuoi cancellare tutto lo storico Tabata?")) return;

        localStorage.removeItem("myFitnessTabataHistory");
        tabataRenderHistory();
    });
}

tabataRenderHistory();