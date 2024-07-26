import get from 'lodash/get'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Button, Canvas } from 'datocms-react-ui'
import { ImageList } from '../../components/ImageList/ImageList'
import { FieldParameters, GlobalParameters, SvgUpload } from '../../lib/types'
import { ImageViewer } from '../../components/ImageViewer/ImageViewer'

import * as styles from './FieldExtension.module.css'

type Props = {
  ctx: RenderFieldExtensionCtx
}

export default function FieldExtension({ ctx }: Props) {
  const fieldValue: string = String(get(ctx.formValues, ctx.fieldPath))
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const fieldParameters: FieldParameters = ctx.parameters
  const svgs = fieldParameters.showAllSvgs
    ? pluginParameters.svgs
    : fieldParameters.selectedSvgs

  function handleClick(image: SvgUpload) {
    ctx.setFieldValue(ctx.fieldPath, image.raw)
  }

  function handleDelete() {
    ctx.setFieldValue(ctx.fieldPath, '')
  }

  let content = <p>No SVG images to show</p>

  if (fieldValue) {
    content = (
      <div className={styles.content}>
        <ImageViewer
          size="s"
          image={{ id: ctx.field.id, raw: fieldValue, type: 'svg' }}
          onDelete={handleDelete}
        />
      </div>
    )
  }

  if (!fieldValue && svgs && svgs.length > 0) {
    content = <ImageList svgs={svgs} onClick={handleClick} size="s" />
  }

  return <Canvas ctx={ctx}>{content}</Canvas>
}
