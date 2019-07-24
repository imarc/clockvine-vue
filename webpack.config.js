module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        //presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-class-properties'],
                    },
                },
            },
        ],
    },

    entry: {
        Clockvine: './src/clockvine.js',
    },

    output: {
        filename: '[name].js',
        path: __dirname + '/lib',
    },
};
