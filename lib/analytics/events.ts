type AnalyticsValue = string | number | boolean | undefined

type GtagWindow = Window & {
  gtag?: (command: 'event', name: string, params?: Record<string, AnalyticsValue>) => void
}

/**
 * Sends a small, privacy-conscious event through the GTM/gtag setup that is
 * already loaded by RootHead. No mastery values, champion lists or account
 * identifiers are sent.
 */
export function trackEvent(
  name: string,
  params?: Record<string, AnalyticsValue>,
): void {
  if (typeof window === 'undefined') return

  try {
    const target = window as GtagWindow
    target.gtag?.('event', name, params)
  } catch {
    // Analytics must never break the feature.
  }
}

export const ANALYTICS_EVENTS = {
  treeOpened: 'mastery_tree_opened',
  championSelected: 'mastery_tree_champion_selected',
  searchUsed: 'mastery_tree_search_used',
  filterChanged: 'mastery_tree_filter_changed',
  importSuccess: 'mastery_tree_import_success',
  shareClicked: 'mastery_tree_share_clicked',
  imageExported: 'mastery_tree_image_exported',
  linkCopied: 'mastery_tree_link_copied',
} as const
