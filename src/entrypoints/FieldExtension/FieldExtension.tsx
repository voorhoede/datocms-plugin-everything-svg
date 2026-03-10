import { useState, useEffect } from 'react'
import get from 'lodash/get'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas, Spinner } from 'datocms-react-ui'
import { ImageList } from '../../components/ImageList/ImageList'
import {
  FieldParameters,
  GlobalParameters,
  SvgUpload,
  SvgRecord,
} from '../../lib/types'
import { ImageViewer } from '../../components/ImageViewer/ImageViewer'
import { loadSvgRecords, recordToSvgUpload } from '../../lib/recordHelpers'

import * as styles from './FieldExtension.module.css'

type Props = {
  ctx: RenderFieldExtensionCtx
}

export default function FieldExtension({ ctx }: Props) {
  const fieldValue: string = String(get(ctx.formValues, ctx.fieldPath))
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const fieldParameters: FieldParameters = ctx.parameters

  const [svgRecords, setSvgRecords] = useState<SvgRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load SVG records on mount
  useEffect(() => {
    async function loadSvgs() {
      if (
        !pluginParameters.svgModelId ||
        !ctx.currentUserAccessToken ||
        !pluginParameters.isSetupComplete
      ) {
        // Fall back to parameter-based SVGs if model not set up
        setIsLoading(false)
        return
      }

      try {
        const records = await loadSvgRecords(
          ctx.currentUserAccessToken,
          pluginParameters.svgModelId,
          ctx.environment,
        )
        setSvgRecords(records)
      } catch (error) {
        console.error('Error loading SVG records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSvgs()
  }, [
    pluginParameters.svgModelId,
    pluginParameters.isSetupComplete,
    ctx.currentUserAccessToken,
  ])

  function handleClick(image: SvgUpload) {
    ctx.setFieldValue(ctx.fieldPath, image.raw)
  }

  function handleDelete() {
    ctx.setFieldValue(ctx.fieldPath, '')
  }

  // Convert records to SvgUpload format
  const svgsFromRecords = svgRecords.map(recordToSvgUpload)

  // Fallback to parameter-based SVGs if records not loaded yet or setup not complete
  const parameterSvgs = fieldParameters.showAllSvgs
    ? pluginParameters.svgs
    : fieldParameters.selectedSvgs

  // Use records if available, otherwise use parameter-based SVGs
  const svgs =
    svgsFromRecords.length > 0 || pluginParameters.isSetupComplete
      ? svgsFromRecords
      : parameterSvgs || []

  let content = <p>No SVG images to show</p>

  if (isLoading) {
    content = <Spinner />
  } else if (fieldValue) {
    content = (
      <div className={styles.content}>
        <ImageViewer
          size="s"
          image={{ id: ctx.field.id, raw: fieldValue, type: 'svg' }}
          onDelete={handleDelete}
        />
      </div>
    )
  } else if (svgs && svgs.length > 0) {
    content = <ImageList svgs={svgs} onClick={handleClick} size="s" />
  }

  return <Canvas ctx={ctx}>{content}</Canvas>
}
