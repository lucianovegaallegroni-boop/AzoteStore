import { test, expect } from '@playwright/test';

test('Verify Landing Page Featured Products Carousel has horizontal overflow styles', async ({ page }) => {
  // Go to home page
  await page.goto('http://localhost:5173/');

  // Find the container under the title 'Productos Destacados'
  // The carousel container has the classes: flex gap-gutter overflow-x-auto
  const carousel = page.locator('.relative.group\\/carousel > div');
  
  // Verify that the element is visible
  await expect(carousel).toBeVisible();

  // Get className attribute
  const className = await carousel.getAttribute('class');
  console.log('Carousel container classes:', className);

  // Assert that overflow-x-auto and flex are in the classes (which indicates horizontal carousel scrolling layout instead of vertical grid)
  expect(className).toContain('overflow-x-auto');
  expect(className).toContain('flex');

  // Verify it does NOT contain 'grid' class
  expect(className).not.toContain('grid');
  
  console.log('Verification completed: Carousel is correctly implemented with flex and horizontal scrolling classes.');
});
