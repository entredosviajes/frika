import { gql } from "@apollo/client";

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($targetLanguage: String, $sourceLanguage: String, $timezone: String) {
    updateProfile(targetLanguage: $targetLanguage, sourceLanguage: $sourceLanguage, timezone: $timezone) {
      profile {
        targetLanguage
        sourceLanguage
        timezone
      }
    }
  }
`;
