import { gql } from "@apollo/client";

export const COMPLETE_EXERCISE = gql`
  mutation CompleteExercise($exerciseId: ID!) {
    completeExercise(exerciseId: $exerciseId) {
      exercise {
        id
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
