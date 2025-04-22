const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  return {
    ...config,
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'svg'],
      sourceExts: [...config.resolver.sourceExts, 'ts', 'tsx', 'jsx', 'js'],
      extraNodeModules: {
        '@expo/metro-runtime/assets': __dirname + '/node_modules/@expo/metro-runtime/assets',
        'missing-asset-registry-path': path.resolve(__dirname, 'node_modules/expo-asset/build/AssetRegistry')
      }
    }
  };
})();
