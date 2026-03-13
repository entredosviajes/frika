import { gql } from "@apollo/client";

export const SUBMIT_EXERCISE_ANSWER = gql`
  mutation SubmitExerciseAnswer($exerciseId: ID!, $answer: String!) {
    submitExerciseAnswer(exerciseId: $exerciseId, answer: $answer) {
      exercise {
        id
        userAnswer
        content
        isCompleted
      }
    }
  }
`;

export const SUBMIT_EXAM_ANSWER = gql`
  mutation SubmitExamAnswer($examQuestionId: ID!, $answer: String!) {
    submitExamAnswer(examQuestionId: $examQuestionId, answer: $answer) {
      examQuestion {
        id
        userAnswer
        score
      }
    }
  }
`;
