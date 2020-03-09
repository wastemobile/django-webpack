const path = require("path");
const glob = require('glob');
const merge = require('webpack-merge');
const base = require('./webpack.base');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');


module.exports = merge(base, {
	mode: 'production',
	devtool: 'source-map',
	output: {
		path: path.resolve('./assets/dist/'),
		publicPath: '/static/dist/'
	},
	plugins: [
		new BundleTracker({filename: './webpack-stats-prod.json'}),
		new PurgecssPlugin({
      paths: glob.sync(`./templates/**/*`,  { nodir: true }),
    }),
	],
	optimization: {
    minimizer: [
      new TerserWebpackPlugin(),
      new OptimizeCssAssetsWebpackPlugin()
    ]
  }
})
