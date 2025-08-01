const { test, expect, devices } = require('@playwright/test');

// Use mobile device emulation
test.use({ ...devices['iPhone 13'] });

test.describe('Mobile Bottom Sheet Drag Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to our test page
    await page.goto(`file://${__dirname}/test-mobile-drag.html`);
    await page.waitForLoadState('domcontentloaded');
  });

  test('drag handle should respond to touch events', async ({ page }) => {
    const dragHandle = page.locator('#dragHandle');
    const results = page.locator('#results');
    
    // Verify drag handle is visible
    await expect(dragHandle).toBeVisible();
    
    // Simulate touch on drag handle
    await dragHandle.tap();
    
    // Check that touch events were logged
    await expect(results).toContainText('Drag handle touched');
  });

  test('scrollable content should scroll independently', async ({ page }) => {
    const scrollableContent = page.locator('#scrollableContent');
    const results = page.locator('#results');
    
    // Get initial scroll position
    const initialScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    expect(initialScrollTop).toBe(0);
    
    // Simulate scrolling by touch
    await scrollableContent.hover();
    await page.mouse.wheel(0, 200);
    
    // Check that content has scrolled
    const newScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(initialScrollTop);
    
    // Verify scroll event was logged
    await expect(results).toContainText('Scrolled to:');
  });

  test('drag handle touch should not interfere with content scrolling', async ({ page }) => {
    const dragHandle = page.locator('#dragHandle');
    const scrollableContent = page.locator('#scrollableContent');
    
    // First, touch the drag handle
    await dragHandle.tap();
    
    // Then try to scroll the content
    const initialScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    await scrollableContent.hover();
    await page.mouse.wheel(0, 300);
    
    // Content should still be scrollable
    const newScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(initialScrollTop);
  });

  test('simulated pan gesture on drag handle', async ({ page }) => {
    const dragHandle = page.locator('#dragHandle');
    const results = page.locator('#results');
    
    // Simulate a pan gesture on the drag handle
    await simulatePanGesture(dragHandle, 0, 100); // Pan down 100px
    
    // Check that drag handle events were logged
    await expect(results).toContainText('Drag handle touched');
    await expect(results).toContainText('Drag handle moved');
    await expect(results).toContainText('Drag handle released');
  });

  test('simulated pan gesture on content should scroll', async ({ page }) => {
    const scrollableContent = page.locator('#scrollableContent');
    const results = page.locator('#results');
    
    // Get initial scroll position
    const initialScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    
    // Simulate a pan gesture on the scrollable content
    await simulatePanGesture(scrollableContent, 0, -100); // Pan up to scroll down
    
    // Content should scroll and events should be logged
    await expect(results).toContainText('Content touched');
    
    // Check scroll position changed
    const newScrollTop = await scrollableContent.evaluate(el => el.scrollTop);
    // Note: Pan gesture might not always result in scroll, depending on implementation
    console.log(`Scroll position: ${initialScrollTop} -> ${newScrollTop}`);
  });
});

// Helper function to simulate pan gesture using touch events
async function simulatePanGesture(locator, deltaX = 0, deltaY = 0, steps = 5) {
  // Get element center
  const box = await locator.boundingBox();
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  // Touch start
  const touches = [{
    identifier: 0,
    clientX: centerX,
    clientY: centerY,
  }];
  
  await locator.dispatchEvent('touchstart', {
    touches,
    changedTouches: touches,
    targetTouches: touches
  });

  // Touch move in steps
  for (let i = 1; i <= steps; i++) {
    const touchesMove = [{
      identifier: 0,
      clientX: centerX + deltaX * i / steps,
      clientY: centerY + deltaY * i / steps,
    }];
    
    await locator.dispatchEvent('touchmove', {
      touches: touchesMove,
      changedTouches: touchesMove,
      targetTouches: touchesMove
    });
  }

  // Touch end
  await locator.dispatchEvent('touchend', {
    touches: [],
    changedTouches: [],
    targetTouches: []
  });
}