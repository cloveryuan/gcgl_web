const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const baseUrl = process.env.VUE_APP_BASE_URL;

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // 打包app时放开该配置
  publicPath:process.env.NODE_ENV === 'production'?'/web/':'/',
  outputDir: process.env.outputDir,
  configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true

      config.plugins.push(new CompressionPlugin({
        algorithm: 'gzip',
        filename: '[path].gz[query]', // 压缩后的文件名
        test: /\.js$|\.html$|\.json$|\.css/,
        threshold: 10240,
        minRatio: 1,
        deleteOriginalAssets: false // 删除未压缩的文件，谨慎设置，如果希望提供非gzip的资源，可不设置或者设置为false
      }))

      // 开启分离js
      config.optimization = {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name (module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`
              }
            }
          }
        }
      }
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))

    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('source-map')
      )

    // 配置 webpack 识别 markdown 为普通的文件
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use()
      .loader('file-loader')
      .end()
      // set svg-sprite-loader
      config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()
      config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },

  devServer: {
    port: 8080,
    proxy: {
      '/pub': {
        target: baseUrl,
        changeOrigin: true,
        pathRewrite: {
          "^/pub": "",
        }
      },
      '/webimg': {
        target: 'http://36.133.34.40:82/',
        changeOrigin: true,
        pathRewrite: {
          "^/webimg": "webimg",
        }
      },
    }
  },
  lintOnSave: undefined
}
