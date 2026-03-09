import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $targetLanguage: String
    $proficiencyLevel: String
    $timezone: String
  ) {
    updateProfile(
      targetLanguage: $targetLanguage
      proficiencyLevel: $proficiencyLevel
      timezone: $timezone
    ) {
      profile {
        targetLanguage
        proficiencyLevel
        timezone
      }
    }
  }
`;
