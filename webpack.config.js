'use strict';

var path = require('path');
var fs = require('fs');
var webpack = require('sgmf-scripts').webpack;
var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
var jsFiles = require('sgmf-scripts').createJsPath();
var scssFiles = require('sgmf-scripts').createScssPath();
const TerserPlugin = require('terser-webpack-plugin');
const cwd = process.cwd();
const shell = require('shelljs');
const optionator = require('optionator')(require('./options'));
const options = optionator.parseArgv(process.argv);
var cartridges = [
    'app_storefront_base',
    'app_storefront_custom'
];

var outputCartridgeName = options.cartridgeName ? options.cartridgeName : "app_storefront_custom";
var outputPath = path.resolve('./cartridges/' + outputCartridgeName + '/cartridge/static');
const packageJson = require(path.join(cwd, './package.json'));
var packageName = packageJson.packageName || packageJson.name;
if (options.cartridgeName) {
    packageName = options.cartridgeName;
    if (cartridges.indexOf(packageName) < 0) {
        cartridges.push(packageName);
    }
}

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    Button: 'exports-loader?Button!bootstrap/js/src/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};

var scssAliases = () => {
    const result = {};

    cartridges.forEach(cartridgeName => {
        const scssPath = `./cartridges/${cartridgeName}/cartridge/client/**/scss/**/*.scss`;
        const cssFiles = shell.ls(path.join(cwd, scssPath));
        cssFiles.forEach(filePath => {
            const name = path.basename(filePath, '.scss');
            if (name.indexOf('_') !== 0) {
                let location = path.relative(path.join(cwd, `./cartridges/${cartridgeName}/cartridge/client`), filePath);
                location = location.substr(0, location.length - 5).replace('scss', 'css');
                result[location] = filePath;
            }
        });
    });

    return result;
};

var jsAliases = () => {
    const result = {};

    cartridges.forEach(cartridgeName => {
        const jsPath = `./cartridges/${cartridgeName}/cartridge/client/**/js/*.js`;
        const jsFiles = shell.ls(path.join(cwd, jsPath));

        jsFiles.forEach(filePath => {
            let location = path.relative(path.join(cwd, `./cartridges/${cartridgeName}/cartridge/client`), filePath);
            location = location.substr(0, location.length - 3);
            result[location] = filePath;
        });
    });

    return result;
};

const NODE_ENV = process.env.NODE_ENV || 'development';

var configJS = {
    mode: NODE_ENV,
    name: 'js',
    entry: jsAliases(),
    devtool: 'source-map',
    optimization: {
        minimize: NODE_ENV === 'production' ? true : false,
        minimizer: [new TerserPlugin({
            parallel: true,
            terserOptions: {
              ecma: 6,
            },
            sourceMap: NODE_ENV === 'production' ? false : true,
        })],
    },
    output: {
        path: outputPath,
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /bootstrap(.)*\.js$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread'],
                        cacheDirectory: true
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin(bootstrapPackages),
        () => {
            if (NODE_ENV === 'production') {
                shell.rm('-rf', `${outputPath}/*/js`);
            }
        }
    ]
};


var configSCSS = {
    mode: NODE_ENV,
    name: 'scss',
    entry: scssAliases(),
    devtool: NODE_ENV === 'production' ? '' : 'source-map',
    optimization: {
        minimize: true
    },
    output: {
        path: outputPath,
        filename: '[name].css'
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        url: false,
                        sourceMap: false,
                        minimize: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        sourceMap: false,
                        includePaths: [
                            path.resolve('node_modules'),
                            path.resolve('node_modules/flag-icon-css/sass'),
                            path.resolve('./cartridges/app_storefront_base'),
                            path.resolve('./cartridges/app_storefront_custom')
                        ]
                    }
                }]
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css' }),
        () => {
            if (NODE_ENV === 'production') {
                shell.rm('-rf', `${outputPath}/*/css`);
            }
        }
    ]
};

if (configJS.mode === 'development') {
    configJS.devtool = 'source-map';
    configJS.optimization = {
        minimize: false
    };
}

if (configSCSS.mode === 'development') {
    configSCSS.devtool = 'source-map';
    configSCSS.optimization = {
        minimize: false
    };
}

module.exports = [configJS, configSCSS];
