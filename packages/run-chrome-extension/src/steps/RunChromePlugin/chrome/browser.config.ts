import path from 'path'
import {type RunChromeExtensionInterface} from '../../../types'

const managerExtension = path.resolve(
  __dirname,
  'extensions',
  'manager-extension'
)
const reloadExtension = path.resolve(
  __dirname,
  'extensions',
  'reload-extension'
)

export default function browserConfig(
  configOptions: RunChromeExtensionInterface
) {
  const userBrowserExtension = configOptions.extensionPath?.replace(
    'manifest.json',
    ''
  )

  const extensionsToLoad = [userBrowserExtension, managerExtension]

  if (configOptions.autoReload) {
    extensionsToLoad.push(reloadExtension)
  }

  // Flags set by default:
  // https://github.com/GoogleChrome/chrome-launcher/blob/master/src/flags.ts
  return [
    `--load-extension=${extensionsToLoad.join()}`,
    `--user-data-dir=${configOptions.userDataDir}`,
    // Flags to pass to Chrome
    // Any of http://peter.sh/experiments/chromium-command-line-switches/
    ...(configOptions.browserFlags || [])
  ].join(' ')
}
