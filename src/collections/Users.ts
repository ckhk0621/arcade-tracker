import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'email', 'level', 'points', 'role', 'lastActive'],
    listSearchableFields: ['displayName', 'email'],
  },
  auth: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Calculate level based on points (every 100 points = 1 level)
        if (data.points !== undefined) {
          data.level = Math.floor(data.points / 100) + 1
        }
        
        // Update last modified for real-time tracking
        if (operation === 'update') {
          data.lastModified = new Date().toISOString()
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only track activity on successful user authentication/login operations
        // This hook will run when PayloadCMS updates user records during auth
        if (operation === 'update' && req.user?.id === doc.id && doc.id) {
          try {
            // Safely access nested properties with proper null checks
            const activity = doc.activity || {}
            const streak = activity.streak || { current: 0, longest: 0, lastStreakDate: null }
            
            // Only update if this looks like a fresh login (not an admin edit)
            // We check if lastActive is missing or old to avoid excessive updates
            const isLoginUpdate = !activity.lastActive || 
              (new Date().getTime() - new Date(activity.lastActive).getTime()) > 60000 // 1 minute
            
            if (isLoginUpdate) {
              const now = new Date().toISOString()
              
              // Increment session count safely
              const newSessionCount = (activity.totalSessions || 0) + 1
              
              // Update activity without triggering infinite recursion
              await req.payload.update({
                collection: 'users',
                id: doc.id,
                data: {
                  activity: {
                    lastActive: now,
                    joinDate: activity.joinDate || now,
                    totalSessions: newSessionCount,
                    streak: {
                      current: streak.current || 0,
                      longest: streak.longest || 0,
                      lastStreakDate: streak.lastStreakDate || now
                    }
                  }
                },
                depth: 0 // Prevent deep population to avoid performance issues
              })
            }
          } catch (error) {
            // Log error but never throw - this ensures login flow continues
            console.error('User activity update failed:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'Public display name (falls back to email if not set)',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      index: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Moderator',
          value: 'moderator',
        },
        {
          label: 'User',
          value: 'user',
        },
        {
          label: 'Banned',
          value: 'banned',
        },
      ],
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Total points earned from photo uploads and activities',
      },
    },
    {
      name: 'level',
      type: 'number',
      required: false,
      defaultValue: 1,
      min: 1,
      index: true,
      admin: {
        description: 'User level (calculated from points)',
        readOnly: true,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Profile picture',
      },
    },
    {
      name: 'profile',
      type: 'group',
      fields: [
        {
          name: 'bio',
          type: 'textarea',
          maxLength: 500,
          admin: {
            description: 'User biography (max 500 characters)',
          },
        },
        {
          name: 'location',
          type: 'text',
          admin: {
            description: 'User location (city, state)',
          },
        },
        {
          name: 'favoriteStore',
          type: 'relationship',
          relationTo: 'stores',
          admin: {
            description: 'User\'s favorite arcade location',
          },
        },
        {
          name: 'preferredGames',
          type: 'array',
          fields: [
            {
              name: 'game',
              type: 'text',
              required: true,
            },
          ],
          admin: {
            description: 'List of favorite arcade games',
          },
        },
      ],
      admin: {
        description: 'Extended profile information',
      },
    },
    {
      name: 'statistics',
      type: 'group',
      fields: [
        {
          name: 'photosUploaded',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Total number of photos uploaded',
          },
        },
        {
          name: 'photosVerified',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Number of photos that were verified',
          },
        },
        {
          name: 'commentsPosted',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total number of comments posted',
          },
        },
        {
          name: 'likesReceived',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total likes received on photos/comments',
          },
        },
        {
          name: 'storesVisited',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Number of unique stores visited',
          },
        },
      ],
      admin: {
        description: 'User engagement statistics',
      },
    },
    {
      name: 'activity',
      type: 'group',
      fields: [
        {
          name: 'lastActive',
          type: 'date',
          index: true,
          admin: {
            description: 'Last time user was active',
          },
        },
        {
          name: 'joinDate',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
          admin: {
            description: 'Date user joined',
          },
        },
        {
          name: 'totalSessions',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total number of login sessions',
          },
        },
        {
          name: 'streak',
          type: 'group',
          fields: [
            {
              name: 'current',
              type: 'number',
              defaultValue: 0,
              min: 0,
              admin: {
                description: 'Current consecutive days active',
              },
            },
            {
              name: 'longest',
              type: 'number',
              defaultValue: 0,
              min: 0,
              admin: {
                description: 'Longest streak achieved',
              },
            },
            {
              name: 'lastStreakDate',
              type: 'date',
              admin: {
                description: 'Last date that counted toward streak',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'User activity tracking',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications',
          },
        },
        {
          name: 'publicProfile',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Make profile visible to other users',
          },
        },
        {
          name: 'shareLocation',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Share location in photos (GPS data)',
          },
        },
        {
          name: 'theme',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ],
          admin: {
            description: 'Preferred UI theme',
          },
        },
      ],
      admin: {
        description: 'User preferences and settings',
      },
    },
    {
      name: 'badges',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description: 'Icon identifier or emoji',
          },
        },
        {
          name: 'earnedAt',
          type: 'date',
          defaultValue: () => new Date().toISOString(),
        },
      ],
      admin: {
        description: 'Achievement badges earned by user',
      },
    },
    {
      name: 'lastModified',
      type: 'date',
      index: true,
      admin: {
        description: 'Last profile modification timestamp',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
