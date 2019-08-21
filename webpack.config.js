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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            //presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-proposal-private-methods',
              '@babel/plugin-proposal-class-properties'
            ],
          },
        },
      },
    ],
  },

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
