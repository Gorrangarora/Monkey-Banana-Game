import React, { useMemo, useState, useCallback } from 'react';
import type { SearchNode, SearchEdge } from '../../types/game';
import { formatActionLabel } from '../../game/gameLogic';

interface SearchTreeProps {
  nodes: SearchNode[];
  edges: SearchEdge[];
  currentNodeId?: string;
}

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  initial: { fill: '#dbeafe', stroke: '#3b82f6', text: '#1e40af' },
  explored: { fill: '#f0fdf4', stroke: '#86efac', text: '#166534' },
  active: { fill: '#fef9c3', stroke: '#facc15', text: '#713f12' },
  goal: { fill: '#dcfce7', stroke: '#22c55e', text: '#15803d' },
  rejected: { fill: '#fee2e2', stroke: '#fca5a5', text: '#991b1b' },
  'solution-path': { fill: '#fef3c7', stroke: '#f59e0b', text: '#92400e' },
};

const NODE_RADIUS = 18;
const LEVEL_HEIGHT = 80;
const NODE_GAP = 55;

interface LayoutNode {
  node: SearchNode;
  x: number;
  y: number;
}

function computeLayout(
  nodes: SearchNode[],
  edges: SearchEdge[]
): { layoutNodes: LayoutNode[]; width: number; height: number } {
  if (nodes.length === 0) return { layoutNodes: [], width: 300, height: 100 };

  // Build children map
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  for (const node of nodes) {
    if (!childrenMap.has(node.id)) childrenMap.set(node.id, []);
    if (node.parentId) {
      if (!childrenMap.has(node.parentId)) childrenMap.set(node.parentId, []);
      childrenMap.get(node.parentId)!.push(node.id);
      parentMap.set(node.id, node.parentId);
    }
  }

  // Group by depth
  const depthMap = new Map<number, string[]>();
  for (const node of nodes) {
    const d = node.depth;
    if (!depthMap.has(d)) depthMap.set(d, []);
    depthMap.get(d)!.push(node.id);
  }

  const maxDepth = Math.max(...Array.from(depthMap.keys()));
  const nodeMap = new Map<string, SearchNode>(nodes.map((n) => [n.id, n]));
  const layoutNodes: LayoutNode[] = [];
  const posMap = new Map<string, { x: number; y: number }>();

  // Cap displayed nodes to keep visualization readable
  const MAX_DISPLAY = 80;
  const displayedNodes = nodes.slice(0, MAX_DISPLAY);
  const displayedIds = new Set(displayedNodes.map((n) => n.id));

  // Layout by depth levels
  for (let d = 0; d <= maxDepth; d++) {
    const levelNodes = (depthMap.get(d) || []).filter((id) => displayedIds.has(id));
    const levelWidth = levelNodes.length * NODE_GAP;
    levelNodes.forEach((id, i) => {
      const x = -levelWidth / 2 + i * NODE_GAP + NODE_GAP / 2;
      const y = d * LEVEL_HEIGHT;
      posMap.set(id, { x, y });
    });
  }

  for (const node of displayedNodes) {
    const pos = posMap.get(node.id) || { x: 0, y: node.depth * LEVEL_HEIGHT };
    layoutNodes.push({ node, x: pos.x, y: pos.y });
  }

  // Compute bounding box
  const xs = layoutNodes.map((n) => n.x);
  const ys = layoutNodes.map((n) => n.y);
  const minX = Math.min(...xs) - NODE_RADIUS * 2;
  const maxX = Math.max(...xs) + NODE_RADIUS * 2;
  const maxY = Math.max(...ys) + NODE_RADIUS * 2;

  const width = Math.max(maxX - minX + 40, 300);
  const height = Math.max(maxY + 60, 100);

  // Shift to positive coords
  const offsetX = -minX + 20;
  const offsetY = NODE_RADIUS + 10;

  return {
    layoutNodes: layoutNodes.map((n) => ({
      ...n,
      x: n.x + offsetX,
      y: n.y + offsetY,
    })),
    width,
    height,
  };
}

interface TooltipState {
  node: SearchNode;
  x: number;
  y: number;
}

