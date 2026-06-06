const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

function withAdMobManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const mainApp = manifest.manifest.application[0];
    if (!mainApp['meta-data']) mainApp['meta-data'] = [];
    mainApp['meta-data'] = mainApp['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );
    mainApp['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': 'ca-app-pub-3479058134966847~9716777334',
      },
    });
    return config;
  });
}

function withAdMobGradle(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('googleMobileAdsJson')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    defaultConfig {
        manifestPlaceholders = [googleMobileAdsJson: "{}"]
    }`
      );
    }
    return config;
  });
}

module.exports = function withAdMob(config) {
  config = withAdMobManifest(config);
  config = withAdMobGradle(config);
  return config;
};