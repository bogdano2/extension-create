// ██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗
// ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗
// ██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝
// ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝
// ██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║
// ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝

// import path from 'path'
import type webpack from 'webpack'
import {getManifestPath, getOutputPath} from '../config/getPath'
import {type DevOptions} from '../../extensionDev'
import RunChromeExtension from 'webpack-run-chrome-extension'
// import RunEdgeExtension from 'webpack-run-edge-extension'

export default function browserPlugins(
  projectPath: string,
  devOptions: DevOptions
) {
  if (!devOptions?.mode || process.env.NODE_ENV === 'test') {
    return
  }

  // TODO: cezaraugusto can't resolve paths with spaces in it.
  // const manifestPath = path.resolve(projectPath, 'manifest.json')

  const chromeConfig = {
    port: 8082,
    manifestPath: getManifestPath(projectPath),
    // The final folder where the extension manifest file is located.
    // This is used to load the extension into the browser.
    extensionPath: getOutputPath(projectPath, devOptions.browser),
    autoReload: true,
    browserFlags: ['--enable-benchmarking']
  }

  // const edgeConfig = {
  //   ...chromeConfig,
  //   port: 8082,
  // }

  return {
    name: 'browserPlugins',
    apply: (compiler: webpack.Compiler) => {
      switch (devOptions.browser) {
        case 'chrome':
          new RunChromeExtension(chromeConfig).apply(compiler)
          break
        case 'edge':
          // new RunChromeExtension(edgeConfig).apply(compiler)
          console.warn(
            '[extension-create]: edger browser is being refactored... not currentlty supported'
          )
          break
        case 'firefox':
          console.warn('[extension-create]: firefox browser not supported')
          break
        default:
          new RunChromeExtension(chromeConfig).apply(compiler)
          break
      }
    }
  }
}
