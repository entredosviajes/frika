import { gql } from "@apollo/client";

export const GENERATE_PRESIGNED_URL = gql`
  mutation GeneratePresignedUrl($filename: String!, $contentType: String!) {
    generatePresignedUrl(filename: $filename, contentType: $contentType) {
      url
      key
    }
  }
`;

export const CREATE_SUBMISSION = gql`
  mutation CreateSubmission(
    $audioKey: String!
    $recordedAt: DateTime!
    $duration: Int
  ) {
    createSubmission(
      audioKey: $audioKey
      recordedAt: $recordedAt
      duration: $duration
    ) {
      submission {
        id
        status
      }
    }
  }
`;

export const RETRY_SUBMISSION = gql`
  mutation RetrySubmission($submissionId: ID!) {
    retrySubmission(submissionId: $submissionId) {
      submission {
        id
        status
      }
    }
  }
`;
