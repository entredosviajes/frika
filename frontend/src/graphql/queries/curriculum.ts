import { gql } from "@apollo/client";

export const GET_MY_EXERCISES = gql`
  query GetMyExercises($pendingOnly: Boolean, $submissionId: ID) {
    myExercises(pendingOnly: $pendingOnly, submissionId: $submissionId) {
      id
      type
      content
      userAnswer
      feedback
      isCompleted
      mistake {
        id
        originalText
        correction
        explanation
        category
        severity
      }
    }
  }
`;
