const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { inDev } = require('./webpack.helpers');
const path = require('path');
const dotenv = require('dotenv')
var HtmlWebpackPlugin = require('html-webpack-plugin');
const rootDir = process.cwd();

dotenv.config();

module.exports = [
  new webpack.DefinePlugin({
    'process.env': JSON.stringify(process.env)
  }),
  new ForkTsCheckerWebpackPlugin(),
  inDev() && new HtmlWebpackPlugin({
    template: path.join(rootDir, 'src/renderer/app.html')
  }),
  inDev() && new webpack.HotModuleReplacementPlugin(),
  inDev() && new ReactRefreshWebpackPlugin(),
].filter(Boolean);
