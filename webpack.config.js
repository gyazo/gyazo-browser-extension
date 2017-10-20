const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const exec = require('child_process').execSync

const isProductionBuild = process.env.BUILD_TARGET === 'production' || process.env.NODE_ENV === 'production'
const isReview = process.env.BUILD_TARGET === 'review'
const distPath = 'dist/' + process.env.BUILD_EXTENSION_TYPE
const distPathCommon = distPath + '/common'
const distPathChrome = distPath + '/chrome'
const distPathFirefox = distPath + '/firefox'
const distPathEdge = distPath + '/edge'

let plugins = [
  new webpack.EnvironmentPlugin({
    BUILD_EXTENSION_TYPE: 'personal'
  }),
  new CopyWebpackPlugin([
    {from: './src/statics/option/options.html', to: 'option/options.html'},
    {from: './src/statics/option/option.css', to: 'option/option.css'},
    {from: './src/statics/_locales', to: '_locales'},
    {from: './src/statics/imgs', to: 'imgs'},
    {from: './src/statics/icons', to: 'icons'},
    {from: './src/statics/content.css'},
    {from: './src/statics/menu.css'},
    {from: './src/manifest.json'}
  ]),
  new WebpackOnBuildPlugin(() => {
    exec(`cp -R ${distPathCommon}/* ${distPathChrome}`)
    exec(`cp -R ${distPathCommon}/* ${distPathFirefox}`)
    exec(`cp -R ${distPathCommon}/* ${distPathEdge}`)
    exec(`./node_modules/.bin/wemf -U --browser firefox ${distPathFirefox}/manifest.json`)
    exec(`./node_modules/.bin/wemf -U --browser chrome ${distPathChrome}/manifest.json`)
    exec(`./node_modules/.bin/wemf -U --browser edge ${distPathEdge}/manifest.json --data '${JSON.stringify({name: 'Gyazo Extension for Edge'})}'`)

    if (isReview) {
      const manifestPath = path.resolve(__dirname, `./${distPathFirefox}/manifest.json`)
      let manifest = require(manifestPath)
      const d = new Date()
      const packageVer = `${(d.getUTCFullYear() + '').substr(2)}.${d.getUTCMonth() + 1}.${d.getUTCDate()}.${d.getUTCHours()}${d.getUTCMinutes()}`
      manifest.applications = {gecko: {id: `gyazo-extension-${process.env.BUILD_EXTENSION_TYPE}-dev@gyazo.com`}}
      manifest.version = packageVer

      require('fs').writeFileSync(
        manifestPath,
        JSON.stringify(manifest, null, 2)
      )
    }
  })
]

if (isProductionBuild || isReview) plugins.push(new UglifyJSPlugin())

module.exports = {
  devtool: isProductionBuild ? false : 'inline-source-map',
  entry: {
    main: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/main.js'],
    content: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/content/content.js'],
    option: ['chrome-browser-object-polyfill', 'babel-polyfill', './src/statics/option/option.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, distPathCommon)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins
}
