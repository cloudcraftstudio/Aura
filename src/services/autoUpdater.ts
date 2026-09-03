import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';

export async function initAutoUpdater(onUpdateReady?: () => void) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Notify the plugin that the current bundle loaded successfully
    await CapacitorUpdater.notifyAppReady();

    // Check your server for newer web bundles
    const response = await fetch('https://webcraftstudio.cloud/api/app-update/version');
    if (!response.ok) return;

    const serverData = await response.json();
    const currentVersion = localStorage.getItem('aura_bundle_version') || '1.0.0';

    if (serverData.version && serverData.version !== currentVersion && serverData.url) {
      console.log(`[Updater] New version found: ${serverData.version}. Downloading...`);

      const version = await CapacitorUpdater.download({
        url: serverData.url,
        version: serverData.version,
      });

      // Save version and prompt user or set next reload
      localStorage.setItem('aura_bundle_version', serverData.version);

      if (onUpdateReady) {
        onUpdateReady();
      } else {
        // Automatically switch to the new version on next app start
        await CapacitorUpdater.set(version);
      }
    }
  } catch (err) {
    console.warn('[Updater] Auto-update check skipped:', err);
  }
}
