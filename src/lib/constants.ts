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
  { label: 'Settings', value: PlacementType.Settings },
]

export const settingsAreaSidebarItemPlacement = [
  { label: 'Environment', value: PlacementType.Environment },
  { label: 'Project', value: PlacementType.Project },
  { label: 'Permissions', value: PlacementType.Permissions },
  { label: 'Webhooks', value: PlacementType.Webhooks },
  { label: 'Deployment', value: PlacementType.Deployment },
  { label: 'SSO', value: PlacementType.SSO },
  { label: 'Audit log', value: PlacementType.AuditLog },
  { label: 'Usage', value: PlacementType.Usage },
]

export const mainNavigationTabPlacement = [
  { label: 'Content', value: PlacementType.Content },
  { label: 'Media', value: PlacementType.MediaArea },
  { label: 'CDA Playground', value: PlacementType.ApiExplorer },
  { label: 'Settings', value: PlacementType.Settings },
]
