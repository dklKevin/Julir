import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.julir.app',
  appName: 'Julir',
  webDir: 'dist',

  // Server configuration for development
  server: {
    // Enable HTTPS for native features
    androidScheme: 'https',
    iosScheme: 'https',
  },

  // iOS-specific configuration
  ios: {
    // Handle safe areas for notched devices
    contentInset: 'automatic',
    // Allow inline media playback
    allowsLinkPreview: true,
    // Scroll behavior
    scrollEnabled: true,
  },

  // Plugins configuration
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1c1917', // stone-950
      showSpinner: false,
      launchFadeOutDuration: 500,
    },
    // Keyboard configuration
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
