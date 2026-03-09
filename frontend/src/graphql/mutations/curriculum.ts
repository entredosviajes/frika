import { gql } from "@apollo/client";

export const COMPLETE_EXERCISE = gql`
  mutation CompleteExercise($exerciseId: Int!) {
    completeExercise(exerciseId: $exerciseId) {
      exercise {
        id
        isCompleted
      }
    }
  }
`;

export const SUBMIT_EXAM_ANSWER = gql`
  mutation SubmitExamAnswer($examQuestionId: Int!, $answer: String!) {
    submitExamAnswer(examQuestionId: $examQuestionId, answer: $answer) {
      examQuestion {
        id
        userAnswer
        score
      }
    }
  }
`;
