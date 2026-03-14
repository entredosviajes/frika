"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ME_QUERY } from "@/graphql/queries/auth";
import { UPDATE_PROFILE } from "@/graphql/mutations/profile";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n/I18nProvider";
import { LANGUAGE_NAMES, type Locale } from "@/i18n/translations";

const SOURCE_LANGUAGES = ["en", "fr", "ar", "es"] as const;
const TARGET_LANGUAGES = ["en", "fr", "ar", "es", "it", "de"] as const;

export default function SettingsPage() {
  const { t, locale } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>(ME_QUERY);
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE, {
    refetchQueries: [{ query: ME_QUERY }],
  });

  const profile = data?.me?.profile;

  const [targetLanguage, setTargetLanguage] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setTargetLanguage(profile.targetLanguage?.toLowerCase() ?? "en");
      setSourceLanguage(profile.sourceLanguage?.toLowerCase() ?? "en");
    }
  }, [profile]);

  const hasChanges =
    profile &&
    (targetLanguage !== (profile.targetLanguage?.toLowerCase() ?? "en") ||
      sourceLanguage !== (profile.sourceLanguage?.toLowerCase() ?? "en"));

  const handleSave = async () => {
    setSaved(false);
    await updateProfile({
      variables: { targetLanguage, sourceLanguage },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>

      <Card>
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("settings.sourceLanguage")}
            </label>
            <select
              value={sourceLanguage}
              onChange={(e) => {
                setSourceLanguage(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SOURCE_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_NAMES[code][locale]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("settings.targetLanguage")}
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => {
                setTargetLanguage(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {TARGET_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {LANGUAGE_NAMES[code][locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? t("settings.saving") : t("settings.save")}
          </Button>
          {saved && (
            <span className="text-sm text-green-600">{t("settings.saved")}</span>
          )}
        </div>
      </Card>
    </div>
  );
}
