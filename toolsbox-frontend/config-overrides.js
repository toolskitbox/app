const webpack = require('webpack');

module.exports = function override(config) {
  // Make sure resolve.fallback exists
  if (!config.resolve) {
    config.resolve = {};
  }
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  
  // Add polyfills for Node.js core modules
  Object.assign(config.resolve.fallback, {
    buffer: false,
    process: false,
    stream: false,
    crypto: false,
    util: false,
    assert: false,
    path: false,
    os: false,
    fs: false,
    net: false,
    tls: false
  });

  // Add plugins
  if (!config.plugins) {
    config.plugins = [];
  }
  
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: ['buffer', 'Buffer']
    })
  );

  return config;
};
