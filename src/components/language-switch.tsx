import { Globe } from "@phosphor-icons/react";
import { useI18n, type Lang } from "@/lib/i18n";

export function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 ${compact ? "h-7" : "h-8"}`}
      role="group"
      aria-label={t("onboarding.langSwitch")}
    >
      <Globe size={14} className="ml-2 mr-1 text-muted-foreground" aria-hidden />
      {(["id", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={`Switch to ${l === "id" ? "Bahasa Indonesia" : "English"}`}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            lang === l
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          } ${compact ? "h-6" : "h-7"}`}
        >
          {l === "id" ? "ID" : "EN"}
        </button>
      ))}
    </div>
  );
}
