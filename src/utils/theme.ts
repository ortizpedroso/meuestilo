/**
 * White-label: aplica a cor de destaque do salão sobrescrevendo, em tempo de
 * execução, as variáveis de cor "amber" do Tailwind v4 (--color-amber-*),
 * que são as usadas nos botões, destaques e ícones do app.
 */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').trim();
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16)
  ];
}

function mix([r, g, b]: [number, number, number], target: number, ratio: number): string {
  const c = (v: number) => Math.round(v + (target - v) * ratio);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(c(r))}${toHex(c(g))}${toHex(c(b))}`;
}

// Base é tratada como o tom 600 (usado nos CTAs). Gera a rampa completa.
const RAMP: Record<number, { target: number; ratio: number }> = {
  50: { target: 255, ratio: 0.92 },
  100: { target: 255, ratio: 0.84 },
  200: { target: 255, ratio: 0.68 },
  300: { target: 255, ratio: 0.5 },
  400: { target: 255, ratio: 0.28 },
  500: { target: 255, ratio: 0.12 },
  600: { target: 0, ratio: 0 },
  700: { target: 0, ratio: 0.14 },
  800: { target: 0, ratio: 0.3 },
  900: { target: 0, ratio: 0.42 }
};

const DEFAULT_COLOR = '#d97706'; // amber-600

export function applyBrandTheme(color?: string): void {
  const rgb = hexToRgb(color || DEFAULT_COLOR) || hexToRgb(DEFAULT_COLOR)!;
  const root = document.documentElement;
  Object.entries(RAMP).forEach(([shade, { target, ratio }]) => {
    root.style.setProperty(`--color-amber-${shade}`, mix(rgb, target, ratio));
  });
}
