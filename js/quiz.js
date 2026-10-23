/**
 * Fazaia Inter College - Interactive MCQ Quiz Engine
 * Instant feedback, confetti on correct answers, results dashboard.
 */

(function () {
  "use strict";

  const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

  const MOTIVATION = [
    "Keep going - every attempt builds mastery!",
    "Close one! Review the tip and try the next.",
    "Mistakes are part of learning. You've got this!",
    "Stay focused - the next question is a fresh start.",
    "Aspiring for Excellence starts with persistence!",
  ];

  const BADGES = [
    { min: 90, label: "Excellence Star", tone: "gold", message: "Outstanding performance - true Fazaia spirit!" },
    { min: 75, label: "High Flyer", tone: "sky", message: "Strong command of the material. Keep soaring!" },
    { min: 50, label: "Rising Cadet", tone: "navy", message: "Solid progress. A little more practice will lift you higher." },
    { min: 0, label: "Keep Training", tone: "slate", message: "Every expert was once a beginner. Review and retry!" },
  ];

  /** @type {{ questions: object[], current: number, answers: (number|null)[], locked: boolean[], filterLabel: string, studentName: string }} */
  let state = createInitialState("all", 0, "");

  function allQuestions() {
    return Array.isArray(window.QUIZ_QUESTIONS) ? window.QUIZ_QUESTIONS : [];
  }

  function createInitialState(exerciseFilter, limit, studentName) {
    let questions = allQuestions().map((q) => ({ ...q }));
    let filterLabel = "All XI Mathematics exercises";
    const name = String(studentName ?? "").trim();

    if (exerciseFilter && exerciseFilter !== "all") {
      questions = questions.filter((q) => q.exercise === exerciseFilter);
      filterLabel = exerciseFilter;
    }

    if (limit && limit > 0 && questions.length > limit) {
      // Shuffle then take first `limit` for a mixed practice set
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      questions = questions.slice(0, limit);
      filterLabel += ` (${limit} random)`;
    }

    return {
      questions,
      current: 0,
      answers: questions.map(() => null),
      locked: questions.map(() => false),
      filterLabel,
      studentName: name,
    };
  }

  function readStudentName() {
    return String($("student-name")?.value || "").trim();
  }

  function requireStudentName() {
    const name = readStudentName();
    const err = $("student-name-error");
    const input = $("student-name");
    if (name.length < 2) {
      err?.classList.remove("hidden");
      input?.classList.add("border-flame");
      input?.focus();
      return null;
    }
    err?.classList.add("hidden");
    input?.classList.remove("border-flame");
    return name;
  }

  function getExercises() {
    const map = new Map();
    allQuestions().forEach((q) => {
      if (!map.has(q.exercise)) map.set(q.exercise, 0);
      map.set(q.exercise, map.get(q.exercise) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
  }

  function populateExerciseSelect() {
    const sel = $("quiz-exercise-select");
    if (!sel) return;
    const exercises = getExercises();
    sel.innerHTML =
      `<option value="all">All exercises (${allQuestions().length} MCQs)</option>` +
      exercises
        .map(([name, count]) => `<option value="${escapeHtml(name)}">${escapeHtml(name)} (${count})</option>`)
        .join("");
  }

  function $(id) {
    return document.getElementById(id);
  }

  function pickMotivation() {
    return MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
  }

  function getBadge(percent) {
    return BADGES.find((b) => percent >= b.min) || BADGES[BADGES.length - 1];
  }

  function fireConfetti() {
    if (typeof confetti !== "function") return;

    const defaults = {
      origin: { y: 0.65 },
      zIndex: 9999,
      colors: ["#00aeef", "#c9a227", "#e53935", "#10b981", "#ffffff"],
    };

    confetti({ ...defaults, particleCount: 80, spread: 55, scalar: 1.05 });
    confetti({ ...defaults, particleCount: 40, angle: 60, spread: 45, origin: { x: 0, y: 0.7 } });
    confetti({ ...defaults, particleCount: 40, angle: 120, spread: 45, origin: { x: 1, y: 0.7 } });
  }

  function updateProgress() {
    const total = state.questions.length;
    const answered = state.locked.filter(Boolean).length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    const bar = $("quiz-progress-bar");
    const label = $("quiz-progress-label");
    const counter = $("quiz-question-counter");

    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = `${answered} of ${total} answered`;
    if (counter) {
      counter.textContent = `Question ${Math.min(state.current + 1, total)} / ${total}`;
    }
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    const container = $("quiz-question-root");
    if (!container || !q) return;

    const answered = state.locked[state.current];
    const selected = state.answers[state.current];

    container.innerHTML = `
      <div class="animate-fade-up">
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center rounded-md bg-sky/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-sky-deep">
            ${escapeHtml(q.subject || "General")}
          </span>
          <span class="text-sm text-slate-500">ID: ${escapeHtml(String(q.id))}</span>
        </div>
        <h3 class="font-display text-xl leading-snug text-navy sm:text-2xl">
          ${escapeHtml(q.question)}
        </h3>
        <div class="mt-6 space-y-3" role="listbox" aria-label="Answer options" id="quiz-options">
          ${q.options
            .map((opt, i) => optionMarkup(q, i, opt, answered, selected))
            .join("")}
        </div>
        <div id="quiz-feedback" class="mt-5 min-h-[3.5rem]" aria-live="polite"></div>
      </div>
    `;

    if (answered) {
      showFeedback(q, selected === q.correctIndex, selected);
    }

    bindOptionClicks();
    updateNavButtons();
    updateProgress();
  }

  function optionMarkup(q, index, text, answered, selected) {
    let extra = "";
    if (answered) {
      if (index === q.correctIndex) {
        extra = selected === index ? "is-correct" : "is-revealed-correct";
      } else if (selected === index) {
        extra = "is-incorrect";
      }
    }

    const disabled = answered ? "disabled" : "";
    const label = OPTION_LABELS[index] || String(index + 1);

    return `
      <button
        type="button"
        class="quiz-option flex w-full items-start gap-3 rounded-lg border-2 border-slate-200 bg-white px-4 py-3.5 text-left text-base text-slate-800 ${extra}"
        data-option-index="${index}"
        ${disabled}
        aria-pressed="${selected === index}"
      >
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-navy/5 text-sm font-bold text-navy">
          ${label}
        </span>
        <span class="flex-1 pt-0.5">${escapeHtml(text)}</span>
      </button>
    `;
  }

  function bindOptionClicks() {
    const root = $("quiz-options");
    if (!root) return;

    root.querySelectorAll("[data-option-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (state.locked[state.current]) return;
        const index = Number(btn.getAttribute("data-option-index"));
        selectAnswer(index);
      });
    });
  }

  function selectAnswer(index) {
    const q = state.questions[state.current];
    if (!q || state.locked[state.current]) return;

    state.answers[state.current] = index;
    state.locked[state.current] = true;

    const isCorrect = index === q.correctIndex;
    const buttons = document.querySelectorAll("#quiz-options [data-option-index]");

    buttons.forEach((btn) => {
      const i = Number(btn.getAttribute("data-option-index"));
      btn.disabled = true;
      btn.setAttribute("aria-pressed", String(i === index));

      if (i === q.correctIndex) {
        btn.classList.add(i === index ? "is-correct" : "is-revealed-correct");
      } else if (i === index) {
        btn.classList.add("is-incorrect", "animate-shake");
      }
    });

    showFeedback(q, isCorrect, index);

    if (isCorrect) {
      fireConfetti();
    }

    updateProgress();
    updateNavButtons();
  }

  function showFeedback(q, isCorrect, selectedIndex) {
    const el = $("quiz-feedback");
    if (!el) return;

    if (isCorrect) {
      const tip = window.FazaiaSolutions?.buildCorrectHelp(q) || "";
      el.innerHTML = `
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <p class="font-semibold">Correct - well done${state.studentName ? `, ${escapeHtml(state.studentName)}` : ""}!</p>
          ${tip ? `<p class="mt-2 text-sm text-emerald-800"><span class="font-semibold">Solution:</span> ${escapeHtml(tip)}</p>` : ""}
        </div>
      `;
      return;
    }

    const correctText = q.options[q.correctIndex];
    const label = OPTION_LABELS[q.correctIndex] || String(q.correctIndex + 1);
    const help = window.FazaiaSolutions?.buildWrongAnswerHelp(q, selectedIndex) || {
      why: "That option is not correct for this question.",
      solution: `Correct option is ${label}: ${correctText}`,
    };

    el.innerHTML = `
      <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-red-950 space-y-3">
        <p class="font-semibold">Incorrect. Correct answer: ${label}) ${escapeHtml(correctText)}</p>
        <div class="rounded-md bg-white/70 px-3 py-2.5 border border-red-100">
          <p class="text-xs font-bold uppercase tracking-wide text-flame">Why this happened</p>
          <p class="mt-1 text-sm text-slate-800">${escapeHtml(help.why)}</p>
        </div>
        <div class="rounded-md bg-emerald-50 px-3 py-2.5 border border-emerald-200">
          <p class="text-xs font-bold uppercase tracking-wide text-emerald-700">Best solution</p>
          <p class="mt-1 text-sm text-emerald-900">${escapeHtml(help.solution)}</p>
        </div>
        <p class="text-sm text-red-800">${escapeHtml(pickMotivation())}</p>
      </div>
    `;
  }

  function updateNavButtons() {
    const prev = $("quiz-btn-prev");
    const next = $("quiz-btn-next");
    const finish = $("quiz-btn-finish");
    const atStart = state.current === 0;
    const atEnd = state.current >= state.questions.length - 1;
    const allAnswered = state.locked.every(Boolean);

    if (prev) prev.disabled = atStart;

    if (next) {
      next.classList.toggle("hidden", atEnd);
      next.disabled = !state.locked[state.current];
    }

    if (finish) {
      finish.classList.toggle("hidden", !atEnd);
      finish.disabled = !allAnswered;
    }
  }

  function goPrev() {
    if (state.current > 0) {
      state.current -= 1;
      renderQuestion();
    }
  }

  function goNext() {
    if (!state.locked[state.current]) return;
    if (state.current < state.questions.length - 1) {
      state.current += 1;
      renderQuestion();
    }
  }

  function computeResults() {
    let correct = 0;
    const breakdown = state.questions.map((q, i) => {
      const selected = state.answers[i];
      const ok = selected === q.correctIndex;
      if (ok) correct += 1;
      const help =
        !ok && selected != null
          ? window.FazaiaSolutions?.buildWrongAnswerHelp(q, selected)
          : null;
      return {
        id: q.id,
        subject: q.subject,
        question: q.question,
        selected,
        correctIndex: q.correctIndex,
        isCorrect: ok,
        selectedText: selected != null ? q.options[selected] : "-",
        correctText: q.options[q.correctIndex],
        why: help?.why || "",
        solution: help?.solution || "",
      };
    });

    const total = state.questions.length;
    const incorrect = total - correct;
    const percent = total ? Math.round((correct / total) * 100) : 0;

    return {
      studentName: state.studentName || "Student",
      correct,
      incorrect,
      total,
      percent,
      breakdown,
      badge: getBadge(percent),
    };
  }

  function renderResults() {
    const results = computeResults();
    const root = $("results-root");
    if (!root) return;

    const toneClass = {
      gold: "border-gold/40 bg-gold/10 text-navy",
      sky: "border-sky/40 bg-sky/10 text-navy",
      navy: "border-navy/20 bg-navy/5 text-navy",
      slate: "border-slate-200 bg-slate-50 text-slate-700",
    }[results.badge.tone];

    root.innerHTML = `
      <div class="animate-fade-up mx-auto max-w-3xl">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-navy/5">
          <div class="bg-campus-mesh px-6 py-8 text-center text-white sm:px-10">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky">Quiz Complete</p>
            <h2 class="font-display mt-2 text-3xl sm:text-4xl">${escapeHtml(results.studentName)}</h2>
            <p class="mt-2 text-lg text-gold-soft">Your score: ${results.correct} / ${results.total} (${results.percent}%)</p>
            <p class="mt-1 text-white/75">Fazaia Inter College - XI Mathematics</p>
          </div>

          <div class="grid gap-4 border-b border-slate-100 px-6 py-8 sm:grid-cols-3 sm:px-10">
            <div class="rounded-xl bg-mist px-4 py-5 text-center">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Score</p>
              <p class="mt-1 font-display text-3xl text-navy">${results.correct}<span class="text-lg text-slate-400">/${results.total}</span></p>
            </div>
            <div class="rounded-xl bg-mist px-4 py-5 text-center">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Percentage</p>
              <p class="mt-1 font-display text-3xl text-sky-deep">${results.percent}%</p>
            </div>
            <div class="rounded-xl bg-mist px-4 py-5 text-center">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Incorrect</p>
              <p class="mt-1 font-display text-3xl text-flame">${results.incorrect}</p>
            </div>
          </div>

          <div class="px-6 py-8 sm:px-10">
            <div class="animate-badge-pop mx-auto max-w-md rounded-xl border-2 px-6 py-5 text-center ${toneClass}">
              <p class="text-xs font-bold uppercase tracking-[0.18em]">Performance Badge</p>
              <p class="font-display mt-2 text-2xl">${escapeHtml(results.badge.label)}</p>
              <p class="mt-2 text-sm opacity-90">${escapeHtml(results.badge.message)}</p>
            </div>

            <div class="mt-8">
              <div class="mb-2 flex justify-between text-sm text-slate-600">
                <span>Accuracy for ${escapeHtml(results.studentName)}</span>
                <span class="font-semibold text-navy">${results.percent}%</span>
              </div>
              <div class="h-3 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-gradient-to-r from-sky to-sky-deep" style="width:${results.percent}%"></div>
              </div>
            </div>

            <h3 class="mt-10 font-display text-lg text-navy">Answer Breakdown</h3>
            <ul class="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
              ${results.breakdown
                .map(
                  (row, i) => `
                <li class="px-4 py-4">
                  <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-medium text-navy">
                        <span class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                          row.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        }">${row.isCorrect ? "✓" : "✗"}</span>
                        Q${i + 1}. ${escapeHtml(row.question)}
                      </p>
                      <p class="mt-1 text-xs text-slate-500">${escapeHtml(row.subject || "")}</p>
                    </div>
                    <div class="shrink-0 text-sm sm:text-right">
                      ${
                        row.isCorrect
                          ? `<span class="text-emerald-700">Your answer: ${escapeHtml(row.selectedText)}</span>`
                          : `<span class="block text-red-700">Yours: ${escapeHtml(row.selectedText)}</span>
                             <span class="block text-emerald-700">Correct: ${escapeHtml(row.correctText)}</span>`
                      }
                    </div>
                  </div>
                  ${
                    !row.isCorrect
                      ? `<div class="mt-3 space-y-2 rounded-lg bg-mist p-3 text-sm">
                          <p><span class="font-semibold text-flame">Why:</span> <span class="text-slate-700">${escapeHtml(row.why)}</span></p>
                          <p><span class="font-semibold text-emerald-700">Best solution:</span> <span class="text-slate-700">${escapeHtml(row.solution)}</span></p>
                        </div>`
                      : ""
                  }
                </li>`
                )
                .join("")}
            </ul>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button type="button" id="results-retry" class="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-mid">
                Retry Quiz
              </button>
              <button type="button" id="results-home" class="inline-flex items-center justify-center rounded-md border-2 border-navy/15 bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:border-sky hover:text-sky-deep">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    $("results-retry")?.addEventListener("click", () => {
      restartQuiz();
      if (!state.questions.length) {
        showSetup();
        return;
      }
      window.FazaiaApp?.showView("quiz");
    });

    $("results-home")?.addEventListener("click", () => {
      window.FazaiaApp?.showView("home");
    });

    if (results.percent >= 75 && typeof confetti === "function") {
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.4 },
          colors: ["#00aeef", "#c9a227", "#e53935"],
          zIndex: 9999,
        });
      }, 350);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function finishQuiz() {
    if (!state.locked.every(Boolean)) return;
    renderResults();
    window.FazaiaApp?.showView("results");
  }

  function restartQuiz() {
    const sel = $("quiz-exercise-select");
    const lim = $("quiz-limit-select");
    const exercise = sel?.value || "all";
    const limit = lim?.value === "all" ? 0 : Number(lim?.value || 0);
    const name = state.studentName || readStudentName();
    state = createInitialState(exercise, limit, name);
    renderQuestion();
    updateMeta();
  }

  function startQuiz(exerciseFilter, limit) {
    const name = requireStudentName();
    if (!name) {
      window.FazaiaApp?.showView("setup");
      return;
    }

    const sel = $("quiz-exercise-select");
    const lim = $("quiz-limit-select");
    const exercise = exerciseFilter || sel?.value || "all";
    const n = limit != null ? limit : lim?.value === "all" ? 0 : Number(lim?.value || 0);

    if (sel && exerciseFilter) sel.value = exerciseFilter;

    state = createInitialState(exercise, n, name);
    if (!state.questions.length) {
      alert("No questions found for this selection.");
      return;
    }
    try {
      localStorage.setItem("fazaia_student_name", name);
    } catch (_) {
      /* ignore */
    }
    updateMeta();
    renderQuestion();
    window.FazaiaApp?.showView("quiz");
  }

  function showSetup() {
    populateExerciseSelect();
    const input = $("student-name");
    if (input && !input.value) {
      try {
        const saved = localStorage.getItem("fazaia_student_name");
        if (saved) input.value = saved;
      } catch (_) {
        /* ignore */
      }
    }
    updateMeta();
    window.FazaiaApp?.showView("setup");
  }

  function updateMeta() {
    const title = $("quiz-title");
    const desc = $("quiz-desc");
    const studentLine = $("quiz-student-line");
    const meta = window.QUIZ_META || {};
    if (title) title.textContent = meta.title || "XI Mathematics Quiz";
    if (desc) {
      const extra = state.filterLabel ? ` | ${state.filterLabel}` : "";
      desc.textContent = (meta.description || "") + extra;
    }
    if (studentLine) {
      studentLine.textContent = state.studentName ? `Student: ${state.studentName}` : "";
    }
    const countEl = $("bank-count");
    if (countEl) countEl.textContent = String(allQuestions().length);
  }

  function init() {
    $("quiz-btn-prev")?.addEventListener("click", goPrev);
    $("quiz-btn-next")?.addEventListener("click", goNext);
    $("quiz-btn-finish")?.addEventListener("click", finishQuiz);
    $("quiz-setup-start")?.addEventListener("click", () => startQuiz());

    $("student-name")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startQuiz();
      }
    });
    $("student-name")?.addEventListener("input", () => {
      $("student-name-error")?.classList.add("hidden");
      $("student-name")?.classList.remove("border-flame");
    });

    document.querySelectorAll("[data-start-quiz]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showSetup();
      });
    });

    document.querySelectorAll("[data-start-exercise]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        startQuiz(el.getAttribute("data-start-exercise"), 0);
      });
    });

    populateExerciseSelect();
    updateMeta();
  }

  window.FazaiaQuiz = {
    init,
    start: showSetup,
    startQuiz,
    restart: restartQuiz,
    getExercises,
    getState: () => ({ ...state }),
  };

  document.addEventListener("DOMContentLoaded", init);
})();
