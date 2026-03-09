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
    $questionId: ID!
    $audioKey: String!
    $recordedAt: DateTime!
    $duration: Int
  ) {
    createSubmission(
      questionId: $questionId
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
