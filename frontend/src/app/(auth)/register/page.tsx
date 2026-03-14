"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { LANGUAGE_NAMES, type Locale } from "@/i18n/translations";

const SOURCE_LANGUAGES = ["en", "fr", "ar", "es"] as const;
const TARGET_LANGUAGES = ["en", "fr", "ar", "es", "it", "de"] as const;

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    targetLanguage: "en",
    sourceLanguage: "en",
  });
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const uiLocale = form.sourceLanguage as Locale;

  const labels = {
    en: {
      title: "Create your account",
      username: "Username",
      email: "Email",
      password: "Password",
      target: "What language are you learning?",
      source: "App language",
      failed: "Registration failed. Please try again.",
      creating: "Creating account...",
      create: "Create account",
      has: "Already have an account?",
      signIn: "Sign in",
    },
    fr: {
      title: "Créez votre compte",
      username: "Nom d'utilisateur",
      email: "E-mail",
      password: "Mot de passe",
      target: "Quelle langue apprenez-vous ?",
      source: "Langue de l'application",
      failed: "L'inscription a échoué. Veuillez réessayer.",
      creating: "Création du compte...",
      create: "Créer un compte",
      has: "Déjà un compte ?",
      signIn: "Se connecter",
    },
    ar: {
      title: "أنشئ حسابك",
      username: "اسم المستخدم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      target: "ما هي اللغة التي تتعلمها؟",
      source: "لغة التطبيق",
      failed: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
      creating: "جارٍ إنشاء الحساب...",
      create: "إنشاء حساب",
      has: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
    },
    es: {
      title: "Crea tu cuenta",
      username: "Nombre de usuario",
      email: "Correo electrónico",
      password: "Contraseña",
      target: "¿Qué idioma estás aprendiendo?",
      source: "Idioma de la aplicación",
      failed: "El registro falló. Por favor, inténtalo de nuevo.",
      creating: "Creando cuenta...",
      create: "Crear cuenta",
      has: "¿Ya tienes cuenta?",
      signIn: "Iniciar sesión",
    },
  };

  const l = labels[uiLocale] ?? labels.en;
  const dir = uiLocale === "ar" ? "rtl" : "ltr";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(
        form.username,
        form.email,
        form.password,
        form.targetLanguage,
        form.sourceLanguage,
      );
    } catch {
      setError(l.failed);
    }
  };

  return (
    <div dir={dir}>
      <Card>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{l.title}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {l.source}
            </label>
            <select
              value={form.sourceLanguage}
              onChange={(e) => update("sourceLanguage", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SOURCE_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_NAMES[code][uiLocale]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {l.username}
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {l.email}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {l.password}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {l.target}
            </label>
            <select
              value={form.targetLanguage}
              onChange={(e) => update("targetLanguage", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              {TARGET_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_NAMES[code][uiLocale]}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? l.creating : l.create}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {l.has}{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            {l.signIn}
          </Link>
        </p>
      </Card>
    </div>
  );
}
