const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util"),
      "assert": require.resolve("assert"),
      "process": require.resolve("process/browser"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "net": false,
      "tls": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ]
};
