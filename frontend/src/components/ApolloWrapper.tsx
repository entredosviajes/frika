"use client";

import { ApolloProvider } from "@apollo/client/react";
import client from "@/lib/apolloClient";
import { I18nProvider } from "@/i18n/I18nProvider";

export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
      <I18nProvider>{children}</I18nProvider>
    </ApolloProvider>
  );
}
