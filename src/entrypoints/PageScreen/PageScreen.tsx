import { useState, useEffect } from 'react'
import { RenderPageCtx } from 'datocms-plugin-sdk'
import { Canvas, Button, Spinner, SwitchField } from 'datocms-react-ui'
import { Client, buildClient } from '@datocms/cma-client-browser'
import isSvg from 'is-svg'
import { ImageList } from '../../components/ImageList/ImageList'
import { SvgViewer } from '../../components/SvgViewer/SvgViewer'
import { Plus } from '../../components/Icons/plus'
import { GlobalParameters, SvgRecord, SvgUpload } from '../../lib/types'
import { customModalId, defaultFilename } from '../../lib/constants'
import {
  loadSvgRecords,
  createSvgRecord,
  updateSvgRecord,
  deleteSvgRecord,
  recordToSvgUpload,
} from '../../lib/recordHelpers'

import * as styles from './PageScreen.module.css'

type Props = {
  ctx: RenderPageCtx
}

export default function PageScreen({ ctx }: Props) {
  let datoClient: Client
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const [svgRecords, setSvgRecords] = useState<SvgRecord[]>([])
  const [rawSvg, setRawSvg] = useState('')
  const [filename, setFilename] = useState(defaultFilename)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadToMediaLibrary, setUploadToMediaLibrary] = useState(false)

  const { currentUserAccessToken, environment } = ctx
  if (currentUserAccessToken) {
    datoClient = buildClient({ apiToken: currentUserAccessToken, environment })
  }

  // Load SVG records on mount
  useEffect(() => {
    async function loadSvgs() {
      if (!pluginParameters.svgModelId || !currentUserAccessToken) {
        setIsLoading(false)
        return
      }

      const records = await loadSvgRecords(
        currentUserAccessToken,
        pluginParameters.svgModelId,
        environment,
      )
      setSvgRecords(records)
      setIsLoading(false)
    }

    loadSvgs()
  }, [pluginParameters.svgModelId, currentUserAccessToken])

  async function saveRawSvg(rawSvg: string) {
    if (!rawSvg || !isSvg(rawSvg)) {
      return
    }

    if (!pluginParameters.svgModelId || !currentUserAccessToken) {
      ctx.alert('SVG model not found. Please complete setup.')
      return
    }

    try {
      setIsUploading(true)

      const newRecord = await createSvgRecord(
        currentUserAccessToken,
        pluginParameters.svgModelId,
        {
          name: filename,
          svg_content: rawSvg,
          svg_type: 'svg',
        },
        environment,
      )

      if (newRecord) {
        setSvgRecords([newRecord, ...svgRecords])
        ctx.notice('SVG uploaded successfully!')
      } else {
        ctx.alert('Failed to create SVG record')
      }
    } finally {
      setIsUploading(false)
      setRawSvg('')
      setFilename(defaultFilename)
    }
  }

  async function saveSvgAsImage(rawSvg: string) {
    if (!rawSvg || !isSvg(rawSvg)) {
      return
    }

    if (!pluginParameters.svgModelId || !currentUserAccessToken) {
      ctx.alert('SVG model not found. Please complete setup.')
      return
    }

    const svgData = new Blob([rawSvg], { type: 'image/svg+xml' })
    const svgFile = new File([svgData], filename)

    try {
      setIsUploading(true)

      // Upload to media library
      const svgUpload = await datoClient.uploads.createFromFileOrBlob({
        fileOrBlob: svgFile,
        filename: `${filename}.svg`,
      })

      // Create record with media library reference
      const newRecord = await createSvgRecord(
        currentUserAccessToken,
        pluginParameters.svgModelId,
        {
          name: filename,
          svg_content: rawSvg,
          svg_type: 'image',
          media_upload: {
            upload_id: svgUpload.id,
          },
        },
        environment,
      )

      if (newRecord) {
        setSvgRecords([newRecord, ...svgRecords])
        ctx.notice('SVG uploaded successfully!')
      } else {
        ctx.alert('Failed to create SVG record')
      }
    } finally {
      setIsUploading(false)
      setRawSvg('')
      setFilename(defaultFilename)
    }
  }

  async function removeImageSvg(uploadId: string) {
    try {
      setIsRemoving(true)
      await datoClient.uploads.destroy(uploadId)
    } catch (error) {
      console.error(error)
    } finally {
      setIsRemoving(false)
    }
  }

  async function deleteSvg(svg: SvgUpload) {
    if (!currentUserAccessToken) {
      return
    }

    // Find the actual record
    const record = svgRecords.find((r) => r.id === svg.id)
    if (!record) {
      return
    }

    // If it has a media upload, delete that first
    if (record.svg_type === 'image' && record.media_upload) {
      await removeImageSvg(record.media_upload.upload_id)
    }

    // Delete the record
    const success = await deleteSvgRecord(
      currentUserAccessToken,
      record.id,
      environment,
    )

    if (success) {
      setSvgRecords(svgRecords.filter((r) => r.id !== record.id))
      ctx.notice('SVG deleted successfully!')
    } else {
      ctx.alert('Failed to delete SVG')
    }
  }

  async function openUploadModal(svg: SvgUpload) {
    if (svg.type !== 'image') {
      return
    }

    const item = await ctx.editUpload(svg.imageId)

    if (item && item.deleted) {
      await deleteSvg(svg)
      return
    }

    if (item && item.attributes.basename !== svg.filename) {
      await renameSvg({ ...svg, filename: item.attributes.basename })
    }
  }

  async function openCustomModal(svg: SvgUpload) {
    if (svg.type !== 'svg') {
      return
    }

    let item: null | (typeof svg & { deleted?: boolean }) = null
    item = (await ctx.openModal({
      id: customModalId,
      title: 'Raw details',
      width: 's',
      parameters: { rawSvg: svg },
    })) as typeof svg & { deleted?: boolean }

    if (item && item.deleted) {
      await deleteSvg(svg)
      return
    }

    if (item && item.filename !== svg.filename) {
      await renameSvg({ ...svg, filename: item.filename })
    }
  }

  async function renameSvg(svg: SvgUpload) {
    if (!currentUserAccessToken) {
      return
    }

    const updatedRecord = await updateSvgRecord(
      currentUserAccessToken,
      svg.id,
      {
        name: svg.filename,
      },
      environment,
    )

    if (updatedRecord) {
      setSvgRecords(
        svgRecords.map((r) => (r.id === svg.id ? updatedRecord : r)),
      )
      ctx.notice('SVG renamed successfully!')
    } else {
      ctx.alert('Failed to rename SVG')
    }
  }

  async function handleUpload(rawSvg: string) {
    if (uploadToMediaLibrary) {
      await saveSvgAsImage(rawSvg)
      return
    }

    await saveRawSvg(rawSvg)
  }

  // Convert records to SvgUpload format for ImageList component
  const svgUploads = svgRecords.map(recordToSvgUpload)

  return (
    <Canvas ctx={ctx}>
      <div className="layout">
        <SvgViewer
          value={rawSvg}
          onChangeSvg={setRawSvg}
          filename={filename}
          onChangeFilename={setFilename}
        />

        <div className={styles.uploadContainer}>
          {isUploading && <Spinner />}

          {!isUploading && (
            <>
              <Button
                disabled={!isSvg(rawSvg)}
                onClick={() => handleUpload(rawSvg)}
                leftIcon={<Plus />}
              >
                Upload raw svg
              </Button>
              {currentUserAccessToken && (
                <div>
                  <SwitchField
                    name="uploadToMedia"
                    id="uploadToMedia"
                    label="Upload SVG to the Media library"
                    value={uploadToMediaLibrary}
                    onChange={(newValue: boolean) => setUploadToMediaLibrary(newValue)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <h3 className="h2">Uploaded svgs</h3>

        {isLoading && <Spinner />}
        {!isLoading && svgUploads.length === 0 && <p>Nothing to show (yet)</p>}
        {!isLoading && (
          <ImageList
            svgs={svgUploads}
            onDelete={isRemoving ? undefined : deleteSvg}
            onShowUpload={openUploadModal}
            onShowRaw={openCustomModal}
            isLoading={isRemoving}
            showTag
          />
        )}
      </div>
    </Canvas>
  )
}
