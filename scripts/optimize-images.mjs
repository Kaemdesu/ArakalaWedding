import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const IMAGE_DIR = 'public/images'
const files = fs.readdirSync(IMAGE_DIR)

async function optimize() {
  for (const file of files) {
    if (!file.match(/\.(png|jpg|jpeg)$/i)) continue

    const inputPath = path.join(IMAGE_DIR, file)
    const outputName = file.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    const outputPath = path.join(IMAGE_DIR, outputName)

    const stats = fs.statSync(inputPath)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .resize({ width: 1920, withoutEnlargement: true })
        .toFile(outputPath)

      const newStats = fs.statSync(outputPath)
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2)

      console.log(`✅ ${file} (${sizeMB}MB) → ${outputName} (${newSizeMB}MB)`)
    } catch (err) {
      console.log(`❌ ${file}: ${err.message}`)
    }
  }

  console.log('\nDone! Now update your code to use .webp files.')
}

optimize()