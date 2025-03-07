import { copyFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Use environment variable or default to ./dist
const targetDir = process.env.OBSIDIAN_PLUGIN_DIR || './dist'
const files = ['main.js', 'manifest.json', 'styles.css']

async function deployPlugin() {
  console.log('Deploying plugin...')

  // Create target directory if it doesn't exist and we're using the default
  if (targetDir === './dist' && !existsSync(targetDir)) {
    console.log(`Creating directory ${targetDir}...`)
    await mkdir(targetDir, { recursive: true })
  }

  for (const file of files) {
    try {
      await copyFile(file, join(targetDir, file))
      console.log(`Copied ${file} to ${targetDir}`)
    } catch (err) {
      console.error(`Error copying ${file}:`, err)
    }
  }
  console.log('Deployment complete!')
}

deployPlugin()
