export const BLOG_SLUGS = [
  "what-champion-should-i-play",
  "lol-random-challenge",
  "fun-lol-challenges",
  "best-champions-for-top-lane",
  "mid-lane-champions-guide",
  "adc-champions-guide",
  "best-support-champions",
  "how-to-improve-at-league",
  "aram-champion-pool",
  "champions-that-counter",
  "what-is-my-main",
  "fun-lol-challenges-with-friends",
  "how-to-climb-ranked",
  "lol-tier-list-current-patch",
  "best-champions-for-beginners",
  "how-to-farm-in-league",
  "understanding-lane-matchups",
  "champion-rotation-guide",
]

export const blogKeywords: Record<string, string[]> = {
  "what-champion-should-i-play": ["what champion should i play lol","league of legends random champion generator","lol random champion generator","random champion picker lol","what champion should i main in league"],
  "lol-random-challenge": ["lol random challenge ideas","league of legends random challenge","lol roulette challenge","random champion challenge league","fun lol challenges with friends"],
  "fun-lol-challenges": ["fun ways to play league of legends","fun lol challenges","league of legends challenge ideas","random champion generator lol fun","lol games to play with friends"],
  "best-champions-for-top-lane": ["best top lane champions","top lane champions current patch","top lane carry champions","how to climb ranked top lane"],
  "mid-lane-champions-guide": ["mid lane champions","best mid lane champions","control mage guide"],
  "adc-champions-guide": ["best ADC champions","ADC carry guide","hyper carry champions"],
  "best-support-champions": ["best support champions","current patch support","engage support guide"],
  "how-to-improve-at-league": ["how to improve at league of legends","loL improvement tips","climb ranked ladder"],
  "aram-champion-pool": ["ARAM champion pool","best ARAM champions"],
  "champions-that-counter": ["champions that counter","lane counters league of legends"],
  "what-is-my-main": ["what is my main league of legends","lol quiz main role"],
  "fun-lol-challenges-with-friends": ["fun lol challenges with friends","lol challenges with friends"],
  "how-to-climb-ranked": ["how to climb ranked league","ranked climb guide"],
  "lol-tier-list-current-patch": ["lol tier list current patch","champion tier list"],
  "best-champions-for-beginners": ["best champions for beginners","easy league champions"],
  "how-to-farm-in-league": ["how to farm in league of legends","last hitting guide"],
  "understanding-lane-matchups": ["lane matchups league of legends","champion matchups"],
  "champion-rotation-guide": ["champion rotation guide","free champions this week"],
}

export const BLOG_META: Record<string, { date: string; author: string; lane: string; tags: string[] }> = {
  "what-champion-should-i-play": { date: "2026-01-15", author: "League Roulette Team", lane: "top-lane", tags: ["random-champion", "beginner-guide", "champion-select"] },
  "lol-random-challenge": { date: "2026-01-22", author: "League Roulette Team", lane: "all-lanes", tags: ["challenge", "fun", "game-modes"] },
  "fun-lol-challenges": { date: "2026-02-01", author: "League Roulette Team", lane: "all-lanes", tags: ["challenge", "friends", "social"] },
  "best-champions-for-top-lane": { date: "2026-02-10", author: "League Roulette Team", lane: "top-lane", tags: ["top-lane", "champions", "guide"] },
  "mid-lane-champions-guide": { date: "2026-02-18", author: "League Roulette Team", lane: "mid-lane", tags: ["mid-lane", "champions", "guide"] },
  "adc-champions-guide": { date: "2026-02-25", author: "League Roulette Team", lane: "adc", tags: ["adc", "carry", "guide"] },
  "best-support-champions": { date: "2026-03-05", author: "League Roulette Team", lane: "support", tags: ["support", "engage", "peel"] },
  "how-to-improve-at-league": { date: "2026-03-12", author: "League Roulette Team", lane: "all-lanes", tags: ["improvement", "tips", "skills"] },
  "aram-champion-pool": { date: "2026-03-20", author: "League Roulette Team", lane: "aram", tags: ["aram", "champion-pool", "howling-abbys"] },
  "champions-that-counter": { date: "2026-03-28", author: "League Roulette Team", lane: "all-lanes", tags: ["counters", "matchups", "strategy"] },
  "what-is-my-main": { date: "2026-04-05", author: "League Roulette Team", lane: "all-lanes", tags: ["quiz", "main-role", "self-discovery"] },
  "fun-lol-challenges-with-friends": { date: "2026-04-12", author: "League Roulette Team", lane: "all-lanes", tags: ["friends", "social", "challenge"] },
  "how-to-climb-ranked": { date: "2026-04-20", author: "League Roulette Team", lane: "all-lanes", tags: ["ranked", "climb", "mmr"] },
  "lol-tier-list-current-patch": { date: "2026-04-28", author: "League Roulette Team", lane: "all-lanes", tags: ["tier-list", "meta", "patch"] },
  "best-champions-for-beginners": { date: "2026-05-05", author: "League Roulette Team", lane: "all-lanes", tags: ["beginners", "easy-champions", "tutorial"] },
  "how-to-farm-in-league": { date: "2026-05-12", author: "League Roulette Team", lane: "all-lanes", tags: ["farming", "cs", "last-hitting"] },
  "understanding-lane-matchups": { date: "2026-05-20", author: "League Roulette Team", lane: "all-lanes", tags: ["matchups", "lane", "strategy"] },
  "champion-rotation-guide": { date: "2026-05-28", author: "League Roulette Team", lane: "all-lanes", tags: ["champion-rotation", "free-champions"] },
}

export function getLaneForSlug(slug: string): string {
  return BLOG_META[slug]?.lane || "all-lanes"
}

export function getTagsForSlug(slug: string): string[] {
  return BLOG_META[slug]?.tags || []
}

export function getBlogMeta(slug: string) {
  return BLOG_META[slug] || { date: "2026-01-15", author: "League Roulette Team", lane: "all-lanes", tags: [] }
}
