import { buildClient, type ClientConfigOptions } from '@datocms/cma-client-browser'
import type { SvgRecord, SvgUpload } from './types'

// Helper to convert SvgRecord to SvgUpload format for compatibility
export function recordToSvgUpload(record: SvgRecord): SvgUpload {
  const base = {
    id: record.id,
    filename: record.name || undefined,
    raw: record.svg_content,
  }

  if (record.svg_type === 'image' && record.media_upload) {
    return {
      ...base,
      type: 'image' as const,
      imageId: record.media_upload.upload_id,
      url: record.media_upload.url,
    }
  }

  return {
    ...base,
    type: 'svg' as const,
  }
}

function buildCmaClient(apiToken: string, environment?: string) {
  const config: ClientConfigOptions = { apiToken }
  if (environment) config.environment = environment
  return buildClient(config)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSvgRecord(record: any): SvgRecord {
  const svgRecord: SvgRecord = {
    id: record.id,
    name: record.name || 'Untitled',
    svg_content: record.svg_content || '',
    svg_type: record.svg_type || 'svg',
  }

  if (record.media_upload && typeof record.media_upload === 'object') {
    svgRecord.media_upload = {
      upload_id: record.media_upload.upload_id,
      url: record.media_upload.url,
    }
  }

  return svgRecord
}

export async function loadSvgRecords(
  apiToken: string,
  modelId: string,
  environment?: string,
): Promise<SvgRecord[]> {
  const client = buildCmaClient(apiToken, environment)

  try {
    const records = await client.items.list({
      filter: { type: modelId },
      page: {
        limit: 500,
      },
      version: 'current', // Include draft/unpublished records
    })

    return records.map((record) => toSvgRecord(record))
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
  const client = buildCmaClient(apiToken, environment)

  try {
    const record = await client.items.create({
      item_type: { type: 'item_type', id: modelId },
      ...data,
    })

    return toSvgRecord(record)
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
  const client = buildCmaClient(apiToken, environment)

  try {
    const record = await client.items.update(recordId, data)

    return toSvgRecord(record)
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
  const client = buildCmaClient(apiToken, environment)

  try {
    await client.items.destroy(recordId)
    return true
  } catch (error) {
    console.error('Error deleting SVG record:', error)
    return false
  }
}
