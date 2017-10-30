const webpack = require('webpack');
const path = require('path');
const PROD = process.env.NODE_ENV === 'production';

module.exports = {
    entry: path.resolve(__dirname + '/clockvine.js'),

    output: {
        path: path.resolve(__dirname + '/'),
        filename: 'clockvine.dist.js',

        libraryTarget: 'umd',
        library: 'clockvine-vue',
        umdNamedDefine: true,
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['env'],
                            },
                        },
                    },
                },
            },
        ],
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: PROD ? true : false,
            sourceMap: PROD ? false : true,
            mangle: PROD ? true: false,
            compress: {
                warnings: PROD ? false: true
            },
        }),
    ],
};
