import { Canvas } from 'datocms-react-ui'
import { RenderModalCtx } from 'datocms-plugin-sdk'
import { ModalParameters, SvgUpload } from '../../lib/types'
import { RawSvgViewer } from '../../components/RawSvgViewer/RawSvgViewer'

type Props = {
  ctx: RenderModalCtx
}

export default function CustomModal({ ctx }: Props) {
  const modalParameters: ModalParameters = ctx.parameters

  function handleDelete(returnValue: SvgUpload) {
    ctx.resolve({ ...returnValue, deleted: true })
  }

  function handleRename(returnValue: SvgUpload) {
    ctx.resolve(returnValue)
  }

  return (
    <Canvas ctx={ctx}>
      {modalParameters.rawSvg ? (
        <RawSvgViewer
          svg={modalParameters.rawSvg}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      ) : (
        <p>Nothing to show here</p>
      )}
    </Canvas>
  )
}
