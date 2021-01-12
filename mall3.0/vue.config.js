'use strict'

const path = require('path')
const merge = require('webpack-merge')
const tsImportPluginFactory = require('ts-import-plugin')

const config = require('./src/utils/config')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const { mockUrl } = config[process.env.NODE_ENV]

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  devServer: {
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/dev-api': {
        target: mockUrl,
        pathRewrite: {
          '^/dev-api': '/'
        },
        secure: false,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    name: 'vue-h5-template',
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },

  chainWebpack(config) {
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => {
        options = merge(options, {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [
              tsImportPluginFactory({
                libraryName: 'vant',
                libraryDirectory: 'es',
                style: true
              })
            ]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        })
        return options
      })

    config.when(process.env.NODE_ENV !== 'development', config => {
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial'
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'),
            minChunks: 3,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      })
      config.optimization.runtimeChunk('single')
    })
  }
}
