# League Roulette SEO Improvement - TODO

## [✅] 1. Update app/page.tsx (Main Landing - Priority 1) - **COMPLETE**
- [✅] Replace generic H1 → "Free Random LoL Champion Generator | League Roulette"
- [✅] Import & render `<SEOContent />` before blog section  
- [✅] Add "Free • Season 2026" badges above roulette
- [✅] Changes verified: H1 keywords, content rendered, no errors

## [✅] 2. Enhance components/SEOContent.tsx (Rich Content) - **COMPLETE** 
- [✅] Update sr-only H1 with 2026 keywords
- [✅] Add ARAM/ranked sections + challenge ideas
- [✅] Expand FAQ (9 total, schema-ready)
- [⚠️] Fix TS error "Line 102: Identifier expected"

## [ ] 3. Optimize app/layout.tsx (Metadata/Schema)  
- [ ] Refine title/description/keywords
- [ ] Add FAQPage schema JSON-LD

## [ ] 4. Test & Validate
- [ ] `npm run build && npm run start`
- [ ] PageSpeed Insights (LCP<2s, CLS<0.1)
- [ ] View source → verify H1, schema, content

## [ ] 5. Deploy & Monitor
- [ ] Resubmit sitemap to GSC
- [ ] Track impressions/CTR for long-tail keywords
