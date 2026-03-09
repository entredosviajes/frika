import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshExpiresIn
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $targetLanguage: String!
    $proficiencyLevel: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      targetLanguage: $targetLanguage
      proficiencyLevel: $proficiencyLevel
    ) {
      user {
        id
        username
        email
      }
    }
  }
`;
