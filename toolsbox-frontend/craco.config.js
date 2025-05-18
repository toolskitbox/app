const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add polyfills for Node.js core modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        util: require.resolve('util'),
        assert: require.resolve('assert'),
        process: require.resolve('process'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        fs: false,
        net: false,
        tls: false
      };

      // Add plugins
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process'
        })
      );

      return webpackConfig;
    }
  }
};
