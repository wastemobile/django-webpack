const path = require("path");
const merge = require('webpack-merge');
const base = require('./webpack.base');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = merge(base, {
	mode: 'development',
	devtool: 'inline-source-map',
	output: {
		path: path.resolve('./assets/bundles/'),
	},
	plugins: [
		new BundleTracker({filename: './webpack-stats.json'}),
	]
})
