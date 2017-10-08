const webpack = require('webpack');
<<<<<<< HEAD
//const HtmlWebpackPlugin = require('html-webpack-plugin');
=======
>>>>>>> 44a158933631a7ad731424edf6593c16e1e781ef
var path = require('path');

module.exports = {
	entry: "./app.js", //入口文件(与该文件同级目录)
	output: {
		path: __dirname, //输出的目录
		filename: 'bundle.js' //输出的文件名称
	},
	devtool: "source-map", //便于调试，相当于命令行中 webpack --devtool source-map
	module: { //依赖的模块
		rules: [ //模块、规则，如果在webpack旧版本中用的不是rules。用的是loaders
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: { //插件
					presets: ["es2015"]
				}
			},
			//		{
			//          test: /\.js$/,
			//          exclude: /node_modules/,
			//          loader: 'babel-loader'
			//      },
			{
				test: /\.css$/,
				exclude: /node_modules/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.less$/,
				exclude: /node_modules/,
				loader: 'style-loader!css-loader!less-loader'
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				loader: 'style-loader!css-loader!sass-loader'
			},
			{ //背景图片
				test: /\.(jpg|png|gif)$/,
				loader: "url-loader?limit=1024&name=[name].[ext]",
				options: {
					publicPath: '/'
				}
			},
			{ //字体文件
				test: /\.(eot|woff|svg|ttf|woff2|gif|appcache)(\?|$)/,
				loader: 'file-loader?name=[name].[ext]'
			}

		]
	}
//	plugins: [
//		new webpack.ProvidePlugin({
//			$: "jquery",
//			jQuery: "jquery"
//		}),
//	]

}