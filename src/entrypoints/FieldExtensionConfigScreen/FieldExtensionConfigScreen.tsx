import { useEffect, useState } from 'react'
import { RenderManualFieldExtensionConfigScreenCtx } from 'datocms-plugin-sdk'
import { Canvas, SwitchField } from 'datocms-react-ui'
import { FieldParameters, GlobalParameters, SvgUpload } from '../../lib/types'
import { ImageList } from '../../components/ImageList/ImageList'

import styles from './FieldExtensionConfigScreen.module.css'

type Props = {
  ctx: RenderManualFieldExtensionConfigScreenCtx
}

export default function FieldExtensionConfigScreen({ ctx }: Props) {
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const fieldParameters: FieldParameters = ctx.parameters
  const [selectedSvgs, setSelectedSvgs] = useState<SvgUpload[]>(
    fieldParameters.selectedSvgs || [],
  )
  const [showAllSvgs, setShowAllSvgs] = useState<boolean>(
    fieldParameters.showAllSvgs || false,
  )

  function toggleSelectedSvgs(image: SvgUpload) {
    if (selectedSvgs?.map((svg) => svg.id)?.includes(image.id)) {
      const svgs = selectedSvgs?.filter((svg) => svg.id !== image.id)
      setSelectedSvgs(svgs)
      return
    }

    setSelectedSvgs([...selectedSvgs, image])
  }

  useEffect(() => {
    ctx.setParameters({
      ...fieldParameters,
      selectedSvgs: showAllSvgs ? [] : selectedSvgs,
      showAllSvgs,
    })
  }, [selectedSvgs, showAllSvgs])

  return (
    <Canvas ctx={ctx}>
      <h2 className={styles.heading}>
        Select the svgs that are selectable for the user
      </h2>

      <div className={styles.switch}>
        <SwitchField
          name="showAllSvgs"
          id="showAllSvgs"
          label="Select all SVGs"
          hint="When this is selected you can select all SVGs uploaded in this field"
          value={showAllSvgs}
          onChange={setShowAllSvgs}
        />
      </div>
      <ImageList
        svgs={pluginParameters.svgs}
        activeSvgs={
          showAllSvgs ? pluginParameters.svgs : fieldParameters.selectedSvgs
        }
        onClick={toggleSelectedSvgs}
        disabled={showAllSvgs}
        showTag
      />
    </Canvas>
  )
}
