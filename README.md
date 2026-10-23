# Fazaia Inter College - XI Mathematics MCQ Portal

Interactive practice website for **Class XI Mathematics** MCQs (Federal Board style exercises 1.1 to 5.3).

## Features

- Student enters **name** before the test (shown on quiz and final result card)
- Instant feedback (green + confetti on correct; red + correct answer on wrong)
- On wrong answers: **Why this happened** + **Best solution** explanation
- Results dashboard with student name, score, percentage, breakdown, badge
- Exercise filter and question limit on the setup screen
- Fully responsive (mobile and desktop)
- Fazaia brand colours (navy, sky blue, gold, flame red)

## How to open

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. Click **Start Maths Quiz**.
3. Enter your **name**, choose an exercise (or all) and how many questions.
4. Click **Begin Quiz**.
5. At the end, your name and score appear on the result card.

No install or build step is required. Tailwind CSS and canvas-confetti load from CDN.

## Project structure

```
fazaia/
  index.html          Main page (home, setup, quiz, results, about)
  css/styles.css      Brand styles and animations
  js/questions.js     Maths MCQ bank (edit answers here)
  js/solutions.js     Why-wrong + best-solution helper
  js/quiz.js          Quiz engine
  js/app.js           Navigation and page views
  assets/             Logo and images
  scripts/            Tools to re-extract MCQs from Word files
  README.md           This file
```

## Question bank

All MCQs live in `js/questions.js` as `QUIZ_QUESTIONS`.

Each question looks like:

```js
{
  id: 1,
  subject: "XI Maths - Ex 1.1 - Complex Numbers",
  exercise: "XI FB EX1.1",
  question: "Your question text?",
  options: ["A text", "B text", "C text", "D text"],
  correctIndex: 1,   // 0 = A, 1 = B, 2 = C, 3 = D
  explanation: "Optional tip",
  whyWrong: "Optional: why a common mistake is wrong",
  solution: "Optional: step-by-step best solution"
}
```

To fix an answer, change `correctIndex` only. Optional `solution` / `whyWrong` improve the learning feedback.

## Re-extract from Word files

If you update the `.docx` exercise files in this folder:

```bash
python scripts/extract_mcqs.py
```

This regenerates `js/questions.js` and `js/questions.json`.

## Tech stack

- HTML5
- Tailwind CSS (CDN)
- JavaScript (ES6+)
- [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

## Brand

- Motto: Aspiring for Excellence
- Colours: Navy `#0b1c33`, Sky `#00aeef`, Gold `#c9a227`, Flame `#e53935`
