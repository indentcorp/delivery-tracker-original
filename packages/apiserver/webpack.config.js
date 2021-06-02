const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './lambda.js',
  target: 'node',
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    // library: 'serverlessExpressEdge',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './carriers', to: 'carriers' },
        { from: './locales', to: 'locales' },
        { from: './app.js' },
        { from: './lambda.js' }
      ]
    })
  ],
  resolve: {
    modules: ['node_modules'],
  },
  externals: [nodeExternals()]
}
