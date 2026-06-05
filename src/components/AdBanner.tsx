/**
 * AdBanner.tsx — Real AdMob banner ad component
 *
 * Replaces the placeholder AdBanner in DashboardScreen.tsx.
 *
 * Size: BANNER (320×50) — standard, non-intrusive for a business app.
 * Position: Between search bar and inventory list (already correct in Dashboard).
 *
 * Usage:
 *   import { AdBanner } from '../components/AdBanner';
 *   // Then in your JSX (already wired in DashboardScreen):
 *   {shouldShowAds(userType) && <AdBanner />}
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../config/adConfig';

export const AdBanner: React.FC = () => {
  const [adLoaded, setAdLoaded] = useState(false);

  return (
    // Outer container always reserves the 62px height slot.
    // This prevents layout shift when the ad loads — the list doesn't jump.
    <View style={[styles.container, !adLoaded && styles.hidden]}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.BANNER}          // 320×50 — standard, least intrusive
        requestOptions={{
          requestNonPersonalizedAdsOnly: true, // GDPR-safe default for Germany
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          // Silently fail — don't show error to user, just hide the slot
          setAdLoaded(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    height: 62,            // 50px ad + 12px padding — fixed height prevents layout shift
  },
  hidden: {
    opacity: 0,            // Reserve space but invisible until ad is ready
    height: 0,             // Collapse entirely if ad fails to load
  },
});
