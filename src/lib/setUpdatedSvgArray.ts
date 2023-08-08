import { FieldParameters, SvgUpload } from './types'

export default async function setUpdatedSvgArray(ctx: any, svgs?: SvgUpload[]) {
  const fields = await ctx.loadFieldsUsingPlugin()

  await Promise.all(
    fields.map(async (field: any) => {
      const fieldParameters: FieldParameters =
        field.attributes.appearance.parameters

      if (svgs && fieldParameters.selectedSvgs) {
        const newPluginArray = fieldParameters.selectedSvgs.filter((fieldSvg) =>
          svgs?.find((pluginSvg) => pluginSvg.id === fieldSvg.id),
        )

        await ctx.updateFieldAppearance(field.id, [
          {
            operation: 'updateEditor',
            newParameters: {
              ...fieldParameters,
              selectedSvgs: newPluginArray,
            },
          },
        ])
      }
    }),
  )
}
