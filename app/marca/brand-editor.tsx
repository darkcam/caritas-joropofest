"use client";

import { useEffect, useRef, useState } from "react";
import { useBrandContext } from "../brand-provider";
import {
  BRAND_PRESETS,
  brandThemeToEnv,
  CARD_STYLE_LABELS,
  CARD_STYLES,
  type BrandColors,
  type BrandTheme,
  type CardStyle,
} from "../lib/brand";
import { CARD_HEIGHT, CARD_WIDTH, drawCardPlaceholder } from "../lib/card-render";

type BrandEditorProps = {
  initialTheme: BrandTheme;
  source: "env" | "supabase";
  storageAvailable: boolean;
  tokenRequired: boolean;
};

type TextField = {
  key: keyof Omit<BrandTheme, "colors" | "credit" | "cardStyle">;
  label: string;
  hint?: string;
  multiline?: boolean;
};

const TEXT_FIELDS: TextField[] = [
  { key: "id", label: "Identificador", hint: "Slug único del evento, ej. joropofest." },
  { key: "eventName", label: "Nombre del evento" },
  { key: "cardTitle", label: "Título en la card", hint: "Se dibuja en mayúsculas." },
  { key: "eventDateLabel", label: "Fecha en la card", hint: "Corto, ej. 29AGO26." },
  { key: "heroTitle", label: "Titular de la portada" },
  { key: "heroSubtitle", label: "Bajada de la portada", multiline: true },
  { key: "lockedTitle", label: "Titular antes del evento" },
  { key: "wallTitle", label: "Título del muro" },
  { key: "qrImage", label: "Imagen/QR del muro", hint: "Ruta pública, ej. /caritas-platzi.png." },
  { key: "downloadFileName", label: "Nombre del PNG descargado" },
  {
    key: "artStyleLabel",
    label: "Nombre del estilo en la interfaz",
    hint: "Aparece en los mensajes, ej. 16-bit o ilustrado.",
  },
  { key: "aiStyle", label: "Estilo para el prompt de IA", multiline: true },
  { key: "aiPalette", label: "Paleta para el prompt de IA", multiline: true },
];

