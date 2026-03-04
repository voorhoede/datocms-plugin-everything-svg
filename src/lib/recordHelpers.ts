import { buildClient } from '@datocms/cma-client-browser'
import type { SvgRecord } from './types'

export async function loadSvgRecords(
  apiToken: string,
  modelId: string,
  environment?: string,
): Promise<SvgRecord[]> {
  const clientOptions: any = { apiToken }
  if (environment) {
    clientOptions.environment = environment
  }

  const client = buildClient(clientOptions)

  try {
    const records = await client.items.list({
      filter: { type: modelId },
      page: {
        limit: 500,
      },
      version: 'current', // Include draft/unpublished records
    })

    return records.map((record: any) => {
      const attrs = record.attributes || record

      const svgRecord: SvgRecord = {
        id: record.id as string,
        name: (attrs.name as string) || 'Untitled',
        svg_content: (attrs.svg_content as string) || '',
        svg_type: (attrs.svg_type as 'svg' | 'image') || 'svg',
      }

      const mediaUpload = attrs.media_upload
      if (mediaUpload && typeof mediaUpload === 'object') {
        svgRecord.media_upload = {
          upload_id: mediaUpload.upload_id as string,
          url: mediaUpload.url as string,
        }
      }

      return svgRecord
    })
  } catch (error) {
    console.error('Error loading SVG records:', error)
    return []
  }
}

export async function createSvgRecord(
  apiToken: string,
  modelId: string,
  data: {
    name: string
    svg_content: string
    svg_type: 'svg' | 'image'
    media_upload?: { upload_id: string }
  },
  environment?: string,
): Promise<SvgRecord | null> {
  const clientOptions: any = { apiToken }
  if (environment) clientOptions.environment = environment
  const client = buildClient(clientOptions)

  try {
    const record = await client.items.create({
      item_type: { type: 'item_type', id: modelId },
      ...data,
    })

    const svgRecord: SvgRecord = {
      id: (record as any).id as string,
      name: (record as any).name as string,
      svg_content: (record as any).svg_content as string,
      svg_type: (record as any).svg_type as 'svg' | 'image',
    }

    const mediaUpload = (record as any).media_upload
    if (mediaUpload && typeof mediaUpload === 'object') {
      svgRecord.media_upload = {
        upload_id: mediaUpload.upload_id as string,
        url: mediaUpload.url as string,
      }
    }

    return svgRecord
  } catch (error) {
    console.error('Error creating SVG record:', error)
    return null
  }
}

export async function updateSvgRecord(
  apiToken: string,
  recordId: string,
  data: Partial<{
    name: string
    svg_content: string
    svg_type: 'svg' | 'image'
    media_upload: { upload_id: string }
  }>,
  environment?: string,
): Promise<SvgRecord | null> {
  const clientOptions: any = { apiToken }
  if (environment) clientOptions.environment = environment
  const client = buildClient(clientOptions)

  try {
    const record = await client.items.update(recordId, data)

    const svgRecord: SvgRecord = {
      id: (record as any).id as string,
      name: (record as any).name as string,
      svg_content: (record as any).svg_content as string,
      svg_type: (record as any).svg_type as 'svg' | 'image',
    }

    const mediaUpload = (record as any).media_upload
    if (mediaUpload && typeof mediaUpload === 'object') {
      svgRecord.media_upload = {
        upload_id: mediaUpload.upload_id as string,
        url: mediaUpload.url as string,
      }
    }

    return svgRecord
  } catch (error) {
    console.error('Error updating SVG record:', error)
    return null
  }
}

export async function deleteSvgRecord(
  apiToken: string,
  recordId: string,
  environment?: string,
): Promise<boolean> {
  const clientOptions: any = { apiToken }
  if (environment) clientOptions.environment = environment
  const client = buildClient(clientOptions)

  try {
    await client.items.destroy(recordId)
    return true
  } catch (error) {
    console.error('Error deleting SVG record:', error)
    return false
  }
}
