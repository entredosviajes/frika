import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($targetLanguage: String, $timezone: String) {
    updateProfile(targetLanguage: $targetLanguage, timezone: $timezone) {
      profile {
        targetLanguage
        timezone
      }
    }
  }
`;
