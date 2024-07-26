import type { AwesomeFontIconIdentifier } from 'datocms-plugin-sdk'
import { PageType, PlacementType } from './types'

export const defaultPageGroupName = 'Plugin'
export const defaultPageName = 'Upload SVG'
export const defaultPageSlug = 'svg-uploader'
export const defaultIconName: AwesomeFontIconIdentifier = 'file-upload'
export const customModalId = 'svg-raw-viewer-modal'
export const defaultFilename = 'New SVG'

export const pageTypeOptions = [
  { label: 'Top menu', value: PageType.MainNavigationTabs },
  { label: 'Side menu', value: PageType.ContentAreaSidebarItems },
  { label: 'Settings menu', value: PageType.SettingsAreaSidebarItemGroups },
]

export const placementOptions = [
  { label: 'Before menu item', value: PlacementType.Before },
  { label: 'After menu item', value: PlacementType.After },
]

export const contentAreaSidebarItemPlacement = [
  { label: 'Menu items', value: PlacementType.MenuItems },
  { label: 'Seo preferences', value: PlacementType.SeoPreferences },
]

export const settingsAreaSidebarItemPlacement = [
  { label: 'Properties', value: PlacementType.Properties },
  { label: 'Permissions', value: PlacementType.Permissions },
]

export const mainNavigationTabPlacement = [
  { label: 'Content', value: PlacementType.Content },
  { label: 'Media', value: PlacementType.Media },
  { label: 'Schema', value: PlacementType.Schema },
  { label: 'Configuration', value: PlacementType.Configuration },
  { label: 'CDA Playground', value: PlacementType.CdaPlayground },
]
