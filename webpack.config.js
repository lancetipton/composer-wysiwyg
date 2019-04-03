const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

const libraryName = 'Composer'
const ENV_MODE = process.env.ENV
const outputFile = libraryName + '.min.js'
const paths = [ './build' ]

module.exports = {
  mode: ENV_MODE || 'development',
  entry: './src/scripts/index.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: outputFile,
    library: libraryName,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      { enforce: 'pre', test: /\.(js|css)$/, loader: 'remove-comments-loader' }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(paths, {}),
    new HtmlWebpackPlugin({ template: './src/example/index.html' }),
    new CopyWebpackPlugin([
      { from: './src/example/index.css' },
      { from: './src/example/index.js' },
    ])
  ],
}
