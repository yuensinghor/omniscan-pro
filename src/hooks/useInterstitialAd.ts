/**
 * useInterstitialAd.ts — Interstitial ad hook
 *
 * WHEN IT FIRES:
 * After the user closes the scanner (ScanScreen), i.e. after a scan session ends.
 * This is the least disruptive moment — the user finished their task.
 *
 * THROTTLE:
 * Never fires more than once every 5 minutes (INTERSTITIAL_MIN_INTERVAL_MS).
 * For a business tool, respecting the user's workflow is essential for retention.
 *
 * USAGE in App.tsx:
 *
 *   import { useInterstitialAd } from './src/hooks/useInterstitialAd';
 *
 *   // Inside your App() component:
 *   const { showInterstitialIfReady } = useInterstitialAd(userType);
 *
 *   // Then call it when scanMode closes:
 *   const handleScanClose = () => {
 *     setScanMode(null);
 *     showInterstitialIfReady(); // ← add this line
 *   };
 *
 *   // Replace your existing setScanMode(null) calls with handleScanClose().
 *   // In ScanScreen's onClose prop and in handleScanResult after setScanMode(null).
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, INTERSTITIAL_MIN_INTERVAL_MS, shouldShowAds, UserType } from '../config/adConfig';

export function useInterstitialAd(userType: UserType) {
  const interstitial    = useRef<InterstitialAd | null>(null);
  const isAdLoaded      = useRef(false);
  const lastShownAt     = useRef<number>(0);

  // Load a fresh interstitial ad in the background
  const loadAd = useCallback(() => {
    if (!shouldShowAds(userType)) return; // don't waste requests for Pro users

    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true, // GDPR-safe for Germany
    });

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isAdLoaded.current = true;
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isAdLoaded.current = false;
      unsubscribeLoaded();
      unsubscribeClosed();
      // Pre-load the next one immediately after the current one closes
      loadAd();
    });

    ad.load();
    interstitial.current = ad;
  }, [userType]);

  // Start pre-loading on mount
  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // Call this at the end of a scan session
  const showInterstitialIfReady = useCallback(() => {
    if (!shouldShowAds(userType)) return;
    if (!isAdLoaded.current || !interstitial.current) return;

    const now = Date.now();
    if (now - lastShownAt.current < INTERSTITIAL_MIN_INTERVAL_MS) return; // throttle

    lastShownAt.current = now;
    interstitial.current.show();
  }, [userType]);

  return { showInterstitialIfReady };
}
