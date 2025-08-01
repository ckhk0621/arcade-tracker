import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'author', 'targetType', 'rating', 'moderationStatus', 'createdAt'],
    listSearchableFields: ['content'],
    group: 'Content',
  },
  access: {
    read: ({ req: { user } }) => {
      // Admins can see all comments, users can only see approved comments
      if (user?.role === 'admin') {
        return true
      }
      return {
        moderationStatus: {
          equals: 'approved',
        },
      }
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user }, id }) => {
      if (user?.role === 'admin') return true
      // Users can only update their own comments
      return {
        author: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Set author for new comments
        if (operation === 'create' && req.user) {
          data.author = req.user.id
        }
        
        // Set moderation status for new comments
        if (operation === 'create' && !data.moderationStatus) {
          // Auto-approve comments from trusted users or admins
          data.moderationStatus = req.user?.role === 'admin' ? 'approved' : 'pending'
        }
        
        // Set last modified timestamp
        data.lastModified = new Date()
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Update analytics when comment is approved
        if (operation === 'update' && doc.moderationStatus === 'approved') {
          try {
            // Update photo or machine analytics based on target type
            if (doc.targetType === 'photo' && doc.photo) {
              // Fetch current photo to get current likes count
              const currentPhoto = await req.payload.findByID({
                collection: 'photos',
                id: doc.photo
              })
              
              const currentLikes = currentPhoto.metadata?.likes || 0
              const likesToAdd = doc.rating >= 4 ? 1 : 0
              
              await req.payload.update({
                collection: 'photos',
                id: doc.photo,
                data: {
                  metadata: {
                    ...currentPhoto.metadata,
                    likes: currentLikes + likesToAdd
                  }
                }
              })
            } else if (doc.targetType === 'machine' && doc.machine) {
              // Update machine rating
              const comments = await req.payload.find({
                collection: 'comments',
                where: {
                  machine: { equals: doc.machine },
                  moderationStatus: { equals: 'approved' },
                  rating: { exists: true }
                }
              })
              
              if (comments.docs.length > 0) {
                const totalRating = comments.docs.reduce((sum, comment) => sum + (comment.rating || 0), 0)
                const averageRating = totalRating / comments.docs.length
                
                // Fetch current machine to preserve existing analytics
                const currentMachine = await req.payload.findByID({
                  collection: 'machines',
                  id: doc.machine
                })
                
                await req.payload.update({
                  collection: 'machines',
                  id: doc.machine,
                  data: {
                    analytics: {
                      ...currentMachine.analytics,
                      averageRating: averageRating,
                      totalRatings: comments.docs.length
                    }
                  }
                })
              }
            }
          } catch (error) {
            req.payload.logger.error('Failed to update analytics:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description: 'Comment content (max 1000 characters)',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'User who wrote this comment',
        readOnly: true,
      },
    },
    {
      name: 'targetType',
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: 'Photo',
          value: 'photo',
        },
        {
          label: 'Machine',
          value: 'machine',
        },
        {
          label: 'Store',
          value: 'store',
        },
      ],
      admin: {
        description: 'What this comment is about',
      },
    },
    {
      name: 'photo',
      type: 'relationship',
      relationTo: 'photos',
      required: false,
      index: true,
      admin: {
        description: 'Photo being commented on',
        condition: (_, siblingData) => siblingData.targetType === 'photo',
      },
    },
    {
      name: 'machine',
      type: 'relationship',
      relationTo: 'machines',
      required: false,
      index: true,
      admin: {
        description: 'Machine being commented on',
        condition: (_, siblingData) => siblingData.targetType === 'machine',
      },
    },
    {
      name: 'store',
      type: 'relationship',
      relationTo: 'stores',
      required: false,
      index: true,
      admin: {
        description: 'Store being commented on',
        condition: (_, siblingData) => siblingData.targetType === 'store',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: false,
      min: 1,
      max: 5,
      admin: {
        description: 'Optional rating (1-5 stars)',
      },
    },
    {
      name: 'moderationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        {
          label: 'Pending Review',
          value: 'pending',
        },
        {
          label: 'Approved',
          value: 'approved',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Flagged',
          value: 'flagged',
        },
      ],
      admin: {
        description: 'Moderation status',
      },
    },
    {
      name: 'parentComment',
      type: 'relationship',
      relationTo: 'comments',
      required: false,
      index: true,
      admin: {
        description: 'Parent comment if this is a reply',
      },
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Number of likes this comment received',
      },
    },
    {
      name: 'reportCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of times this comment was reported',
        condition: (_, __, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'isEdited',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this comment has been edited',
        readOnly: true,
      },
    },
    {
      name: 'editHistory',
      type: 'array',
      fields: [
        {
          name: 'editedAt',
          type: 'date',
          required: true,
        },
        {
          name: 'previousContent',
          type: 'textarea',
          required: true,
        },
      ],
      admin: {
        description: 'History of edits (admin only)',
        condition: (_, __, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      required: false,
      access: {
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        description: 'Internal moderation notes (admin only)',
        condition: (_, __, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'lastModified',
      type: 'date',
      required: false,
      index: true,
      admin: {
        description: 'Last modification timestamp',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}