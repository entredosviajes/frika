import { gql } from "@apollo/client";

export const GET_MY_SUBMISSIONS = gql`
  query GetMySubmissions {
    mySubmissions {
      id
      recordedAt
      durationSeconds
      status
    }
  }
`;

export const GET_TODAY_SUBMISSION = gql`
  query GetTodaySubmission {
    todaySubmission {
      id
      recordedAt
      durationSeconds
      status
    }
  }
`;

export const GET_CONVERSATION_STARTERS = gql`
  query GetConversationStarters {
    conversationStarters
  }
`;

export const GET_SUBMISSION_ANALYSIS = gql`
  query GetSubmissionAnalysis($submissionId: ID!) {
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
