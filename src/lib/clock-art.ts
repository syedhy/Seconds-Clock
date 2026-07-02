import type { FormattedClockTime } from "./time";

type ClockArtOptions = {
  time: FormattedClockTime;
  date: string;
};

const escapeSvgText = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function renderFlapCard(value: string, x: number, label: string): string {
  const safeValue = escapeSvgText(value);

  return `
    <g transform="translate(${x} 196)">
      <rect x="0" y="0" width="300" height="250" rx="34" fill="url(#cardGradient)" filter="url(#cardShadow)" />
      <rect x="12" y="12" width="276" height="226" rx="26" fill="none" stroke="rgba(255,255,255,0.08)" />
      <path d="M0 125H300" stroke="rgba(0,0,0,0.55)" stroke-width="5" />
      <path d="M20 128H280" stroke="rgba(255,255,255,0.055)" stroke-width="2" />
      <text x="150" y="165" text-anchor="middle" fill="#F6F1E8" font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif" font-size="134" font-weight="800" letter-spacing="5">${safeValue}</text>
      <text x="150" y="296" text-anchor="middle" fill="#888A8F" font-family="SF Pro Text, -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="4">${label}</text>
    </g>`;
}

function renderColon(x: number): string {
  return `
    <g transform="translate(${x} 282)">
      <circle cx="0" cy="0" r="14" fill="#F6F1E8" opacity="0.95" />
      <circle cx="0" cy="78" r="14" fill="#F6F1E8" opacity="0.95" />
    </g>`;
}

export function renderClockSvg({ time, date }: ClockArtOptions): string {
  const safeDate = escapeSvgText(date);
  const safeMeridiem = time.meridiem ? escapeSvgText(time.meridiem) : "";
  const groupStart = safeMeridiem ? 64 : 158;
  const hoursX = groupStart;
  const firstColonX = groupStart + 344;
  const minutesX = groupStart + 392;
  const secondColonX = groupStart + 736;
  const secondsX = groupStart + 784;
  const meridiemX = groupStart + 1124;
  const meridiem = safeMeridiem
    ? `
      <g transform="translate(${meridiemX} 230)">
        <rect x="0" y="0" width="136" height="74" rx="22" fill="#F6F1E8" opacity="0.95" />
        <text x="68" y="50" text-anchor="middle" fill="#18191C" font-family="SF Pro Display, -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif" font-size="44" font-weight="850" letter-spacing="2">${safeMeridiem}</text>
      </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="680" viewBox="0 0 1400 680" role="img" aria-label="Seconds Clock">
  <defs>
    <linearGradient id="sceneGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3F3F3D" />
      <stop offset="1" stop-color="#2E2F30" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#242528" />
      <stop offset="0.49" stop-color="#18191C" />
      <stop offset="0.51" stop-color="#111215" />
      <stop offset="1" stop-color="#202125" />
    </linearGradient>
    <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="145%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#000000" flood-opacity="0.32" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#FFFFFF" flood-opacity="0.06" />
    </filter>
  </defs>

  <rect width="1400" height="680" rx="54" fill="url(#sceneGradient)" />
  <rect x="48" y="52" width="1304" height="576" rx="44" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.06)" />

  ${renderFlapCard(time.hours, hoursX, "HOURS")}
  ${renderColon(firstColonX)}
  ${renderFlapCard(time.minutes, minutesX, "MINUTES")}
  ${renderColon(secondColonX)}
  ${renderFlapCard(time.seconds, secondsX, "SECONDS")}
  ${meridiem}

  <text x="700" y="560" text-anchor="middle" fill="#F6F1E8" font-family="SF Pro Text, -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif" font-size="42" font-weight="800" letter-spacing="8">${safeDate}</text>
</svg>`;
}
