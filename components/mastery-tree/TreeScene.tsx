'use client'

import { memo, useMemo } from 'react'
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { championIconUrl } from '@/lib/champion-data'
import type {
  ExplorerLayout,
  ExplorerMode,
  ExplorerNode,
  ExplorerRole,
} from '@/lib/mastery-tree/explorer-types'
import {
  ROLE_COLORS,
  ROLE_GLYPHS,
  clamp,
  getLevelStyle,
} from '@/lib/mastery-tree/visuals'

const RING_START = 366
const RING_GAP = 152

export interface TreeSceneProps {
  layout: ExplorerLayout
  mode: ExplorerMode
  selectedId: number | null
  hoveredId: number | null
  matchIds: Set<number>
  searchActive: boolean
  roleFilter: ExplorerRole | 'all'
  showBranches: boolean
  showNames: boolean
  locale: string
  roleLabels: Record<ExplorerRole, string>
  centerLabel: string
  centerSub: string
  rootLabel: string
  openDetailsLabel: string
  onNodeClick: (node: ExplorerNode, event: ReactMouseEvent<SVGGElement>) => void
  onNodeEnter: (node: ExplorerNode, event: ReactPointerEvent<SVGGElement>) => void
  onNodeLeave: () => void
}

function NodeVisual({
  node,
  roleLabel,
  numberFormatter,
  isSelected,
  isHovered,
  isMatch,
  isDimmed,
  showNames,
  showBadge,
  rootLabel,
  openDetailsLabel,
  onNodeClick,
  onNodeEnter,
  onNodeLeave,
}: {
  node: ExplorerNode
  roleLabel: string
  numberFormatter: Intl.NumberFormat
  isSelected: boolean
  isHovered: boolean
  isMatch: boolean
  isDimmed: boolean
  showNames: boolean
  showBadge: boolean
  rootLabel: string
  openDetailsLabel: string
  onNodeClick: (node: ExplorerNode, event: ReactMouseEvent<SVGGElement>) => void
  onNodeEnter: (node: ExplorerNode, event: ReactPointerEvent<SVGGElement>) => void
  onNodeLeave: () => void
}) {
  const role = ROLE_COLORS[node.primaryRole]
  const level = getLevelStyle(node.level)
  const badgeRadius = clamp(node.radius * 0.26, 7, 20)
  const badgeOffset = node.radius * 0.72
  const showLabel =
    node.isCenter ||
    showNames ||
    isSelected ||
    isHovered ||
    isMatch ||
    (node.points !== null && node.rank <= 5)
  const labelSize = node.isCenter ? 24 : isSelected ? 13 : 11
  const pointsLabel =
    node.points !== null ? numberFormatter.format(node.points) : null
  const aria = [
    node.name,
    roleLabel,
    node.level !== null ? `M${node.level}` : null,
    pointsLabel,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className={[
        'mt-node',
        isDimmed ? 'is-dimmed' : '',
        isMatch ? 'is-match' : '',
      ].join(' ')}
      role="button"
      tabIndex={0}
      aria-label={`${aria}. ${openDetailsLabel}`}
      onClick={(event) => onNodeClick(node, event)}
      onPointerEnter={(event) => onNodeEnter(node, event)}
      onPointerLeave={onNodeLeave}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onNodeClick(node, event as unknown as ReactMouseEvent<SVGGElement>)
        }
      }}
    >
      <g className="mt-node-inner">
        <circle r={node.radius + 7} fill="transparent" />

        {node.isCenter && (
          <>
            <circle
              r={node.radius + 64}
              fill="url(#mt-sun-glow)"
              pointerEvents="none"
            />
            <g pointerEvents="none">
              {Array.from({ length: 20 }).map((_, ray) => (
                <line
                  key={ray}
                  x1={0}
                  y1={-(node.radius + 20)}
                  x2={0}
                  y2={-(node.radius + 38)}
                  stroke="#f0c75e"
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.28}
                  transform={`rotate(${ray * 18})`}
                />
              ))}
            </g>
            <circle
              r={node.radius + 12}
              fill="none"
              stroke="url(#mt-gold-ring)"
              strokeWidth={2}
              strokeDasharray="10 14"
              className="mt-aura"
            />
            <circle
              r={node.radius + 22}
              fill="none"
              stroke="rgba(240, 199, 94, 0.13)"
              strokeWidth={1}
            />
            <text
              y={-(node.radius + 46)}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              letterSpacing="2.4"
              fill="#f0c75e"
              opacity={0.8}
            >
              {rootLabel.toUpperCase()}
            </text>
          </>
        )}

        <circle
          r={node.radius + 4}
          fill="none"
          stroke={node.isCenter ? '#f0c75e' : role.color}
          strokeWidth={node.isCenter ? 2.2 : 1.2}
          opacity={node.isCenter ? 0.42 : 0.24}
        />
        <circle
          r={node.radius + 2}
          fill={role.soft}
          className={node.isCenter ? 'mt-node-glow' : undefined}
        />
        <circle
          r={node.radius}
          fill="#090512"
          stroke={node.isCenter ? '#f0c75e' : role.color}
          strokeWidth={node.isCenter ? 3 : 2}
        />

        <clipPath id={`mt-clip-${node.championId}`}>
          <circle r={Math.max(1, node.radius - 2)} />
        </clipPath>
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={node.radius * 0.7}
          fontWeight={800}
          fill={role.color}
        >
          {node.name.charAt(0)}
        </text>
        <image
          href={championIconUrl(node.key)}
          x={-node.radius + 2}
          y={-node.radius + 2}
          width={(node.radius - 2) * 2}
          height={(node.radius - 2) * 2}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#mt-clip-${node.championId})`}
        />
        <circle
          r={Math.max(1, node.radius - 2)}
          fill="url(#mt-node-shade)"
          pointerEvents="none"
        />
        <circle
          r={node.radius}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={1}
          pointerEvents="none"
        />

        {isSelected && (
          <circle
            r={node.radius + 10}
            fill="none"
            stroke="#f0c75e"
            strokeWidth={2}
            strokeDasharray="4 8"
            className="mt-pulse"
          />
        )}

        {isMatch && !isSelected && (
          <circle
            r={node.radius + 8}
            fill="none"
            stroke="#f0c75e"
            strokeWidth={1.5}
            opacity={0.9}
            className="mt-pulse"
          />
        )}

        {showBadge && node.level !== null && !node.isCenter && (
          <g transform={`translate(${badgeOffset} ${badgeOffset})`}>
            <circle
              r={badgeRadius}
              fill="#08040f"
              stroke={level.color}
              strokeWidth={1.6}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={badgeRadius * 1.08}
              fontWeight={800}
              fill={level.color}
            >
              {node.level}
            </text>
          </g>
        )}

        {node.isCenter && node.level !== null && (
          <g transform={`translate(${badgeOffset} ${badgeOffset})`}>
            <circle
              r={badgeRadius}
              fill="#08040f"
              stroke={level.color}
              strokeWidth={2}
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={badgeRadius * 1.08}
              fontWeight={800}
              fill={level.color}
            >
              {node.level}
            </text>
          </g>
        )}

        {showLabel && (
          <g pointerEvents="none">
            <text
              y={node.radius + (node.isCenter ? 23 : 18)}
              textAnchor="middle"
              fontSize={labelSize}
              fontWeight={700}
              fill={node.isCenter ? '#f7e2a4' : '#f5f3ff'}
              stroke="#08040f"
              strokeWidth={node.isCenter ? 4 : 3}
              strokeLinejoin="round"
              style={{ paintOrder: 'stroke' }}
            >
              {node.name}
            </text>
            {node.isCenter && pointsLabel && (
              <text
                y={node.radius + 43}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={level.color}
                stroke="#08040f"
                strokeWidth={3}
                strokeLinejoin="round"
                style={{ paintOrder: 'stroke' }}
              >
                {pointsLabel}
              </text>
            )}
          </g>
        )}
      </g>
    </g>
  )
}

