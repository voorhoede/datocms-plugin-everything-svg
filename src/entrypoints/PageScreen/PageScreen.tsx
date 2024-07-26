import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { RenderPageCtx } from 'datocms-plugin-sdk'
import { Canvas, Button, Spinner, SwitchField } from 'datocms-react-ui'
import { Client, buildClient } from '@datocms/cma-client-browser'
import isSvg from 'is-svg'
import { ImageList } from '../../components/ImageList/ImageList'
import { SvgViewer } from '../../components/SvgViewer/SvgViewer'
import { Plus } from '../../components/Icons/plus'
import { GlobalParameters, SvgUpload } from '../../lib/types'
import { customModalId, defaultFilename } from '../../lib/constants'
import setUpdatedSvgArray from '../../lib/setUpdatedSvgArray'

import * as styles from './PageScreen.module.css'

type Props = {
  ctx: RenderPageCtx
}

export default function PageScreen({ ctx }: Props) {
  let datoClient: Client
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const [rawSvg, setRawSvg] = useState('')
  const [filename, setFilename] = useState(defaultFilename)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [uploadToMediaLibrary, setUploadToMediaLibrary] = useState(false)

  const { currentUserAccessToken, environment } = ctx
  if (currentUserAccessToken) {
    datoClient = buildClient({ apiToken: currentUserAccessToken, environment })
  }

  async function saveNewSvg(newSvg: SvgUpload) {
    await ctx.updatePluginParameters({
      ...pluginParameters,
      svgs: [newSvg, ...(pluginParameters.svgs || [])],
    })
    ctx.notice('Svg uploaded successfully!')
    return
  }

  async function saveRawSvg(rawSvg: string) {
    if (!rawSvg || !isSvg(rawSvg)) {
      return
    }

    const newSvg: SvgUpload = {
      id: uuid(),
      filename: filename,
      type: 'svg',
      raw: rawSvg,
    }

    try {
      setIsUploading(true)
      await saveNewSvg(newSvg)
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

    const svgData = new Blob([rawSvg], { type: 'image/svg+xml' })
    const svgFile = new File([svgData], filename)

    try {
      setIsUploading(true)
      const svgUpload = await datoClient.uploads.createFromFileOrBlob({
        fileOrBlob: svgFile,
        filename: `${filename}.svg`,
      })

      const newSvg: SvgUpload = {
        id: uuid(),
        filename,
        type: 'image',
        imageId: svgUpload.id,
        url: svgUpload.url,
        raw: rawSvg,
      }

      await saveNewSvg(newSvg)
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
    if (svg.type === 'image') {
      await removeImageSvg(svg.imageId)
    }

    const newSvgs = pluginParameters.svgs?.filter((item) => item.id !== svg.id)
    await ctx.updatePluginParameters({
      ...pluginParameters,
      svgs: newSvgs,
    })

    await setUpdatedSvgArray(ctx, newSvgs)
    ctx.notice('Svg deleted successfully!')
  }

  async function openUploadModal(svg: SvgUpload) {
    let item = null
    if (svg.type === 'image') {
      item = await ctx.editUpload(svg.imageId)
    }

    if (item && item.deleted) {
      await deleteSvg(svg)
    }

    if (item && item.attributes.basename !== svg.filename) {
      await renameSvg({ ...svg, filename: item.attributes.basename })
    }
  }

  async function openCustomModal(svg: SvgUpload) {
    let item: null | (SvgUpload & { deleted?: boolean }) = null
    if (svg.type === 'svg') {
      item = (await ctx.openModal({
        id: customModalId,
        title: 'Raw details',
        width: 's',
        parameters: { rawSvg: svg },
      })) as SvgUpload & { deleted?: boolean }
    }

    if (item && item.deleted) {
      await deleteSvg(svg)
    }

    if (item && item.filename !== svg.filename) {
      await renameSvg({ ...svg, filename: item.filename })
    }
  }

  async function renameSvg(svg: SvgUpload) {
    const renamedSvgArray = pluginParameters.svgs?.map((item) => {
      if (item.id === svg.id) {
        return { ...item, filename: svg.filename }
      }
      return item
    })
    await ctx.updatePluginParameters({
      ...pluginParameters,
      svgs: renamedSvgArray,
    })
    ctx.notice('Svg renamed successfully!')
  }

  async function handleUpload(rawSvg: string) {
    if (uploadToMediaLibrary) {
      await saveSvgAsImage(rawSvg)
      return
    }

    await saveRawSvg(rawSvg)
  }

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
                    onChange={(newValue) => setUploadToMediaLibrary(newValue)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <h3 className="h2">Uploaded svgs</h3>

        {pluginParameters.svgs?.length === 0 && <p>Nothing to show (yet)</p>}
        <ImageList
          svgs={pluginParameters.svgs}
          onDelete={isRemoving ? undefined : deleteSvg}
          onShowUpload={openUploadModal}
          onShowRaw={openCustomModal}
          isLoading={isRemoving}
          showTag
        />
      </div>
    </Canvas>
  )
}
