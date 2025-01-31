import type webpack from 'webpack'
import {type WebResourcesPluginInterface} from '../../types'

export default class ApplyCommonFileLoaders {
  private readonly manifestPath: string

  constructor(options: WebResourcesPluginInterface) {
    this.manifestPath = options.manifestPath
  }

  private loaders() {
    const getFilename = (runtime: string, folderPath: string) => {
      if (runtime.startsWith('content_scripts')) {
        return 'web_accessible_resources/[name].[hash:8][ext]'
      }

      return `${folderPath}/[name].[hash:8][ext]`
    }

    const assetLoaders = [
      {
        test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: ({runtime}: {runtime: string}) =>
            getFilename(runtime, 'images')
        },
        parser: {
          dataUrlCondition: {
            // inline images < 2 KB
            maxSize: 2 * 1024
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: ({runtime}: {runtime: string}) =>
            getFilename(runtime, 'fonts')
        }
      },
      {
        test: /\.(txt|md|csv|tsv|xml|pdf|docx|doc|xls|xlsx|ppt|pptx|zip|gz|gzip|tgz)$/i,
        type: 'asset/resource',
        generator: {
          filename: ({runtime}: {runtime: string}) =>
            getFilename(runtime, 'assets')
        },
        parser: {
          dataUrlCondition: {
            // inline images < 2 KB
            maxSize: 2 * 1024
          }
        }
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
        generator: {
          filename: ({runtime}: {runtime: string}) =>
            getFilename(runtime, 'assets')
        }
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
        generator: {
          filename: ({runtime}: {runtime: string}) =>
            getFilename(runtime, 'assets')
        }
      }
    ]

    return assetLoaders
  }

  apply(compiler: webpack.Compiler) {
    const supportedLoaders = this.loaders()
    compiler.options.module?.rules.push(...supportedLoaders)
  }
}
