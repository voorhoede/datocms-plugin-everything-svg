export enum PageType {
  MainNavigationTabs = 'mainNavigationTabs',
  ContentAreaSidebarItems = 'contentAreaSidebarItems',
  SettingsAreaSidebarItemGroups = 'settingsAreaSidebarItemGroups',
}

export enum PlacementType {
  Before = 'before',
  After = 'after',
  MenuItems = 'menuItems',
  Settings = 'settings',
  Environment = 'environment',
  Project = 'project',
  Permissions = 'permissions',
  Webhooks = 'webhooks',
  Deployment = 'deployment',
  SSO = 'sso',
  AuditLog = 'auditLog',
  Usage = 'usage',
  Content = 'content',
  MediaArea = 'mediaArea',
  ApiExplorer = 'apiExplorer',
}

export type GlobalParameters = {
  placement?: PlacementOption
  menuItemPlacement?: MenuItemPlacementOption
  pageType?: PageTypeOption
  svgs?: SvgUpload[]
}

export type FieldParameters = {
  selectedSvgs?: SvgUpload[]
  showAllSvgs?: boolean
}

export type ModalParameters = {
  rawSvg?: SvgUpload
}

export type SvgUpload = {
  id: string
  filename?: string
  raw: string
} & (
  | {
      type: 'image'
      imageId: string
      url: string
    }
  | {
      type: 'svg'
    }
)

export type PageTypeOption = {
  value: PageType
  label: string
}

export type PlacementOption = {
  value: PlacementType.Before | PlacementType.After
  label: string
}

export type MenuItemPlacementOption = {
  value: Omit<PlacementType, PlacementType.Before | PlacementType.After>
  label: string
}

export type SVGIcon = {
  id: string
}
