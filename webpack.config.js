const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

const libraryName = 'ComposeIt'
const ENV_MODE = process.env.ENV
const outputFile = '.min.js'
const paths = [ './build' ]

module.exports = {
  mode: ENV_MODE || 'development',
  entry: {
    [libraryName]: './src/scripts/index.js',
    markdown: './src/example/markdown.js',
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name]' + outputFile,
    library: '[name]',
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
      {
        test: /\.md$/,
        use: {
          loader: 'raw-loader',
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
      { from: './src/example/github.css' },
    ])
  ],
}
