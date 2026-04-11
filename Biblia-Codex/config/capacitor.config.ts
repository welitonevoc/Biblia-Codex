import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.codex.biblia',
  appName: 'Bíblia Codex',

  webDir: 'dist',

  server: {
    androidScheme: 'https',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    useLegacyBridge: false,
    enablePwaComponents: true,
  },

  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
