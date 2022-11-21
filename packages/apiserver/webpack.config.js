const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
  entry: './lambda.js',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // library: 'serverlessExpressEdge',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './carriers', to: 'carriers' },
        { from: './locales', to: 'locales' },
        { from: './app.js' },
        { from: './lambda.js' },
      ],
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /canvas/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /jsdom$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /iconv/ }),
  ],
  resolve: {
    modules: ['node_modules'],
  },
  externals: [nodeExternals()],
};
