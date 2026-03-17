import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../api';
import { HiOutlineAcademicCap, HiOutlineExclamation, HiOutlineTrendingUp, HiOutlineBookOpen } from 'react-icons/hi';

const PriorityBadge = ({ priority }) => {
  const cls = `priority-${priority.toLowerCase()}`;
  return (
    <span className={cls} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {priority}
    </span>
  );
};

export default function StudentReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setReport(res.latest_analysis?.student_report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Student Report</h1>
        {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Student Report</h1>
        <div className="glass" style={{ padding: 60, borderRadius: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginTop: 16 }}>No Report Available</h2>
          <p style={{ color: '#94a3b8' }}>Run an analysis to generate your personalized student report.</p>
        </div>
      </div>
    );
  }

  const score = report.readiness_score;
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Personalized Student Report</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Your job readiness assessment based on your curriculum</p>
      </motion.div>

      {/* Summary + Score */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass"
          style={{ flex: '0 0 240px', padding: 28, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Job Readiness</h3>
          <svg width={160} height={160} viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#334155" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={radius} fill="none" strokeWidth="10" stroke={scoreColor}
              style={{
                strokeDasharray: circumference, strokeDashoffset: offset,
                strokeLinecap: 'round', transform: 'rotate(-90deg)', transformOrigin: '70px 70px',
                transition: 'stroke-dashoffset 1.5s ease',
              }}
            />
            <text x="70" y="65" textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="800">{score}%</text>
            <text x="70" y="85" textAnchor="middle" fill="#94a3b8" fontSize="11">Ready</text>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{report.skills_you_have?.length || 0}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Skills Matched</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>{report.total_missing || 0}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Skills Missing</div>
          </div>
        </motion.div>

        {/* Summary text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass"
          style={{ flex: 1, padding: 28, borderRadius: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HiOutlineAcademicCap size={24} color="#818cf8" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Assessment Summary</h3>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            {report.summary}
          </p>

          {/* Skills you have */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>✓ Skills You Have</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {report.skills_you_have?.map(skill => (
                <span key={skill} className="badge-present" style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Critical Gaps */}
      {report.critical_gaps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass"
          style={{ padding: 24, borderRadius: 20, borderLeft: '4px solid #ef4444' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HiOutlineExclamation size={22} color="#f87171" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>🚨 Critical Gaps — Address Immediately</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.critical_gaps.map((item, i) => (
              <motion.div
                key={item.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-light card-hover"
                style={{ padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge-missing" style={{ padding: '6px 14px', borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
                    {item.skill}
                  </span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Demanded in {item.demand_percentage}% of postings
                  </span>
                </div>
                <PriorityBadge priority={item.priority} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* All Missing Skills With Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass"
        style={{ padding: 24, borderRadius: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HiOutlineTrendingUp size={22} color="#22d3ee" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Skills to Learn (Prioritized)</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Skill', 'Category', 'Priority', 'Demand', 'Resource', 'Difficulty'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.skills_you_need?.map((item, i) => (
                <motion.tr
                  key={item.skill}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(51,65,85,0.5)' }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 13, color: '#f1f5f9' }}>{item.skill}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#94a3b8' }}>{item.category}</td>
                  <td style={{ padding: '12px 14px' }}><PriorityBadge priority={item.priority} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#cbd5e1' }}>{item.demand_percentage}%</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#818cf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HiOutlineBookOpen size={14} />
                      {item.learning_resource?.resource || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#94a3b8' }}>{item.learning_resource?.difficulty || 'N/A'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
