const webpack = require('webpack');
module.exports = function override(config) {
 config.resolve.fallback={...config.resolve.fallback,crypto:require.resolve('crypto-browserify'),stream:require.resolve('stream-browserify'),assert:require.resolve('assert/'),http:require.resolve('stream-http'),https:require.resolve('https-browserify'),os:require.resolve('os-browserify/browser'),url:require.resolve('url/'),buffer:require.resolve('buffer/'),vm:false};
 config.plugins.push(new webpack.ProvidePlugin({process:'process/browser.js',Buffer:['buffer','Buffer']}));
 config.ignoreWarnings=[/Failed to parse source map/];
 return config;
};
