import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Upload attempt - URL:', !!supabaseUrl, 'Key:', !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase env vars')
      return NextResponse.json({ error: 'Storage not configured - missing env vars' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    console.log('File:', file.name, file.size, file.type)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const originalExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ext = ['jpg','jpeg','png','webp','gif','jfif'].includes(originalExt) ?
      (originalExt === 'jfif' ? 'jpg' : originalExt) : 'jpg'
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Try to create bucket if needed
    await supabase.storage.createBucket('product-images', { public: true }).catch(() => {})

    const { error } = await supabase.storage.from('product-images').upload(filename, buffer, {
      contentType: 'image/jpeg',
      upsert: false,
    })

    if (error) {
      console.error('Supabase upload error:', JSON.stringify(error))
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filename)
    console.log('Upload success:', urlData.publicUrl)

    return NextResponse.json({ url: urlData.publicUrl, filename })
  } catch (error) {
    console.error('Upload catch error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
