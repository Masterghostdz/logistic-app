// Use the Capacitor runtime global if available (works across Capacitor versions)
const getSystemBar = () => {
  try {
    const cap: any = (window as any).Capacitor || null;
    if (cap && cap.Plugins && cap.Plugins.SystemBar) return cap.Plugins.SystemBar;
    // Capacitor 3+ may expose plugins directly on window.Capacitor.Plugins
    if ((window as any).SystemBar) return (window as any).SystemBar;
    return null;
  } catch (e) {
    return null;
  }
};

export async function setSystemBarLight(light: boolean): Promise<void> {
  const SystemBar = getSystemBar();
  if (SystemBar && typeof SystemBar.setNavigationBarLight === 'function') {
    try {
      await SystemBar.setNavigationBarLight({ light });
    } catch (e) {
      console.warn('Failed to set system bar appearance:', e);
    }
  }
}
