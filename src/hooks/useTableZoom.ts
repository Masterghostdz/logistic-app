import { useState } from 'react';

type FontSizeKey = '40' | '50' | '60' | '70' | '80' | '90' | '100';

export default function useTableZoom(initial: FontSizeKey = '80') {
  // Default local font size set to '80' to meet product requirement (80% default zoom)
  const [localFontSize, setLocalFontSize] = useState<FontSizeKey>(initial);

  // Centralized zoom mapping (label -> multiplier).
  // Use straightforward mapping so '80' corresponds ~0.8, '100' -> 1.0, etc.
  const zoomLevels: Record<FontSizeKey, number> = {
    '40': 0.4,
    '50': 0.5,
    '60': 0.6,
    '70': 0.7,
    '80': 0.8,
    '90': 0.9,
    '100': 1.0,
  };

  const zoomGlobal = zoomLevels[String(localFontSize) as FontSizeKey] ?? 1.0;

  const baseFontPx = 14;
  const baseIcon = 18;

  // Slightly increased base row height to give a bit more vertical breathing room
  // (user requested slightly taller rows). Previously 40px, increase to 44px.
  const computedFontPx = Math.round(baseFontPx * zoomGlobal);
  const computedRowPx = Math.round(44 * zoomGlobal);
  const computedIconPx = Math.round(baseIcon * zoomGlobal);

  // Inline style for font size (keeps backward compatibility with existing consumers)
  const fontSizeStyle = { fontSize: `${computedFontPx}px` };

  // Tailwind-friendly class helpers using arbitrary values
  const rowHeight = `h-[${computedRowPx}px]`;
  const iconSize = `h-[${computedIconPx}px] w-[${computedIconPx}px]`;

  // Padding classes scaled with zoom to keep spacing proportional
  // Keep a reasonable minimum so small zooms don't collapse spacing
  const cellPadX = Math.max(6, Math.round(12 * zoomGlobal));
  const cellPadY = Math.max(4, Math.round(8 * zoomGlobal));
  const cellPaddingClass = `px-[${cellPadX}px] py-[${cellPadY}px]`;

  // Badge padding: ensure status badges always keep space on left and right of their text.
  // Badge padding: ensure status badges always keep space on left and right of their text.
  // Use a larger minimum horizontal padding than regular cells and scale with zoom.
  // Increased defaults to make badges noticeably roomier as requested by the user.
  // BUMP: increase horizontal padding and min width so badges feel roomier
  // Compute padding in px first (previous conservative defaults)
  // Slightly increase horizontal padding baseline so badges are roomier
  // Reduce baseline padding so badges remain compact and scale with text size
  // Reduce horizontal padding baseline so badges can be narrower when needed
  // Make badges slightly roomier by default so they look consistent across desktop and mobile
  const badgePadXPx = Math.max(6, Math.round(12 * zoomGlobal));
  // Reduce vertical padding to make badges height match text more closely

  // Convert padding to em relative to the computed font size so padding scales with text
  // Ensure a sensible minimum in em to avoid collapse
  // Increase minimum em padding a bit for better side breathing
  // Allow smaller em padding so badges follow text width more closely
  const badgePadXEm = Math.max(0.4, +(badgePadXPx / Math.max(8, computedFontPx)).toFixed(2));
  // Add a very small vertical padding so the badge isn't flush against the text
  // Increase just a little (+~1px) so status badges feel slightly taller across the app
  // Keep it tiny so the height still closely matches the text height
  const badgePadYPx = Math.max(3, Math.round(4 * zoomGlobal));

  // Slightly raise the minimum em-based vertical padding so the visual bump is subtle but consistent
  const badgePadYEm = Math.max(0.08, +(badgePadYPx / Math.max(8, computedFontPx)).toFixed(2));

  // Compute an approximate minimum width in px so very short labels still look roomy
  // Slightly larger minimum width to prevent very short labels looking too tight
  // Reduce minimum width so badges don't occupy an entire cell/row; keep a sensible floor
  // Allow smaller min width floor so short labels occupy minimal space
  const minBadgeWidth = Math.max(20, Math.round((computedFontPx * 1.3) + Math.round(badgePadXPx * 0.9)));

  // Badge class uses em-based padding so it will grow/shrink with the text size, with a pixel min-width fallback
  const badgeClass = `inline-flex items-center justify-center whitespace-nowrap rounded-full px-[${badgePadXEm}em] py-[${badgePadYEm}em] min-w-[${minBadgeWidth}px] text-[${computedFontPx}px] gap-[6px] leading-[${computedFontPx}px]`;

  // Inline style fallback for badges. We prefer inline styles for dynamic values because
  // Tailwind can't detect runtime-generated arbitrary classes and they may be purged.
  // This style ensures padding, minWidth and fontSize always apply regardless of Tailwind JIT.
  const badgeStyle: React.CSSProperties = {
  padding: `${badgePadYEm}em ${badgePadXEm}em`,
  minWidth: `${minBadgeWidth}px`,
  fontSize: `${computedFontPx}px`,
  lineHeight: `${computedFontPx}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '9999px',
  };

  // Average character width approximation (in px at base font). Use to compute a min-width
  const avgCharWidth = baseFontPx * 0.55; // ~7.7px for baseFontPx=14

  /**
   * Returns a tailwind arbitrary min-width class for an approximate number of characters.
   * Example: getMinWidthForChars(8) -> 'min-w-[62px]' (value depends on zoom)
   */
  function getMinWidthForChars(chars: number) {
    const px = Math.max(24, Math.round(chars * avgCharWidth * zoomGlobal));
    return `min-w-[${px}px]`;
  }

  return {
    localFontSize,
    setLocalFontSize,
    fontSizeStyle,
    rowHeight,
    iconSize,
    zoomGlobal,
    // New helpers
    cellPaddingClass,
  badgeClass,
  badgeStyle,
    getMinWidthForChars,
    // numeric sizes for inline use
    computedFontPx,
    computedRowPx,
    computedIconPx,
  };
}
