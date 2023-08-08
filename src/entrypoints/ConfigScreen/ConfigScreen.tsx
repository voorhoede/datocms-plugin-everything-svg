import { useMemo } from 'react'

import { RenderConfigScreenCtx } from 'datocms-plugin-sdk'
import { Canvas, Form, SelectField, FieldGroup } from 'datocms-react-ui'
import {
  GlobalParameters,
  PageTypeOption,
  PlacementOption,
  MenuItemPlacementOption,
} from '../../lib/types'
import { pageTypeOptions, placementOptions } from '../../lib/constants'
import { getMenuItemPlacements } from '../../lib/helpers'

type Props = {
  ctx: RenderConfigScreenCtx
}

export default function ConfigScreen({ ctx }: Props) {
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters

  const selectedPageType = pluginParameters?.pageType || pageTypeOptions[0]
  const selectedPlacement = pluginParameters?.placement || placementOptions[0]

  const selectedMenuItemPlacement = useMemo(() => {
    return (
      pluginParameters?.menuItemPlacement ||
      getMenuItemPlacements(selectedPageType.value)[0]
    )
  }, [pluginParameters?.menuItemPlacement, selectedPageType.value])

  function saveSettings(settingToSave: Partial<GlobalParameters>) {
    ctx.updatePluginParameters({
      ...pluginParameters,
      ...settingToSave,
    })
    ctx.notice('Settings updated successfully!')
  }

  return (
    <Canvas ctx={ctx}>
      <p>This DatoCMS plugin</p>

      <Form>
        <FieldGroup>
          <SelectField
            name="pageType"
            id="pageType"
            label="Where do you want to show the menu item?"
            value={selectedPageType}
            selectInputProps={{
              options: pageTypeOptions,
            }}
            onChange={(newValue) => {
              const pageTypeValue = newValue as PageTypeOption
              saveSettings({
                pageType: pageTypeValue,
                menuItemPlacement: getMenuItemPlacements(
                  pageTypeValue.value,
                )[0],
              })
            }}
          />

          <SelectField
            name="placement"
            id="placement"
            label="Show the menu item before or after the other menu items?"
            value={selectedPlacement}
            selectInputProps={{
              options: placementOptions,
            }}
            onChange={(newValue) => {
              const placementValue = newValue as PlacementOption
              saveSettings({
                placement: placementValue,
              })
            }}
          />

          <SelectField
            name="menuItemPlacement"
            id="menuItemPlacement"
            label={`${
              selectedPlacement.value === 'before' ? 'Before' : 'After'
            } which menu item do you want to show the menu item?`}
            value={selectedMenuItemPlacement}
            selectInputProps={{
              options: getMenuItemPlacements(selectedPageType.value),
            }}
            onChange={(newValue) => {
              const menuItemPlacementValue = newValue as MenuItemPlacementOption
              saveSettings({ menuItemPlacement: menuItemPlacementValue })
            }}
          />
        </FieldGroup>
      </Form>
    </Canvas>
  )
}
