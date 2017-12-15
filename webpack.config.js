const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app.jsx',
  devtool: '#eval-source-map',
  output: { path: __dirname, filename: 'bundle.js' },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoader.min.js',
        to: 'cornerstone/cornerstoneWADOImageLoader.min.js' },
      { from: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderCodecs.min.js',
        to: 'cornerstone/cornerstoneWADOImageLoaderCodecs.min.js' },
      { from: 'node_modules/cornerstone-wado-image-loader/dist/cornerstoneWADOImageLoaderWebWorker.min.js',
        to: 'cornerstone/cornerstoneWADOImageLoaderWebWorker.min.js' },
    ]),
  ],
  devServer: {
    open: true,
  },
};
