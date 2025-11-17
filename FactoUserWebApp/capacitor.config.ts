import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.facto.userapp',
  appName: 'Facto',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // For development, you can use:
    // url: 'http://localhost:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a1628",
      showSpinner: true,
      spinnerColor: "#007AFF"
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0a1628'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      deepLinking: {
        enabled: true,
        schemes: ['facto', 'factoapp']
      }
    }
  }
};

export default config;

