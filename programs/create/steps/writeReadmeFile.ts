//  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
// ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
// ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
// ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
// ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

import path from 'path'
import fs from 'fs/promises'

import {getInstallCommand} from '../helpers/getInstallInfo'
import isExternalTemplate from '../helpers/isExternalTemplate'

export default async function writeReadmeFile(
  workingDir: string,
  projectName: string,
  template: string
) {
  const projectPath = path.join(workingDir, projectName)
  const readmePath = path.join(projectPath, 'README.md')
  const stats = await fs.lstat(readmePath)

  // If the file doesn't exist or comes from external source,
  // we don't need to do anything
  if (!stats.isFile() || isExternalTemplate(template)) {
    return
  }

  const readmeFile = await fs.readFile(readmePath, 'utf-8')

  const readmeFileEdited = readmeFile
    .replaceAll('[projectName]', projectName)
    .replaceAll('[projectPackageManager]', getInstallCommand())

  try {
    console.log('📝 - Writing `README.md` metadata...')
    await fs.writeFile(path.join(projectPath, 'README.md'), readmeFileEdited)
  } catch (error: any) {
    console.error(
      `😕❓ Can't write README file for __${projectName}__: ${error}`
    )
    process.exit(1)
  }
}
