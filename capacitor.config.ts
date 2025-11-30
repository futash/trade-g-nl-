import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaizenlog.app',
  appName: 'KaizenLog',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;