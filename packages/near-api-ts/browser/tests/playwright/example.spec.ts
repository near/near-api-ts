import { expect, test } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// TODO make it works

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('works without dev server', async ({ page }) => {
  const entryPath = path.resolve(
    __dirname,
    '../../../dist/browser/index.js'
  )

  const entryUrl = pathToFileURL(entryPath).href

  await page.goto('about:blank')

  const result = await page.evaluate(async (url) => {
    const lib = await import(url)
    return Object.keys(lib)
  }, entryUrl)

  expect(result.length).toBeGreaterThan(0)
})
