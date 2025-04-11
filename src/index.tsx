import {
  connect,
  ContentAreaSidebarItem,
  FileFieldValue,
  IntentCtx,
  type ItemPresentationInfo,
  MainNavigationTab,
  OnBootCtx,
  RenderConfigScreenCtx,
  RenderFieldExtensionCtx,
  RenderManualFieldExtensionConfigScreenCtx,
  RenderModalCtx,
  RenderPageCtx,
  SettingsAreaSidebarItemGroup,
} from 'datocms-plugin-sdk'

import ConfigScreen from './entrypoints/ConfigScreen/ConfigScreen'
import PageScreen from './entrypoints/PageScreen/PageScreen'
import FieldExtensionConfigScreen from './entrypoints/FieldExtensionConfigScreen/FieldExtensionConfigScreen'
import FieldExtension from './entrypoints/FieldExtension/FieldExtension'
import CustomModal from './entrypoints/CustomModal/CustomModal'
import { render } from './lib/render'
import { GlobalParameters, PageType } from './lib/types'
import {
  contentAreaSidebarItemPlacement,
  customModalId,
  defaultIconName,
  defaultPageGroupName,
  defaultPageName,
  defaultPageSlug,
  mainNavigationTabPlacement,
  placementOptions,
  settingsAreaSidebarItemPlacement,
} from './lib/constants'
import setUpdatedSvgArray from './lib/setUpdatedSvgArray'

import './styles/index.css'

const fieldSettings = {
  id: 'svg-selector',
  name: 'SVG Selector',
}

