// src/config/adConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
// AdMob configuration
//
// HOW TO SET UP:
// 1. Create an AdMob account at https://admob.google.com
// 2. Add your app and create a Banner Ad unit
// 3. Replace the placeholder values below with your real IDs
// 4. Install the SDK:  npm install react-native-google-mobile-ads
// 5. Add to app.json plugins:
//    {
//      "react-native-google-mobile-ads",
//      { "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" }
//    }
// 6. Run a new EAS build
// 7. In DashboardScreen, swap <AdBanner /> placeholder for the real AdMob component
// ─────────────────────────────────────────────────────────────────────────────

export const AD_CONFIG = {
  // Replace with your real AdMob Android App ID
  androidAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',

  // Replace with your real Banner Ad Unit ID
  // Use test ID during development: 'ca-app-pub-3940256099942544/6300978111'
  bannerAdUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',

  // Test mode — set to false in production
  testMode: true,
};

// User types that should see ads
// Once you add user_type to your auth/profile, update this check
export function shouldShowAds(userType: string | undefined): boolean {
  // Free users see ads; pro and scanner_owner users do not
  if (userType === 'pro' || userType === 'scanner_owner') return false;
  return true; // free or undefined → show ads
}
