import path from 'path'

export function fileError(
  manifestPath: string,
  feature: string | undefined,
  filePath: string
) {
  if (!feature) {
    throw new Error('This operation is impossible. Please report a bug.')
  }

  const projectDir = path.dirname(manifestPath)

  switch (path.extname(filePath)) {
    case '.js':
    case '.ts':
    case '.jsx':
    case '.tsx':
      return javaScriptError(projectDir, feature, filePath)
    case '.css':
    case '.scss':
    case '.sass':
    case '.less':
      return cssError(projectDir, feature, filePath)
    default:
      return staticAssetErrorMessage(projectDir, feature, filePath)
  }
}

export function serverRestartRequired(
  projectDir: string,
  filePath: string
  // contentChanged: {
  //   prevFile: string
  //   updatedFile: string
  // } | null
) {
  const basename = path.relative(projectDir, filePath)
  const extname = path.extname(filePath)
  // const extname = path.extname(
  //   contentChanged?.prevFile || contentChanged?.updatedFile || ''
  // )
  // const tag = ['js', 'ts', 'jsx', 'tsx'].includes(extname) ? 'script' : 'link'
  // const prevFileRelative = path.relative(filePath, contentChanged?.prevFile!)
  // const updatedFileRelative = path.relative(
  //   filePath,
  //   contentChanged?.updatedFile!
  // )
  const errorMessage = `[${basename}] Entry Point Modification Found

Changing <script> or <link rel="stylesheet"> source paths after compilation requires a server restart. Restart the program and try again.`
  // \'\'\'diff
  // - ${prevFileRelative}
  // + ${updatedFileRelative}
  // \'\'\'
  return errorMessage
}

export function reloadAfterErrorRequiredMessage() {
  const hintMessage = `and run the program again.`
  const errorMessage = `Ensure \`<script>\` sources are valid ${hintMessage}`
  return errorMessage
}

export function manifestMissingError() {
  const hintMessage = `Check your manifest.json file.`
  const errorMessage = `File \`manifest.json\` not found. ${hintMessage}`
  return errorMessage
}

export function manifestFieldRequiredError(requiredField: string) {
  const hintMessage = `Update your manifest.json file to run your extension.`
  const errorMessage = `Field \`${requiredField}\` is required. ${hintMessage}`
  return errorMessage
}

export function manifestFieldError(feature: string, htmlFilePath: string) {
  const hintMessage = `Check the ${feature} field in your manifest.json file.`
  const pagesMessage = `Check the \`pages\` field in your manifest.json file.`
  const isPage = feature === 'pages'
  const errorMessage = `File path \`${htmlFilePath}\` not found. ${
    isPage ? pagesMessage : hintMessage
  }`
  return errorMessage
}

export function javaScriptError(
  manifestPath: string,
  htmlFilePath: string,
  inputFilepath: string
) {
  const pathRelative = path.relative(manifestPath, htmlFilePath)
  const hintMessage = `Check your <script> tags in \`${htmlFilePath}\`.`
  const errorMessage = `[${pathRelative}] File path \`${inputFilepath}\` not found. ${hintMessage}`
  return errorMessage
}

export function cssError(
  manifestPath: string,
  htmlFilePath: string,
  inputFilepath: string
) {
  const pathRelative = path.relative(manifestPath, htmlFilePath)
  const hintMessage = `Check your <link> tags in \`${htmlFilePath}\`.`
  const errorMessage = `[${pathRelative}] File path \`${inputFilepath}\` not found. ${hintMessage}`
  return errorMessage
}

export function staticAssetErrorMessage(
  manifestPath: string,
  htmlFilePath: string,
  inputFilepath: string
) {
  const extname = path.extname(inputFilepath)
  const pathRelative = path.relative(manifestPath, htmlFilePath)
  const hintMessage = `Check your *${extname} assets in \`${htmlFilePath}\`.`
  const errorMessage = `[${pathRelative}] File path \`${inputFilepath}\` not found. ${hintMessage}`
  return errorMessage
}
