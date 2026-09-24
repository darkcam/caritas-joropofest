import Image from "next/image";
import BrandFooter from "../brand-footer";
import { getBrandTheme } from "../lib/brand-store";
import {
  getSupabaseBrowserConfig,
  listWallImages,
  shuffleWallImages,
  SupabaseWallConfigError,
  type SupabaseBrowserConfig,
  type WallImageRecord,
} from "../lib/wall";
import WallRealtime from "./wall-realtime";

export const dynamic = "force-dynamic";

type WallPageState =
  | {
      configured: true;
      images: WallImageRecord[];
      supabaseConfig: SupabaseBrowserConfig | null;
    }
  | {
      configured: false;
      images: [];
      supabaseConfig: null;
    };

async function getWallPageState(): Promise<WallPageState> {
  try {
    return {
      configured: true,
      images: shuffleWallImages(await listWallImages()),
      supabaseConfig: getSupabaseBrowserConfig(),
    };
  } catch (error) {
    if (error instanceof SupabaseWallConfigError) {
      return {
        configured: false,
        images: [],
        supabaseConfig: null,
      };
    }

    throw error;
  }
}

export default async function MuroPage() {
  const [state, theme] = await Promise.all([getWallPageState(), getBrandTheme()]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[var(--brand-ink)] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at top left, ${theme.colors.primary}2e, transparent 34%), radial-gradient(circle at bottom right, rgba(255,255,255,0.08), transparent 30%)`,
        }}
      />

      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-6 p-5 pb-20 sm:p-8 sm:pb-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${theme.colors.ink}eb, ${theme.colors.ink}8c, transparent)`,
        }}
      >
        <h1
          className="max-w-[calc(100%-8rem)] text-4xl font-black uppercase leading-[0.98] tracking-[0.08em] text-[var(--brand-primary)] [font-variant-ligatures:none] sm:max-w-[calc(100%-11rem)] sm:text-6xl lg:text-7xl"
          style={{
            fontFamily:
              "'Courier New', Courier, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
            textShadow: `4px 4px 0 ${theme.colors.ink}`,
          }}
        >
          {theme.wallTitle}
        </h1>
        <div className="shrink-0 bg-white p-2 shadow-[0_18px_55px_rgba(0,0,0,0.55)] sm:p-3">
          <Image
            src={theme.qrImage}
            alt="QR para generar tu imagen"
            width={144}
            height={144}
            priority
            className="h-24 w-24 object-contain sm:h-36 sm:w-36"
          />
        </div>
      </header>

      <WallRealtime
        configured={state.configured}
        initialImages={state.images}
        supabaseConfig={state.supabaseConfig}
      />
      <BrandFooter className="pointer-events-auto absolute inset-x-0 bottom-0 z-50 bg-black/45 backdrop-blur-sm" />
    </main>
  );
}
