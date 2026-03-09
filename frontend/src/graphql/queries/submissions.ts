import { gql } from "@apollo/client";

export const GET_MY_SUBMISSIONS = gql`
  query GetMySubmissions {
    mySubmissions {
      id
      question {
        text
        topic {
          name
        }
      }
      recordedAt
      duration
      status
    }
  }
`;

export const GET_SUBMISSION_ANALYSIS = gql`
  query GetSubmissionAnalysis($submissionId: Int!) {
    submissionAnalysis(submissionId: $submissionId) {
      id
      rawTranscript
      rewrittenVersion
      generalFeedback
      mistakes {
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
