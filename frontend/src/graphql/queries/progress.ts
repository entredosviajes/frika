import { gql } from "@apollo/client";

export const GET_MY_WEAKNESSES = gql`
  query GetMyWeaknesses {
    myWeaknesses {
      id
      tagName
      errorCount
      lastOccurrence
      resolvedAt
    }
  }
`;

export const GET_MY_REPORTS = gql`
  query GetMyReports {
    myReports {
      id
      weekStart
      weekEnd
      totalSubmissions
      totalMistakes
      topWeaknesses
      streak
      summary
    }
  }
`;
