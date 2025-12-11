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
];

