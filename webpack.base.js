const path = require("path");
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	context: __dirname,
	entry: './frontend/js/index',
	
	output: {
		// path: path.resolve('./assets/bundles/'),
		filename: "[name]-[hash].js",
	},

	module: {
		rules: [
			{
				test: /\.(sa|sc|c)ss$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							syntax: 'postcss-scss',
							plugins: [
								require('postcss-import'),
						    require('tailwindcss'),
						    require('postcss-nested'),
								require('autoprefixer'),
							]
						}
					}
				]
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/style.[contenthash].css'
		}),
		new CleanWebpackPlugin(),
	],

}