import React from 'react';
import type { PerformanceMetrics } from '../../types/game';

interface MetricsCardProps {
  metrics: PerformanceMetrics | null;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="card" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 20px' }}>
        <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>📈</div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Algorithm Performance Metrics</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
          Select <strong>BFS</strong> or <strong>DFS</strong> and click <strong>🤖 AI Solve</strong> to observe their differences.
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Algorithm', value: metrics.algorithm },
    { label: 'States Generated', value: metrics.statesGenerated.toString() },
    { label: 'States Expanded', value: metrics.statesExpanded.toString() },
    { label: 'Solution Length', value: `${metrics.solutionLength} steps` },
    { label: 'Planning Time', value: `${metrics.planningTimeMs}ms` },
    { label: 'Solution Status', value: metrics.solutionFound ? '✓ Found' : '✗ Not Found' },
  ];

  const isBfs = metrics.algorithm === 'BFS';

  return (
    <div className="card">
      <div className="card-title">
        <span className="card-title-icon">📈</span>
        Performance &amp; Algorithm Comparison
        <span
          className={`badge ${isBfs ? 'badge-success' : 'badge-warning'}`}
          style={{ marginLeft: 'auto', fontSize: '0.72rem' }}
        >
          {isBfs ? '🏆 BFS (Optimal)' : '⚠️ DFS (Depth Detour)'}
        </span>
      </div>

      <div className="metrics-grid">
        {items.map((item) => (
          <div key={item.label} className="metric-item">
            <div
              className="metric-value"
              style={{
                fontSize: item.value.length > 5 ? '1.05rem' : '1.35rem',
                color: item.label === 'Solution Status'
                  ? (metrics.solutionFound ? 'var(--success)' : 'var(--error)')
                  : (item.label === 'Solution Length'
                    ? (isBfs ? 'var(--success)' : '#d97706')
                    : undefined),
              }}
            >
              {item.value}
            </div>
            <div className="metric-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Difference between BFS and DFS side-by-side callout */}
      <div style={{
        marginTop: '14px',
        padding: '12px',
        borderRadius: 'var(--radius-md)',
        background: isBfs ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${isBfs ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8rem', color: isBfs ? '#065f46' : '#92400e', marginBottom: '6px' }}>
          <span>{isBfs ? '🟢 BFS Behavior in this Scenario:' : '🟠 DFS Behavior in this Scenario:'}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
          {isBfs ? (
            <>
              <strong>Shortest Path Guaranteed:</strong> BFS expands states level-by-level using a FIFO queue. It explores all 1-step, 2-step, and 3-step transitions before 4-step ones, guaranteeing that the solution found ({metrics.solutionLength} actions) is strictly the minimum possible.
            </>
          ) : (
            <>
              <strong>Suboptimal Depth Exploration:</strong> DFS commits deeply down its first branch using a LIFO stack. In this problem, it explores jumping onto the box immediately before pushing it, discovering the banana is out of reach, climbing down, and then repositioning the box ({metrics.solutionLength} actions).
            </>
          )}
        </p>
      </div>

      {/* Comparative Matrix Table */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          BFS vs DFS Key Differences
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', color: '#334155' }}>
          <thead>
            <tr style={{ background: 'var(--ai-bg)', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Aspect</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--success)' }}>BFS</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: '#d97706' }}>DFS</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '5px 8px', fontWeight: 600 }}>Path Quality</td>
              <td style={{ padding: '5px 8px', color: 'var(--success)' }}>Optimal (Shortest)</td>
              <td style={{ padding: '5px 8px', color: '#d97706' }}>Suboptimal (+2 Detour)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '5px 8px', fontWeight: 600 }}>Data Structure</td>
              <td style={{ padding: '5px 8px' }}>FIFO Queue</td>
              <td style={{ padding: '5px 8px' }}>LIFO Stack</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '5px 8px', fontWeight: 600 }}>Exploration Order</td>
              <td style={{ padding: '5px 8px' }}>Shallowest first (breadth)</td>
              <td style={{ padding: '5px 8px' }}>Deepest first (depth)</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 8px', fontWeight: 600 }}>Memory (Space)</td>
              <td style={{ padding: '5px 8px' }}>O(b<sup>d</sup>) Exponential</td>
              <td style={{ padding: '5px 8px' }}>O(b·m) Linear</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetricsCard;
