"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { LOGIN_MUTATION, REGISTER_MUTATION } from "@/graphql/mutations/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const apolloClient = useApolloClient();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] =
    useMutation(REGISTER_MUTATION);

  const login = useCallback(
    async (username: string, password: string) => {
      const { data } = await loginMutation({
        variables: { username, password },
      });
      const token = (data as any).tokenAuth.token;
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      router.push("/dashboard");
    },
    [loginMutation, router]
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      targetLanguage: string,
      sourceLanguage?: string,
    ) => {
      const { data } = await registerMutation({
        variables: { username, email, password, targetLanguage, sourceLanguage },
      });
      // Auto-login after registration
      const { data: loginData } = await loginMutation({
        variables: { username, password },
      });
      localStorage.setItem("token", (loginData as any).tokenAuth.token);
      setIsAuthenticated(true);
      router.push("/dashboard");
      return (data as any).register.user;
    },
    [registerMutation, loginMutation, router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    apolloClient.resetStore();
    router.push("/login");
  }, [apolloClient, router]);

  return {
    isAuthenticated,
    login,
    register,
    logout,
    loading: loginLoading || registerLoading,
  };
}
