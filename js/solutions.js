/**
 * Learning help for wrong answers: why it happened + best solution approach.
 * Uses per-question solution/whyWrong/explanation when available,
 * otherwise builds clear maths guidance from the topic.
 */
(function () {
  "use strict";

  const LABELS = ["A", "B", "C", "D", "E", "F"];

  function isSourceOnly(text) {
    if (!text) return true;
    return /^from\s+xi\s+fb/i.test(String(text).trim()) || /verify answer key/i.test(String(text));
  }

  function topicTip(subject) {
    const s = String(subject || "").toLowerCase();
    if (s.includes("complex")) {
      return "Recall: a complex number is x + yi with x, y real; i = √(-1). Use conjugate for division, |z| = √(x² + y²), and Argand plane (x along real axis, y along imaginary).";
    }
    if (s.includes("matrix") || s.includes("determinant")) {
      return "Recall: matrix order is rows × columns. AB needs columns of A = rows of B. |kA| = kⁿ|A| for n×n. Singular means |A| = 0. Inverse exists only if |A| ≠ 0.";
    }
    if (s.includes("vector")) {
      return "Recall: a·b = |a||b|cosθ (scalar). a×b is perpendicular to both. Scalar triple product a·(b×c) is volume; coplanar vectors give 0.";
    }
    if (s.includes("sequence") || s.includes("series")) {
      return "Recall: AP has common difference d, aₙ = a + (n-1)d. GP has common ratio r. HP reciprocals form an AP. Series means sum of terms (Σ).";
    }
    if (s.includes("algebra") || s.includes("polynomial")) {
      return "Recall: Remainder Theorem - when f(x) is divided by (x - a), remainder is f(a). Factor Theorem - (x - a) is a factor iff f(a) = 0. Degree of non-zero constant is 0; zero polynomial has no degree.";
    }
    return "Re-read the definition or formula this MCQ is testing, then eliminate options that break that rule.";
  }

  /**
   * @returns {{ why: string, solution: string }}
   */
  function buildWrongAnswerHelp(q, selectedIndex) {
    const correctLabel = LABELS[q.correctIndex] || String(q.correctIndex + 1);
    const wrongLabel = LABELS[selectedIndex] || String(selectedIndex + 1);
    const correctText = q.options[q.correctIndex];
    const wrongText = q.options[selectedIndex];

    let why =
      q.whyWrong ||
      `You selected option ${wrongLabel}: "${wrongText}". That choice does not satisfy the correct definition, formula, or calculation for this question, so it is marked incorrect.`;

    let solution = "";
    if (q.solution && String(q.solution).trim()) {
      solution = String(q.solution).trim();
    } else if (q.explanation && !isSourceOnly(q.explanation)) {
      solution = String(q.explanation).trim();
    } else {
      solution =
        `Best answer is option ${correctLabel}: "${correctText}". ` +
        `Work step-by-step using the related formula or definition, then match your result to the options. ` +
        topicTip(q.subject);
    }

    return { why, solution };
  }

  function buildCorrectHelp(q) {
    if (q.solution && String(q.solution).trim()) return String(q.solution).trim();
    if (q.explanation && !isSourceOnly(q.explanation)) return String(q.explanation).trim();
    const label = LABELS[q.correctIndex] || String(q.correctIndex + 1);
    return `Option ${label} is correct. ${topicTip(q.subject)}`;
  }

  window.FazaiaSolutions = {
    buildWrongAnswerHelp,
    buildCorrectHelp,
    topicTip,
  };
})();
