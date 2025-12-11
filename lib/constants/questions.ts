/**
 * Pre-defined quiz questions
 * Each question has:
 * - question: The question text
 * - options: Array of possible answers
 * - correctAnswer: The correct answer (must match one of the options)
 * - timerSeconds: Time limit in seconds for answering
 */

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  timerSeconds: number;
}

export const QUESTIONS: Question[] = [
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    timerSeconds: 30,
  },
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    timerSeconds: 30,
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
    timerSeconds: 30,
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean",
    timerSeconds: 30,
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: "William Shakespeare",
    timerSeconds: 30,
  },
  {
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: "Au",
    timerSeconds: 30,
  },
  {
    question: "Which continent is the largest by land area?",
    options: ["Africa", "Asia", "North America", "Europe"],
    correctAnswer: "Asia",
    timerSeconds: 30,
  },
  {
    question: "What is the speed of light in vacuum (approximately)?",
    options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
    correctAnswer: "300,000 km/s",
    timerSeconds: 30,
  },
  {
    question: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: "JavaScript",
    timerSeconds: 30,
  },
  {
    question: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: "2",
    timerSeconds: 30,
  },
  {
    question: "Which gas makes up most of Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correctAnswer: "Nitrogen",
    timerSeconds: 30,
  },
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
    correctAnswer: "Tokyo",
    timerSeconds: 30,
  },
  {
    question: "Which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: "1945",
    timerSeconds: 30,
  },
  {
    question: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
    timerSeconds: 30,
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
    correctAnswer: "Hydrogen",
    timerSeconds: 30,
  },
];

/**
 * Get a random selection of at least 10 questions
 */
export function getRandomQuestions(minQuestions: number = 10): Question[] {
  if (QUESTIONS.length <= minQuestions) {
    return QUESTIONS;
  }
  
  // Shuffle array and take at least minQuestions
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(minQuestions, QUESTIONS.length));
}
