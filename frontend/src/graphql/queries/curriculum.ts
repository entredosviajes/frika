import { gql } from "@apollo/client";

export const GET_TOPICS = gql`
  query GetTopics {
    topics {
      id
      name
      description
      questionCount
    }
  }
`;

export const GET_QUESTIONS = gql`
  query GetQuestions($topicId: ID!) {
    questions(topicId: $topicId) {
      id
      text
      topic {
        name
      }
      proficiencyLevel
    }
  }
`;

export const GET_MY_EXERCISES = gql`
  query GetMyExercises($pendingOnly: Boolean) {
    myExercises(pendingOnly: $pendingOnly) {
      id
      type
      content
      isCompleted
    }
  }
`;

export const GET_MY_EXAMS = gql`
  query GetMyExams {
    myExams {
      id
      startDate
      endDate
      score
    }
  }
`;

export const GET_EXAM = gql`
  query GetExam($examId: ID!) {
    exam(examId: $examId) {
      id
      startDate
      endDate
      score
      examquestionSet {
        id
        question {
          text
        }
        userAnswer
        score
        order
      }
    }
  }
`;
