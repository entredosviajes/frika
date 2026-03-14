"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/translations";

const NAV_ITEMS: { href: string; labelKey: TranslationKey }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard" },
  { href: "/dashboard/settings", labelKey: "nav.settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t, dir } = useTranslation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-gray-50" dir={dir}>
      <aside className="w-56 border-r border-gray-200 bg-white px-4 py-6">
        <h2 className="mb-6 text-lg font-bold text-indigo-600">
          {t("app.name")}
        </h2>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-8 block w-full rounded-md px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100"
        >
          {t("nav.signOut")}
        </button>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
