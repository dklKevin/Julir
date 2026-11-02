/**
 * First-launch onboarding on an iPhone 16 Pro sized viewport: the name box
 * comes first, then every tour card sits fully inside the viewport.
 */

import { test, expect, type Locator, type Page } from '@playwright/test'

const STEP_TITLES = ['Welcome to Julir!', 'Voice Recording', 'Save Your Entry', 'Your Journal']

async function expectFullyInViewport(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height)
}

test('tour starts after the name box and every card stays on screen', async ({ page }) => {
  await page.goto('/')

  const nameInput = page.getByPlaceholder('Enter your name...')
  const closeTour = page.getByRole('button', { name: 'Close onboarding' })

  // Past the tour's 1.5 s delay, the name box is still the only thing on screen
  await expect(nameInput).toBeVisible()
  await page.waitForTimeout(2000)
  await expect(closeTour).toHaveCount(0)

  await nameInput.fill('Kevin')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(nameInput).toHaveCount(0)

  // The close button sits inside the card, so its parent is the card itself
  const card = closeTour.locator('..')
  for (const [i, title] of STEP_TITLES.entries()) {
    await expect(card.getByRole('heading', { name: title })).toBeVisible()
    // Let the pop animation settle so the box is measured at its final size
    await card.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
    await expectFullyInViewport(page, card)
    await card.getByRole('button', { name: i === STEP_TITLES.length - 1 ? 'Got it!' : 'Next' }).click()
  }

  await expect(closeTour).toHaveCount(0)
})
