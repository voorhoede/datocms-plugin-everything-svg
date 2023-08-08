import { PageType, MenuItemPlacementOption } from './types'
import {
  settingsAreaSidebarItemPlacement,
  contentAreaSidebarItemPlacement,
  mainNavigationTabPlacement,
} from './constants'

export function getMenuItemPlacements(
  pageType: PageType,
): MenuItemPlacementOption[] {
  if (pageType === PageType.SettingsAreaSidebarItemGroups) {
    return settingsAreaSidebarItemPlacement
  }

  if (pageType === PageType.ContentAreaSidebarItems) {
    return contentAreaSidebarItemPlacement
  }

  return mainNavigationTabPlacement
}
