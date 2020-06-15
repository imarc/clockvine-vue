const VueLoaderPlugin = require('vue-loader/lib/plugin');
const EsmWebpackPlugin = require('@purtuga/esm-webpack-plugin');

module.exports = {
  devtool: false,
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.jsx?$/,
        //exclude: /[\\/]node_modules[\\/](?!(p-queue)[\\/])/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-private-methods',
              '@babel/plugin-proposal-class-properties'
            ],
          },
        },
      },
    ],
  },

  /*
  externals: {
    vue: {
      commonjs: 'vue',
      amd: 'vue',
      commonjs2: 'vue',
      root: 'Vue'
    }
  },
  */

  plugins: [
    new VueLoaderPlugin(),
    new EsmWebpackPlugin(),
  ],

  entry: './src/Clockvine.js',

  output: {
    filename: 'Clockvine.js',
    library: 'LIB',
    libraryTarget: 'var',
    path: __dirname + '/lib',
  },
};
