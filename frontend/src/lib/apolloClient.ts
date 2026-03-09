import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client/core";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql",
});

const authLink = new SetContextLink((prevContext) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `JWT ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          myExercises: { merge: false },
          mySubmissions: { merge: false },
          myWeaknesses: { merge: false },
          myReports: { merge: false },
        },
      },
    },
  }),
});

export default client;
