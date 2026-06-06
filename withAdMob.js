const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAdMob(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const mainApp = manifest.manifest.application[0];

    if (!mainApp['meta-data']) mainApp['meta-data'] = [];

    // Remove existing AdMob entry if present (avoid duplicates on rebuild)
    mainApp['meta-data'] = mainApp['meta-data'].filter(
      (item) => item.$['android:name'] !== 'com.google.android.gms.ads.APPLICATION_ID'
    );

    // Inject AdMob Android App ID into AndroidManifest.xml
    mainApp['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.APPLICATION_ID',
        'android:value': 'ca-app-pub-3479058134966847~9716777334',
      },
    });

    return config;
  });
};
