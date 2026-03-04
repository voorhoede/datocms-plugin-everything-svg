import { buildClient } from '@datocms/cma-client-browser'
import { SVG_MODEL_API_KEY, SVG_MODEL_NAME } from './constants'

export async function createSvgModel(apiToken: string, environment?: string) {
  const clientOptions: any = { apiToken }

  if (environment) {
    clientOptions.environment = environment
  }

  const client = buildClient(clientOptions)

  try {
    // Create the model
    const itemType = await client.itemTypes.create(
      {
        name: SVG_MODEL_NAME,
        api_key: SVG_MODEL_API_KEY,
        collection_appearance: 'table',
        singleton: false,
      },
      {
        skip_menu_item_creation: true,
      },
    )

    // Create the name field
    await client.fields.create(itemType.id, {
      label: 'Name',
      api_key: 'name',
      field_type: 'string',
      validators: {
        required: {},
      },
    } as any)

    // Create the svg_content field
    await client.fields.create(itemType.id, {
      label: 'SVG Content',
      api_key: 'svg_content',
      field_type: 'text',
      validators: {
        required: {},
      },
    } as any)

    // Create the svg_type field
    await client.fields.create(itemType.id, {
      label: 'Type',
      api_key: 'svg_type',
      field_type: 'string',
      validators: {
        enum: {
          values: ['svg', 'image'],
        },
      },
    } as any)

    // Create the media_upload field (optional asset field)
    await client.fields.create(itemType.id, {
      label: 'Media Upload',
      api_key: 'media_upload',
      field_type: 'file',
      validators: {},
    } as any)

    // Set the name field as the title field
    const nameField = await client.fields.list(itemType.id)
    const nameFieldId = nameField.find((f) => f.api_key === 'name')?.id
    if (nameFieldId) {
      await client.itemTypes.update(itemType.id, {
        title_field: { type: 'field', id: nameFieldId },
      })
    }

    return itemType
  } catch (error) {
    console.error('Error creating SVG model:', error)
    throw error
  }
}

export async function checkIfModelExists(
  apiToken: string,
): Promise<string | null> {
  const client = buildClient({ apiToken })

  try {
    const itemTypes = await client.itemTypes.list()
    const svgModel = itemTypes.find(
      (it: any) => it.api_key === SVG_MODEL_API_KEY,
    )
    return svgModel?.id || null
  } catch (error) {
    console.error('Error checking for SVG model:', error)
    return null
  }
}

export async function migrateSvgsToRecords(
  apiToken: string,
  modelId: string,
  svgs: any[],
) {
  const client = buildClient({ apiToken })
  const migratedRecords: any[] = []

  for (const svg of svgs) {
    try {
      const recordData: any = {
        item_type: { type: 'item_type', id: modelId },
        name: svg.filename || 'Untitled SVG',
        svg_content: svg.raw,
        svg_type: svg.type,
      }

      // If it's an image type with media library reference, include the upload
      if (svg.type === 'image' && svg.imageId) {
        recordData.media_upload = {
          upload_id: svg.imageId,
        }
      }

      const record = await client.items.create(recordData)

      migratedRecords.push(record as any)
    } catch (error) {
      console.error(`Error migrating SVG ${svg.filename || svg.id}:`, error)
    }
  }

  return migratedRecords
}
