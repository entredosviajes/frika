import { gql } from "@apollo/client";

export const SUBMIT_EXERCISE_ANSWER = gql`
  mutation SubmitExerciseAnswer($exerciseId: ID!, $answer: String!) {
    submitExerciseAnswer(exerciseId: $exerciseId, answer: $answer) {
      exercise {
        id
        userAnswer
        feedback
        isCompleted
      }
    }
  }
`;
