module.exports = {
    parser: 'postcss-scss',
    syntax: 'postcss-scss',
    map: false,
    plugins: [
        require('autoprefixer'),
        require('@csstools/postcss-sass'),
    ],
}