import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1000')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Build where clause
    const where: any = {
      status: {
        equals: 'active'
      }
    }
    
    if (category && category !== 'all') {
      where.category = {
        equals: category
      }
    }
    
    if (search) {
      where.or = [
        {
          name: {
            contains: search
          }
        },
        {
          address: {
            contains: search
          }
        },
        {
          city: {
            contains: search
          }
        }
      ]
    }
    
    const stores = await payload.find({
      collection: 'stores',
      limit,
      where,
      sort: '-popularity'
    })
    
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}