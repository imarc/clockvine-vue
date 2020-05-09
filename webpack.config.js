const VueLoaderPlugin = require('vue-loader/lib/plugin');
const BabelEnginePlugin = require('babel-engine-plugin');

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
        test: /\.js$/,
        exclude: /toad_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"],
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
    //new BabelEnginePlugin({
    //    presets: ['env'],
    //}),
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
