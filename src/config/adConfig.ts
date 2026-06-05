/**
 * adConfig.ts — Central AdMob configuration
 *
 * HOW TO USE:
 * 1. During development: test IDs below are already set (Google's official test IDs).
 *    Ads will show as "Test Ad" — this is correct, don't worry.
 * 2. Before production release: replace the PRODUCTION IDs with real ones from
 *    your AdMob dashboard (admob.google.com) and set IS_PRODUCTION = true.
 *
 * IMPORTANT: Never use real ad unit IDs during development/testing.
 * Google can ban your AdMob account for clicking your own real ads.
 */

import { Platform } from 'react-native';

// ─── Toggle this when you're ready to go live ────────────────────────────────
const IS_PRODUCTION = false;

// ─── Test Ad Unit IDs (Google's official test IDs — safe to use always) ──────
const TEST_IDS = {
  android: {
    banner:       'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded:     'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    banner:       'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded:     'ca-app-pub-3940256099942544/1712485313',
  },
};

// ─── Production Ad Unit IDs — replace with your real IDs from AdMob ──────────
// Get these from: admob.google.com → Apps → Ad units
// Format: ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN
const PRODUCTION_IDS = {
  android: {
    banner:       'ca-app-pub-3479058134966847/REPLACE_BANNER',       // TODO: replace
    interstitial: 'ca-app-pub-3479058134966847/REPLACE_INTERSTITIAL', // TODO: replace
    rewarded:     'ca-app-pub-3479058134966847/REPLACE_REWARDED',     // TODO: replace
  },
  ios: {
    banner:       'ca-app-pub-3479058134966847/REPLACE_BANNER',       // TODO: replace
    interstitial: 'ca-app-pub-3479058134966847/REPLACE_INTERSTITIAL', // TODO: replace
    rewarded:     'ca-app-pub-3479058134966847/REPLACE_REWARDED',     // TODO: replace
  },
};

// ─── Active IDs (auto-selects based on IS_PRODUCTION flag) ───────────────────
const activeIds = IS_PRODUCTION ? PRODUCTION_IDS : TEST_IDS;
const platform  = Platform.OS === 'ios' ? 'ios' : 'android';

export const AD_UNIT_IDS = {
  banner:       activeIds[platform].banner,
  interstitial: activeIds[platform].interstitial,
  rewarded:     activeIds[platform].rewarded,
};

// ─── Ad visibility logic ──────────────────────────────────────────────────────
// Free users see ads. Pro and Scanner Bundle users see no ads.
export type UserType = 'free' | 'pro' | 'scanner_bundle' | undefined;

export function shouldShowAds(userType: UserType): boolean {
  if (!userType || userType === 'free') return true;
  return false;
}

// ─── Tier mapper ──────────────────────────────────────────────────────────────
// Converts the raw tier string stored in Supabase user_metadata
// into the UserType that the ad hooks and shouldShowAds() understand.
//
// Usage in App.tsx:
//   const adUserType = userTierToAdUserType(user?.user_metadata?.tier);
//
// Supabase tier values → AdMob UserType mapping:
//   undefined / null / 'free'   → 'free'        (sees ads)
//   'pro'                        → 'pro'          (no ads)
//   'scanner_bundle'             → 'scanner_bundle' (no ads)
//   any other unknown value      → 'free'        (safe default, sees ads)
export function userTierToAdUserType(tier: string | undefined): UserType {
  if (tier === 'pro') return 'pro';
  if (tier === 'scanner_bundle') return 'scanner_bundle';
  return 'free';
}

// ─── Interstitial throttle settings ──────────────────────────────────────────
// Never show interstitials more often than this (in milliseconds).
// 5 minutes = 300,000ms — respectful for a business tool.
export const INTERSTITIAL_MIN_INTERVAL_MS = 5 * 60 * 1000;
