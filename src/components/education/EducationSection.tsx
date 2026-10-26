import React, { useState } from 'react';

const EDU_TOPICS = [
  {
    icon: '🐒',
    title: 'The Problem',
    text: 'A monkey in a room sees a banana hanging from the ceiling, out of reach. A wooden box sits on the floor. The monkey must figure out a sequence of actions to get the banana. This is a classic AI planning benchmark problem.',
  },
  {
    icon: '🗺️',
    title: 'State Space',
    text: 'The state space is the set of all possible configurations. Each state describes: monkey position (Left/Center/Right), box position, whether the monkey is on the box, and whether the banana is collected.',
  },
  {
    icon: '🎯',
    title: 'Goal State',
    text: 'The goal is achieved when hasBanana === true. The AI planner searches the state space for a path from the initial state to any goal state.',
  },
  {
    icon: '⚙️',
    title: 'Actions & Preconditions',
    text: 'WALK: Monkey moves left/right (only on floor). PUSH BOX: Monkey moves box to adjacent position (must be at box). CLIMB: Monkey gets on box (must be at same tile). GRAB: Monkey takes banana (must be on box, at banana position).',
  },
  {
    icon: '🔍',
    title: 'BFS (Breadth-First Search)',
    text: 'BFS explores all states at depth 1 before depth 2, and so on. It is guaranteed to find the shortest solution (fewest actions). It uses a queue (FIFO) and a visited set to avoid revisiting states.',
  },
  {
    icon: '🌊',
    title: 'DFS (Depth-First Search)',
    text: 'DFS explores one path as deeply as possible before backtracking. It uses a stack (LIFO). DFS may find a solution faster in some cases but does not guarantee the shortest path.',
  },
  {
    icon: '🧩',
    title: 'Why BFS Finds Shortest Path',
    text: 'Because BFS processes states level by level, the first time it reaches the goal state is guaranteed to be via the shortest path (in terms of number of actions). This is optimal for unweighted state graphs.',
  },
  {
    icon: '📦',
    title: 'Why the Box is Necessary',
    text: 'The banana hangs too high for the monkey to reach from the floor. The GRAB BANANA action requires monkeyOnBox === true. The box acts as a platform — without it, the goal state is unreachable.',
  },
  {
    icon: '🔗',
    title: 'Solution Path',
    text: 'A typical solution: (1) Walk to box position, (2) Push box under banana, (3) Climb onto box, (4) Grab banana. The exact path depends on the initial positions. The AI computes this dynamically.',
  },
  {
    icon: '✅',
    title: 'Valid vs Invalid Actions',
    text: 'An action is valid only if all its preconditions are satisfied. For example, CLIMB requires the monkey to be on the floor AND at the box position. Attempting GRAB from the floor is always invalid.',
  },
];

const EducationSection: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="edu-section">
      <h2 className="edu-title">
        <span>📚</span>
        Understanding the Monkey and Banana Problem
      </h2>
      <p className="edu-subtitle">
        An introduction to AI planning, state-space search, and the BFS/DFS algorithms — written for second-year CS students.
      </p>

      {/* ACADEMIC REPORT DOWNLOAD BANNER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#ecfdf5',
        border: '1.5px solid #a7f3d0',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '18px',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📄</span> Comprehensive Academic Project PDF Report
          </div>
          <div style={{ fontSize: '0.76rem', color: '#047857', marginTop: '2px' }}>
            Complete formal state-space formulation, action preconditions, and BFS vs. DFS comparative analysis.
          </div>
        </div>
        <a
          href="/Monkey_and_Banana_AI_Explanation.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: '7px 15px', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ⬇️ Download PDF Report
        </a>
      </div>

      <div className="edu-grid">
        {EDU_TOPICS.map((topic, idx) => (
          <div
            key={idx}
            className="edu-card"
            style={{ cursor: 'pointer' }}
            onClick={() => setExpanded(expanded === idx ? null : idx)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setExpanded(expanded === idx ? null : idx)}
            role="button"
            aria-expanded={expanded === idx}
          >
            <span className="edu-card-icon">{topic.icon}</span>
            <h3 className="edu-card-title">{topic.title}</h3>
            <p className="edu-card-text" style={{
              maxHeight: expanded === idx ? '300px' : '3.6em',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}>
              {topic.text}
            </p>
            <div style={{
              marginTop: '8px',
              fontSize: '0.72rem',
              color: 'var(--jungle-mid)',
              fontWeight: 600,
            }}>
              {expanded === idx ? '▲ Show less' : '▼ Read more'}
            </div>
          </div>
        ))}
      </div>

      {/* Algorithm comparison table */}
      <div style={{
        marginTop: '24px',
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--panel-border)',
        overflow: 'hidden',
        boxShadow: 'var(--panel-shadow)',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--panel-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--jungle-dark)' }}>
            BFS vs DFS — Algorithm Comparison
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--ai-bg)' }}>
                {['Property', 'BFS', 'DFS'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--jungle-dark)', borderBottom: '1px solid var(--panel-border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Data Structure', 'Queue (FIFO)', 'Stack (LIFO)'],
                ['Shortest Path?', '✅ Always', '❌ Not guaranteed'],
                ['Memory Usage', 'Higher (stores all frontier)', 'Lower (stores one path)'],
                ['Completeness', '✅ Complete', '✅ Complete (with visited set)'],
                ['Optimality', '✅ Optimal (uniform cost)', '❌ Not optimal'],
                ['Best For', 'Shortest solution', 'Deep state spaces'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--panel-border)', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '8px 16px', color: j === 0 ? 'var(--jungle-dark)' : '#4b5563', fontWeight: j === 0 ? 600 : 400 }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EducationSection;
