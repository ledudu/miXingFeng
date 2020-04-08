const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const dev = process.env.NODE_ENV !== "production" ? true : false
console.warn("dev", dev)
module.exports = {
	entry: ['./src/index.js', "./src/themes/css/index.less"],
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '',
		filename: 'js/[name].js',
		chunkFilename: 'js/[id].chunk.js?[hash:8]'
	},
	devtool: dev ? 'cheap-module-eval-source-map' : 'cheap-module-source-map',
	mode: dev ? 'development' : 'production',
	resolve: {
		extensions: ['*', '.js', '.jsx'],
		alias: {
			components: __dirname + "./src/components",
			constants: __dirname + "./src/constants",
			container: __dirname + "./src/container",
			ducks: __dirname + "./src/ducks",
			logic: __dirname + "./src/logic",
			services: __dirname + "./src/services",
			themes: __dirname + "./src/themes"
		}
	},
	module: {
		rules: [{
				test: /\.css$|\.less$/,
				use: [{
						loader: MiniCssExtractPlugin.loader,
						options: {
							// you can specify a publicPath here
							// by default it uses publicPath in webpackOptions.output
							publicPath: './public',
							hmr: process.env.NODE_ENV === 'development',
							reloadAll: true,
						},
					},
					'css-loader',
					'postcss-loader',
					'less-loader',
				],
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['stage-2', 'react'],
						plugins: [
							["import", {
								"libraryName": "antd-mobile",
								"style": "css"
							}],
							"transform-remove-strict-mode"
						],
						comments: false,
						cacheDirectory: true
					}
				}
			},
			{
				test: /.js$/,
            	use: 'happypack/loader?id=jsHappy',
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|jpeg|ttf|woff|woff2|eot|svg)$/i,
				use: [{
					loader: 'url-loader',
					options: {
						name: 'fonts/[name].[hash:8].[ext]',
						limit: 102400
					}
				}]
			},
			{
				test: /\.(svg)$/i,
				loader: ['file-loader'],
				include: [
					require.resolve('antd-mobile').replace(/warn\.js$/, ''),
					path.resolve(__dirname, 'src/themes/css/font-awesome')
				]
			}
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			// Options similar to the same options in webpackOptions.output
			// both options are optional
			filename: '[name].css',
			chunkFilename: '[id].css',
			ignoreOrder: true, // Enable to remove warnings about conflicting order
		}),
		new HtmlWebpackPlugin({
			template: "./public/index.html",
			filename: 'index.html',
			inject: 'body',
			hash: true,
			favicon: false,
			minify: false,
			xhtml: true,
			cache: true,
			title: "mixingfeng",
			showErrors: true
		}),
		// new CleanWebpackPlugin(),
		new HappyPack({
			id: 'jsHappy',
			threadPool: happyThreadPool,
			loaders: [{
				loader: 'babel-loader',
            	options: {
					presets: ['stage-2', 'react'],
                	cacheDirectory: true
            	}
			}],
			verbose: true,  //允许 happypack 输出日志
			verboseWhenProfiling: true,  //允许 happypack 在运行 webpack --profile 时输出日志
			debug: true  //允许 happypack 打印 log 分析信息
		}),
		new ParallelUglifyPlugin({
			cacheDir: '.cache/',
			uglifyJS:{
				output: {
					beautify: false,  //是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
					comments: false  //不保留代码中的注释，默认为保留，为了达到更好的压缩效果
				},
			warnings: false,
			compress: {
				drop_debugger: true,
				drop_console: true
			}
			}
		}),
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: false
			}),
			new OptimizeCSSAssetsPlugin({})
		],
		splitChunks: {
			chunks: 'async',
			minSize: 30000,
			minChunks: 1,
			maxAsyncRequests: 5,
			maxInitialRequests: 3,
			name: false,
			cacheGroups: {
				vendor: {
					name: 'vendor',
					chunks: 'initial',
					priority: -10,
					reuseExistingChunk: false,
					test: /node_modules\/(.*)\.js/
				},
				styles: {
					name: 'styles',
					test: /\.(less|css)$/,
					chunks: 'all',
					minChunks: 1,
					reuseExistingChunk: true,
					enforce: true
				}
			}
		},
		runtimeChunk: {
			name: 'manifest',
		}
	},
	devServer: {
		contentBase: path.join(__dirname, 'public')
	},
};
