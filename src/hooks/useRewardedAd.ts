/**
 * useRewardedAd.ts — Rewarded ad hook
 *
 * WHEN IT FIRES:
 * Only when the user explicitly taps "Watch ad to export CSV" or
 * "Watch ad to unlock extra family member slot."
 * The user chooses — never forced.
 *
 * REWARD VALUE:
 * Pass a callback that runs when the user earns the reward (watched the full ad).
 * If the user skips or closes early, onRewardEarned does NOT fire.
 *
 * USAGE in ProfileScreen or wherever you add the export/unlock button:
 *
 *   import { useRewardedAd } from '../hooks/useRewardedAd';
 *
 *   const { showRewardedAd, isLoading } = useRewardedAd(userType);
 *
 *   // When user taps "Watch ad to export CSV":
 *   <TouchableOpacity
 *     onPress={() => showRewardedAd(() => handleExportCSV())}
 *     disabled={isLoading}
 *   >
 *     <Text>{isLoading ? 'Loading ad...' : '📺 Watch ad to export CSV'}</Text>
 *   </TouchableOpacity>
 *
 * NOTE: For Pro users, skip the ad entirely and call handleExportCSV() directly.
 * The button shouldn't even appear for Pro users — it's a free-tier unlock mechanism.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, shouldShowAds, UserType } from '../config/adConfig';

export function useRewardedAd(userType: UserType) {
  const rewarded       = useRef<RewardedAd | null>(null);
  const isAdLoaded     = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const pendingReward  = useRef<(() => void) | null>(null);

  const loadAd = useCallback(() => {
    if (!shouldShowAds(userType)) return;

    const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      isAdLoaded.current = true;
      setIsLoading(false);
    });

    ad.addAdEventListener(AdEventType.ERROR, () => {
      isAdLoaded.current = false;
      setIsLoading(false);
      pendingReward.current = null;
    });

    // This fires only if the user watched the full ad
    ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      if (pendingReward.current) {
        pendingReward.current(); // run the callback (e.g. export CSV)
        pendingReward.current = null;
      }
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isAdLoaded.current = false;
      pendingReward.current = null;
      // Pre-load next ad
      loadAd();
    });

    setIsLoading(true);
    ad.load();
    rewarded.current = ad;
  }, [userType]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  /**
   * showRewardedAd(onRewardEarned)
   * Call this when the user taps the "Watch ad" button.
   * onRewardEarned fires only if they watch the full ad.
   */
  const showRewardedAd = useCallback((onRewardEarned: () => void) => {
    if (!isAdLoaded.current || !rewarded.current) {
      // Ad not ready yet — load and retry
      pendingReward.current = onRewardEarned;
      loadAd();
      return;
    }
    pendingReward.current = onRewardEarned;
    rewarded.current.show();
  }, [loadAd]);

  return { showRewardedAd, isLoading };
}
