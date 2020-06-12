const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
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
  ],

  entry: {
    Clockvine: './src/Clockvine.js',
  },

  output: {
    filename: '[name].js',
    library: 'Clockvine',
    libraryTarget: 'umd',
    path: __dirname + '/lib',
  },
};
