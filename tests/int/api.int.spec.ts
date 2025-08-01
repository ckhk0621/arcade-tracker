import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })

  it('creates user with proper activity tracking', async () => {
    // Create a test user
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'user',
        points: 150,
      },
    })

    expect(testUser).toBeDefined()
    expect(testUser.id).toBeDefined()
    expect(testUser.level).toBe(2) // 150 points = level 2
    expect(testUser.points).toBe(150)

    // Test that activity fields are properly initialized
    if (testUser.activity) {
      expect(testUser.activity.totalSessions).toBe(0)
      expect(testUser.activity.joinDate).toBeDefined()
      
      // Test that streak object is properly structured
      if (testUser.activity.streak) {
        expect(testUser.activity.streak.current).toBe(0)
        expect(testUser.activity.streak.longest).toBe(0)
      }
    }

    // Clean up test user
    await payload.delete({
      collection: 'users',
      id: testUser.id,
    })
  })

  it('updates user without causing streak property errors', async () => {
    // Create a test user first
    const testUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test-update@example.com',
        password: 'testpassword123',
        role: 'user',
        points: 50,
      },
    })

    // Update the user to trigger the afterChange hook
    const updatedUser = await payload.update({
      collection: 'users',
      id: testUser.id,
      data: {
        displayName: 'Test User Updated',
        points: 200,
      },
    })

    expect(updatedUser).toBeDefined()
    expect(updatedUser.displayName).toBe('Test User Updated')
    expect(updatedUser.level).toBe(3) // 200 points = level 3
    expect(updatedUser.points).toBe(200)

    // Verify no errors occurred with activity/streak properties
    expect(updatedUser.activity).toBeDefined()
    if (updatedUser.activity?.streak) {
      expect(updatedUser.activity.streak.current).toBeDefined()
      expect(updatedUser.activity.streak.longest).toBeDefined()
    }

    // Clean up test user
    await payload.delete({
      collection: 'users',
      id: testUser.id,
    })
  })
})