const COLOR_FIELDS: { key: keyof BrandColors; label: string; hint: string }[] = [
  { key: "primary", label: "Color de marca", hint: "Acentos, bordes y textos destacados." },
  { key: "ink", label: "Color de fondo", hint: "Fondo de la app y de la card." },
  { key: "light", label: "Color claro", hint: "Luces del retrato y textos secundarios." },
  { key: "muted", label: "Color medio", hint: "Sombras suaves y fondos neutros." },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BrandEditor({ initialTheme, source, storageAvailable, tokenRequired }: BrandEditorProps) {
  const { setTheme } = useBrandContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draft, setDraft] = useState(initialTheme);
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    drawCardPlaceholder(context, draft);
  }, [draft]);

  const applyDraft = (next: BrandTheme) => {
    setDraft(next);
    setTheme(next);
  };

  const updateText = (key: TextField["key"], value: string) => {
    applyDraft({ ...draft, [key]: key === "id" ? slugify(value) : value });
  };

  const updateCardStyle = (value: CardStyle) => {
    applyDraft({ ...draft, cardStyle: value });
  };

  const updateColor = (key: keyof BrandColors, value: string) => {
    applyDraft({ ...draft, colors: { ...draft.colors, [key]: value } });
  };

  const updateCredit = (key: keyof BrandTheme["credit"], value: string) => {
    applyDraft({ ...draft, credit: { ...draft.credit, [key]: value } });
  };

  const applyPreset = (presetId: string) => {
    const preset = BRAND_PRESETS[presetId];

    if (preset) {
      applyDraft(preset);
      setMessage({ tone: "info", text: `Preset "${preset.eventName}" cargado. Recuerda guardar para publicarlo.` });
    }
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${draft.id || "brand"}-theme.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(brandThemeToEnv(draft));
      setMessage({ tone: "success", text: "Variables de entorno copiadas al portapapeles." });
    } catch {
      setMessage({ tone: "error", text: "No pude copiar al portapapeles." });
    }
  };

  const save = async () => {
    if (!draft.id) {
      setMessage({ tone: "error", text: "El identificador no puede quedar vacío." });
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch("/api/brand", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-brand-admin-token": token } : {}),
        },
        body: JSON.stringify({ theme: draft }),
      });
      const data = (await response.json()) as { theme?: BrandTheme; error?: string };

      if (!response.ok || !data.theme) {
        throw new Error(data.error ?? "No pude guardar el tema.");
      }

      setDraft(data.theme);
      setMessage({ tone: "success", text: "Tema publicado. Todos los dispositivos lo verán al recargar." });
    } catch (error) {
      setMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "No pude guardar el tema.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[var(--brand-ink)] text-white">
      <section className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <header className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              Gestión de marca
            </div>
            <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-[var(--brand-primary)] sm:text-5xl">
              Personaliza el evento
            </h1>
            <p className="max-w-xl text-sm leading-6 text-zinc-300">
              Cambia el estilo de la card, colores, textos y el prompt del retrato con IA. El tema activo se guarda en
              Supabase y aplica a la captura, la card y el muro.
            </p>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
              Fuente actual: {source === "supabase" ? "Supabase" : "variables de entorno"}
            </p>
          </header>

          {!storageAvailable && (
            <p className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Supabase no está configurado o falta la tabla `brand_themes`. Puedes previsualizar y exportar el tema,
              pero no publicarlo.
            </p>
          )}

          {message && (
            <p
              className={`rounded-2xl border px-4 py-3 text-sm ${
                message.tone === "error"
                  ? "border-red-400/40 bg-red-500/10 text-red-100"
                  : message.tone === "success"
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                    : "border-white/20 bg-white/[0.06] text-zinc-100"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Presets</span>
            {Object.entries(BRAND_PRESETS).map(([id, preset]) => (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
              >
                {preset.eventName}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Estilo de card</span>
            {CARD_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => updateCardStyle(style)}
                aria-pressed={draft.cardStyle === style}
                style={
                  draft.cardStyle === style
                    ? { backgroundColor: draft.colors.primary, color: draft.colors.ink }
                    : undefined
                }
                className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
              >
                {CARD_STYLE_LABELS[style]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{field.label}</span>
                <span className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.colors[field.key]}
                    onChange={(event) => updateColor(field.key, event.target.value)}
                    className="h-11 w-14 cursor-pointer rounded-lg border border-white/20 bg-transparent"
                    aria-label={field.label}
                  />
                  <input
                    type="text"
                    value={draft.colors[field.key]}
                    onChange={(event) => updateColor(field.key, event.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[var(--brand-primary)]"
                  />
                </span>
                <span className="text-[11px] leading-4 text-zinc-500">{field.hint}</span>
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TEXT_FIELDS.map((field) => (
              <label key={field.key} className={`flex flex-col gap-2 ${field.multiline ? "sm:col-span-2" : ""}`}>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    value={draft[field.key]}
                    onChange={(event) => updateText(field.key, event.target.value)}
                    rows={3}
                    className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-primary)]"
                  />
                ) : (
                  <input
                    type="text"
                    value={draft[field.key]}
                    onChange={(event) => updateText(field.key, event.target.value)}
                    className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-primary)]"
                  />
                )}
                {field.hint && <span className="text-[11px] leading-4 text-zinc-500">{field.hint}</span>}
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["name", "Crédito: nombre"],
                ["url", "Crédito: enlace"],
                ["message", "Crédito: mensaje"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">{label}</span>
                <input
                  type="text"
                  value={draft.credit[key]}
                  onChange={(event) => updateCredit(key, event.target.value)}
                  className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-primary)]"
                />
              </label>
            ))}
          </div>

          {tokenRequired && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Token de administración
              </span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="rounded-lg border border-white/20 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="text-[11px] leading-4 text-zinc-500">
                Debe coincidir con BRAND_ADMIN_TOKEN en el servidor.
              </span>
            </label>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={save}
              disabled={isSaving || !storageAvailable}
              style={{ backgroundColor: draft.colors.primary, color: draft.colors.ink }}
              className="rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Guardando..." : "Publicar tema"}
            </button>
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-xl border border-[var(--brand-primary)] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[var(--brand-primary)] transition hover:opacity-80"
            >
              Descargar JSON
            </button>
            <button
              type="button"
              onClick={copyEnv}
              className="rounded-xl border border-white/20 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/10"
            >
              Copiar .env
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl">
            <canvas ref={canvasRef} className="w-full rounded-[1.4rem]" />
            <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Vista previa de la card
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