function TreeScene({
  layout,
  mode,
  selectedId,
  hoveredId,
  matchIds,
  searchActive,
  roleFilter,
  showBranches,
  showNames,
  locale,
  roleLabels,
  centerLabel,
  centerSub,
  rootLabel,
  openDetailsLabel,
  onNodeClick,
  onNodeEnter,
  onNodeLeave,
}: TreeSceneProps) {
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const stars = useMemo(() => {
    const count = 150
    const radius = layout.extent * 1.14
    return Array.from({ length: count }, (_, index) => {
      const angle = index * 2.399963229728653
      const distance = Math.sqrt((index + 0.5) / count) * radius
      const size = 0.5 + (((index * 37) % 9) / 9) * 1.6
      const tint =
        index % 13 === 0 ? '#f0c75e' : index % 7 === 0 ? '#4fd1ef' : '#ffffff'
      return {
        id: index,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        tint,
        opacity: 0.08 + (((index * 53) % 10) / 10) * 0.26,
      }
    })
  }, [layout.extent])

  const roleVisible = (role: ExplorerRole) =>
    roleFilter === 'all' || roleFilter === role

  const orderedNodes = useMemo(() => {
    return [...layout.nodes].sort((a, b) => {
      if (a.isCenter) return 1
      if (b.isCenter) return -1
      return a.rank - b.rank
    })
  }, [layout.nodes])

  return (
    <>
      <defs>
        <radialGradient id="mt-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c75e" stopOpacity="0.15" />
          <stop offset="42%" stopColor="#7c3aed" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#05030d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mt-sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0c75e" stopOpacity="0.24" />
          <stop offset="42%" stopColor="#c89b3c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#c89b3c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mt-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0c75e" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#c89b3c" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="mt-node-shade" cx="50%" cy="36%" r="70%">
          <stop offset="52%" stopColor="#05030d" stopOpacity="0" />
          <stop offset="100%" stopColor="#05030d" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      <g pointerEvents="none">
        <circle r={layout.extent * 0.92} fill="url(#mt-core-glow)" />
      </g>

      <g pointerEvents="none" className="mt-stars">
        {stars.map((star) => (
          <circle
            key={star.id}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={star.tint}
            opacity={star.opacity}
          />
        ))}
      </g>

      <g pointerEvents="none" className="mt-guides">
        {[0, 1, 2, 3].map((ring) => (
          <circle
            key={ring}
            r={RING_START + ring * RING_GAP}
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth={1}
            strokeDasharray="2 18"
          />
        ))}
      </g>

      {showBranches && (
        <g pointerEvents="none" className="mt-edges">
          {layout.edges
            .filter((edge) => roleVisible(edge.role))
            .map((edge) => (
              <g key={edge.id}>
                {edge.kind === 'trunk' && (
                  <path
                    d={edge.path}
                    fill="none"
                    stroke="rgba(240, 199, 94, 0.08)"
                    strokeWidth={12}
                    strokeLinecap="round"
                  />
                )}
                <path
                  d={edge.path}
                  pathLength={1}
                  className="mt-edge"
                  fill="none"
                  stroke={edge.color}
                  strokeWidth={edge.width}
                  strokeLinecap="round"
                  style={{ animationDelay: `${edge.delay}s` }}
                />
              </g>
            ))}
        </g>
      )}

      <g pointerEvents="none">
        {mode === 'explore' && layout.centerNodeId === null && (
          <g className="mt-center-sigil">
            <circle r={layout.extent * 0.12} fill="url(#mt-sun-glow)" />
            <circle
              r={42}
              fill="rgba(8, 4, 15, 0.92)"
              stroke="url(#mt-gold-ring)"
              strokeWidth={2.4}
            />
            <circle
              r={52}
              fill="none"
              stroke="rgba(240, 199, 94, 0.18)"
              strokeWidth={1}
              strokeDasharray="4 10"
              className="mt-aura"
            />
            <path
              d="M-18 14 C-10 2 -4 8 0 -14 C4 8 10 2 18 14 M-11 19 C-5 12 0 15 0 22 C0 15 5 12 11 19"
              fill="none"
              stroke="#f0c75e"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.9}
            />
            <text
              y={78}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              letterSpacing="2.4"
              fill="#f0c75e"
            >
              {centerLabel.toUpperCase()}
            </text>
            <text
              y={96}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.4)"
            >
              {centerSub}
            </text>
          </g>
        )}
      </g>

      <g pointerEvents="none">
        {layout.hubs
          .filter((hub) => roleVisible(hub.role))
          .map((hub) => {
            const role = ROLE_COLORS[hub.role]
            return (
              <g
                key={hub.role}
                transform={`translate(${hub.x} ${hub.y})`}
                opacity={roleFilter === 'all' ? 0.96 : 1}
              >
                <circle r={hub.radius + 8} fill={role.soft} opacity={0.55} />
                <circle
                  r={hub.radius}
                  fill="rgba(8, 4, 15, 0.94)"
                  stroke={role.color}
                  strokeWidth={1.6}
                />
                <g transform="translate(-12 -15) scale(1)">
                  <path
                    d={ROLE_GLYPHS[hub.role]}
                    fill="none"
                    stroke={role.color}
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <text
                  y={hub.radius + 17}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  letterSpacing="1.6"
                  fill={role.color}
                >
                  {roleLabels[hub.role].toUpperCase()}
                </text>
                <text
                  y={hub.radius + 31}
                  textAnchor="middle"
                  fontSize={8}
                  fill="rgba(255,255,255,0.34)"
                >
                  {hub.count}
                </text>
              </g>
            )
          })}
      </g>

      <g>
        {orderedNodes.map((node) => {
          const visible =
            node.isCenter || roleVisible(node.primaryRole)
          if (!visible) return null

          const isSelected = node.championId === selectedId
          const isHovered = node.championId === hoveredId
          const isMatch = matchIds.has(node.championId)
          const isDimmed =
            searchActive && !isMatch && !isSelected && !isHovered

          return (
            <NodeVisual
              key={node.championId}
              node={node}
              roleLabel={roleLabels[node.primaryRole]}
              numberFormatter={numberFormatter}
              isSelected={isSelected}
              isHovered={isHovered}
              isMatch={isMatch}
              isDimmed={isDimmed}
              showNames={showNames}
              showBadge={node.level !== null}
              rootLabel={rootLabel}
              openDetailsLabel={openDetailsLabel}
              onNodeClick={onNodeClick}
              onNodeEnter={onNodeEnter}
              onNodeLeave={onNodeLeave}
            />
          )
        })}
      </g>
    </>
  )
}

export default memo(TreeScene)
