import type webpack from 'webpack'
import {Compilation, sources} from 'webpack'
import {patchV2CSP, patchV3CSP} from './patchCSP'
import {patchWebResourcesV2, patchWebResourcesV3} from './patchWebResources'
import patchBackground from './patchBackground'
import patchExternallyConnectable from './patchExternallyConnectable'
import {type RunChromeExtensionInterface} from '../../../types'

class ApplyManifestDevDefaultsPlugin {
  private readonly manifestPath?: string

  constructor(options: RunChromeExtensionInterface) {
    this.manifestPath = options.manifestPath
  }

  private generateManifestPatches(
    compilation: webpack.Compilation
    // manifest: any
  ) {
    const manifest = compilation.getAsset('manifest.json')
      ? JSON.parse(
          (compilation.getAsset('manifest.json')?.source.source() as string) ||
            '{}'
        )
      : require(this.manifestPath!)

    const patchedManifest = {
      // Preserve all other user entries
      ...manifest,
      // Allow usig source map based on eval, using Manifest V2.
      // script-src 'self' 'unsafe-eval';
      // See https://github.com/awesome-webextension/webpack-target-webextension#source-map.
      // For V3, see https://developer.chrome.com/docs/extensions/migrating/improve-security/#update-csp
      content_security_policy:
        manifest.manifest_version === 2
          ? patchV2CSP(manifest.content_security_policy)
          : {extension_pages: patchV3CSP(manifest.content_security_policy)},

      // Set permission scripting as it's required for reload to work
      // with content scripts in v3. See:
      // https://github.com/awesome-webextension/webpack-target-webextension#content-script
      ...(manifest.manifest_version === 3
        ? manifest.permissions
          ? {permissions: ['scripting', ...manifest.permissions]}
          : {permissions: ['scripting']}
        : // : {permissions: []}
          {}),

      // Use content_scripts to inject the reload dispatcher.
      // content_scripts: patchContentScripts(manifest),

      // Use the background script to inject the reload handler.
      ...patchBackground(manifest),

      // A misuse of external_connectable can break communication
      // across extension reloads, so we ensure that the extension
      // is externally connectable to all other extensions.
      ...patchExternallyConnectable(manifest),

      // We need to allow /*.json', '/*.js', '/*.css to be able to load
      // the reload script and the reload handler assets.
      web_accessible_resources:
        manifest.manifest_version === 3
          ? patchWebResourcesV3(manifest)
          : patchWebResourcesV2(manifest)
    }

    const source = JSON.stringify(patchedManifest, null, 2)
    const rawSource = new sources.RawSource(source)

    if (compilation.getAsset('manifest.json')) {
      compilation.updateAsset('manifest.json', rawSource)
    } else {
      // compilation.emitAsset('manifest.json', rawSource)
    }
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap('ReloadPlugin', (compilation) => {
      const Error = compiler.webpack.WebpackError

      // This plugin only works during development
      if (compiler.options.mode === 'production') return

      compilation.hooks.processAssets.tap(
        {
          name: 'ReloadPlugin',
          // Summarize the list of existing assets.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        (_assets) => {
          if (!this.manifestPath) {
            const errorMessage =
              'No manifest.json found in your extension bundle. Unable to patch manifest.json.'

            if (!!compilation && !!Error) {
              compilation.errors.push(
                new Error(`[ReloadPlugin]: ${errorMessage}`)
              )
            }
            return
          }

          // Most of the patching happens in the manifest.json file.
          this.generateManifestPatches(compilation)
        }
      )
    })
  }
}

export default ApplyManifestDevDefaultsPlugin