connect({
  async onBoot(ctx: OnBootCtx) {
    const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
    await setUpdatedSvgArray(ctx, pluginParameters.svgs)
  },
  renderConfigScreen(ctx: RenderConfigScreenCtx) {
    return render(<ConfigScreen ctx={ctx} />)
  },
  mainNavigationTabs(ctx: IntentCtx) {
    const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters

    if (
      !ctx.currentRole.meta.final_permissions.can_edit_schema &&
      pluginParameters.pageType?.value !== PageType.MainNavigationTabs
    ) {
      return []
    }

    const placement = [
      pluginParameters.placement?.value || placementOptions[0].value,
      pluginParameters.menuItemPlacement?.value ||
        mainNavigationTabPlacement[0].value,
    ] as MainNavigationTab['placement']

    return [
      {
        label: defaultPageName,
        icon: defaultIconName,
        placement,
        pointsTo: {
          pageId: `${defaultPageSlug}--${ctx.plugin.id}`,
        },
      },
    ]
  },
  contentAreaSidebarItems(ctx: IntentCtx) {
    const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters

    if (
      !ctx.currentRole.meta.final_permissions.can_edit_schema &&
      pluginParameters.pageType?.value !== PageType.ContentAreaSidebarItems
    ) {
      return []
    }

    const placement = [
      pluginParameters.placement?.value || placementOptions[0].value,
      pluginParameters.menuItemPlacement?.value ||
        contentAreaSidebarItemPlacement[0].value,
    ] as ContentAreaSidebarItem['placement']

    return [
      {
        label: defaultPageName,
        icon: defaultIconName,
        placement,
        pointsTo: {
          pageId: `${defaultPageSlug}--${ctx.plugin.id}`,
        },
      },
    ]
  },
  settingsAreaSidebarItemGroups(ctx: IntentCtx) {
    const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters

    if (
      !ctx.currentRole.meta.final_permissions.can_edit_schema &&
      pluginParameters.pageType?.value !==
        PageType.SettingsAreaSidebarItemGroups
    ) {
      return []
    }

    const placement = [
      pluginParameters.placement?.value || placementOptions[0].value,
      pluginParameters.menuItemPlacement?.value ||
        settingsAreaSidebarItemPlacement[0].value,
    ] as SettingsAreaSidebarItemGroup['placement']

    return [
      {
        label: defaultPageGroupName,
        placement,
        items: [
          {
            label: defaultPageName,
            icon: defaultIconName,
            pointsTo: {
              pageId: `${defaultPageSlug}--${ctx.plugin.id}`,
            },
          },
        ],
      },
    ]
  },
  renderPage(pageId: string, ctx: RenderPageCtx) {
    if (pageId === `${defaultPageSlug}--${ctx.plugin.id}`) {
      return render(<PageScreen ctx={ctx} />)
    }
  },
  renderModal(modalId: string, ctx: RenderModalCtx) {
    switch (modalId) {
      case customModalId:
        return render(<CustomModal ctx={ctx} />)
    }
  },
  manualFieldExtensions() {
    return [
      {
        id: fieldSettings.id,
        name: fieldSettings.name,
        type: 'editor',
        fieldTypes: ['string', 'text'],
        configurable: true,
      },
    ]
  },
  renderManualFieldExtensionConfigScreen(
    _,
    ctx: RenderManualFieldExtensionConfigScreenCtx,
  ) {
    return render(<FieldExtensionConfigScreen ctx={ctx} />)
  },
  renderFieldExtension(_, ctx: RenderFieldExtensionCtx) {
    return render(<FieldExtension ctx={ctx} />)
  },

  // Render thumbnails in collections view
  buildItemPresentationInfo(item, ctx) {
    // We need to wrap it in an async IIFE because there's an `await ctx.loadFieldsUsingPlugin()` call later
    return (async () => {
      // This hook doesn't know which model we're on, so we have to look up its ID from the record
      const {
        relationships: {
          item_type: {
            data: { id: currentItemTypeId },
          },
        },
      } = item

      // ItemType info for the current model
      const currentItemType = ctx.itemTypes[currentItemTypeId]! // Plugin SDK will always load this

      // Get the default preview image, if there is one
      const defaultPreviewImageFieldId =
        currentItemType.relationships?.image_preview_field.data?.id
      const defaultPreviewImageFieldApiKey =
        defaultPreviewImageFieldId &&
        ctx.fields[defaultPreviewImageFieldId]?.attributes.api_key
      const defaultPreviewImage = defaultPreviewImageFieldApiKey
        ? (item.attributes[defaultPreviewImageFieldApiKey] as FileFieldValue)
        : null

      // Use the default preview image if there is one and skip all further processing
      if (defaultPreviewImage?.upload_id) {
        return undefined
      }

      // Get the record's title from its presentation attributes
      const titleFieldId = currentItemType.relationships?.title_field.data?.id
      const titleFieldApiKey =
        titleFieldId && ctx.fields[titleFieldId]?.attributes.api_key
      const title = titleFieldApiKey
        ? (item.attributes[titleFieldApiKey] as string)
        : ''

      // Find fields using this plugin in this model
      const fieldsWithAnyPlugin = await ctx.loadFieldsUsingPlugin()
      const thisPluginId = ctx.plugin.id
      const fieldsWithThisPlugin = fieldsWithAnyPlugin.filter(
        (field) => field.attributes.appearance.editor === thisPluginId,
      )

      // Get all fields of the current model
      const currentItemTypeFieldIds =
        currentItemType.relationships.fields.data.map(({ id }) => id)

      // Iterate through this model's plugin fields and find the first non-blank SVG
      const firstValidSvgFieldData = (() => {
        for (const { id } of fieldsWithThisPlugin) {
          const fieldApiKey = ctx.fields[id]?.attributes.api_key

          // Skip if this field isn't in the current model or doesn't have an API key
          if (!currentItemTypeFieldIds.includes(id) || !fieldApiKey) {
            continue
          }

          // Look up the field data from the current record
          const fieldData = item.attributes[fieldApiKey]

          // Try to trim it
          const trimmedField =
            typeof fieldData === 'string' ? fieldData.trim() : undefined

          // Skip this field if it's blank
          if (!trimmedField) {
            continue
          }

          return trimmedField // Can be a trimmed SVG string or undefined
        }
      })()

      // Fall back to the default preview if there's no SVG found
      if (!firstValidSvgFieldData) {
        return undefined
      }

      // Otherwise B64 encode it and return it as a data URL
      const b64svg = firstValidSvgFieldData
        ? btoa(firstValidSvgFieldData)
        : undefined
      const modifiedPreview: ItemPresentationInfo = {
        title: title,
        imageUrl: b64svg ? `data:image/svg+xml;base64,${b64svg}` : undefined,
      }
      return modifiedPreview
    })()
  },
})