const SearchTree: React.FC<SearchTreeProps> = ({ nodes, edges }) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [scale, setScale] = useState(1);

  const { layoutNodes, width, height } = useMemo(
    () => computeLayout(nodes, edges),
    [nodes, edges]
  );

  const layoutMap = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    for (const n of layoutNodes) m.set(n.node.id, n);
    return m;
  }, [layoutNodes]);

  const displayedEdges = useMemo(() => {
    return edges.filter(
      (e) => layoutMap.has(e.fromId) && layoutMap.has(e.toId)
    );
  }, [edges, layoutMap]);

  const handleNodeClick = useCallback(
    (node: SearchNode, svgX: number, svgY: number) => {
      setTooltip((prev) =>
        prev?.node.id === node.id ? null : { node, x: svgX, y: svgY }
      );
    },
    []
  );

  if (nodes.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.8rem',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--panel-border)',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌳</div>
        The search tree will appear here after running AI Solve.
        <br />
        Each node represents a game state explored by the algorithm.
      </div>
    );
  }

  const legendItems = [
    { status: 'initial', label: 'Start' },
    { status: 'solution-path', label: 'Solution' },
    { status: 'goal', label: 'Goal' },
    { status: 'explored', label: 'Explored' },
    { status: 'rejected', label: 'Dead-end' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          padding: '8px 12px',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--panel-border)',
          marginBottom: '8px',
        }}
      >
        {legendItems.map((item) => (
          <div
            key={item.status}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#4b5563' }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: NODE_COLORS[item.status]?.fill,
                border: `2px solid ${NODE_COLORS[item.status]?.stroke}`,
              }}
            />
            {item.label}
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#94a3b8' }}>
          {nodes.length > 80 ? `Showing first 80 of ${nodes.length}` : `${nodes.length} nodes`}
        </span>
      </div>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', top: '48px', right: '8px', zIndex: 10, display: 'flex', gap: '4px' }}>
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 2))}
          className="btn btn-icon"
          style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
          className="btn btn-icon"
          style={{ width: '26px', height: '26px', fontSize: '0.9rem' }}
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setScale(1)}
          className="btn btn-icon"
          style={{ width: '26px', height: '26px', fontSize: '0.65rem' }}
          title="Reset zoom"
        >
          ⊡
        </button>
      </div>

      {/* SVG Tree */}
      <div
        style={{
          overflow: 'auto',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--panel-border)',
          maxHeight: '320px',
        }}
      >
        <svg
          width={width * scale}
          height={height * scale}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block' }}
        >
          {/* Edges */}
          {displayedEdges.map((edge, i) => {
            const from = layoutMap.get(edge.fromId);
            const to = layoutMap.get(edge.toId);
            if (!from || !to) return null;

            const toNode = to.node;
            const isSolutionEdge =
              toNode.status === 'solution-path' || toNode.status === 'goal';

            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isSolutionEdge ? '#f59e0b' : '#d1d5db'}
                strokeWidth={isSolutionEdge ? 2.5 : 1}
                strokeDasharray={isSolutionEdge ? undefined : '4,2'}
                opacity={0.7}
              />
            );
          })}

          {/* Nodes */}
          {layoutNodes.map(({ node, x, y }) => {
            const colors = NODE_COLORS[node.status] || NODE_COLORS.explored;
            const isGoal = node.status === 'goal';
            const isSolution = node.status === 'solution-path';

            return (
              <g
                key={node.id}
                className="search-node"
                onClick={() => handleNodeClick(node, x, y)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow for solution path */}
                {(isGoal || isSolution) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={NODE_RADIUS + 5}
                    fill={isGoal ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isSolution || isGoal ? 2.5 : 1.5}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={colors.text}
                  fontWeight="600"
                >
                  {node.status === 'goal' ? '🏆' : node.status === 'initial' ? 'S' : `d${node.depth}`}
                </text>
                {/* Action label on edge */}
                {node.action && (
                  <g>
                    <rect
                      x={x - 28}
                      y={y + NODE_RADIUS + 2}
                      width={56}
                      height={13}
                      rx={3}
                      fill={isSolution ? 'rgba(254, 243, 199, 0.95)' : 'rgba(255, 255, 255, 0.92)'}
                      stroke={isSolution ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth={isSolution ? 1.2 : 0.7}
                    />
                    <text
                      x={x}
                      y={y + NODE_RADIUS + 11}
                      textAnchor="middle"
                      fontSize="6.5"
                      fontWeight={isSolution ? '700' : '600'}
                      fill={isSolution ? '#92400e' : '#334155'}
                    >
                      {formatActionLabel(node.action)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="node-tooltip"
          style={{
            bottom: '8px',
            left: '8px',
            right: '8px',
            position: 'relative',
            marginTop: '8px',
          }}
        >
          <div className="node-tooltip-title">
            Node: {tooltip.node.status.replace('-', ' ').toUpperCase()}
          </div>
          <div className="node-tooltip-row">
            <span>Action:</span>
            <span>{tooltip.node.action?.description || 'Initial'}</span>
          </div>
          <div className="node-tooltip-row">
            <span>Depth:</span>
            <span>{tooltip.node.depth}</span>
          </div>
          <div className="node-tooltip-row">
            <span>🐒 Monkey:</span>
            <span>{tooltip.node.state.monkeyPosition}{tooltip.node.state.monkeyOnBox ? ' (on box)' : ''}</span>
          </div>
          <div className="node-tooltip-row">
            <span>📦 Box:</span>
            <span>{tooltip.node.state.boxPosition}</span>
          </div>
          <div className="node-tooltip-row">
            <span>🍌 Banana:</span>
            <span>{tooltip.node.state.hasBanana ? 'Collected!' : tooltip.node.state.bananaPosition}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTree;
