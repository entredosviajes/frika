import { gql } from "@apollo/client";

export const CREATE_TOPIC = gql`
  mutation CreateTopic($name: String!, $description: String) {
    createTopic(name: $name, description: $description) {
      topic {
        id
        name
        description
        questionCount
      }
    }
  }
`;

export const DELETE_TOPIC = gql`
  mutation DeleteTopic($topicId: ID!) {
    deleteTopic(topicId: $topicId) {
      ok
    }
  }
`;

export const CREATE_QUESTION = gql`
  mutation CreateQuestion($topicId: ID!, $text: String!, $proficiencyLevel: String) {
    createQuestion(topicId: $topicId, text: $text, proficiencyLevel: $proficiencyLevel) {
      question {
        id
        text
        proficiencyLevel
      }
    }
  }
`;
