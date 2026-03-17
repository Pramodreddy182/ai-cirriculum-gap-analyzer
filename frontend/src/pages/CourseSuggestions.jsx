import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats } from '../api';
import { HiOutlineLightBulb, HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineMinusCircle } from 'react-icons/hi';

const ImpactBadge = ({ impact }) => {
  const colors = {
    High: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    Medium: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    Low: { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee' },
  };
  const c = colors[impact] || colors.Medium;
  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
      {impact} Impact
    </span>
  );
};

export default function CourseSuggestions() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setReport(res.latest_analysis?.faculty_report))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Course Suggestions</h1>
        {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Course Update Suggestions</h1>
        <div className="glass" style={{ padding: 60, borderRadius: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>💡</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginTop: 16 }}>No Suggestions Yet</h2>
          <p style={{ color: '#94a3b8' }}>Run an analysis to generate course update suggestions for faculty.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Course Update Suggestions</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>AI-generated recommendations for faculty to align curriculum with industry</p>
      </motion.div>

      {/* Faculty Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass"
        style={{ padding: 24, borderRadius: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <HiOutlineExclamationCircle size={22} color="#818cf8" />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Executive Summary</h3>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7 }}>{report.summary}</p>

        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <div className="glass-light" style={{ padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#6366f1' }}>{report.curriculum_coverage}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Coverage</div>
          </div>
          <div className="glass-light" style={{ padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{report.total_curriculum_skills}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Skills Taught</div>
          </div>
          <div className="glass-light" style={{ padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#06b6d4' }}>{report.total_industry_skills}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Industry Requires</div>
          </div>
          <div className="glass-light" style={{ padding: '12px 20px', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{report.readiness_score}%</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Readiness Score</div>
          </div>
        </div>
      </motion.div>

      {/* Priority Additions */}
      {report.priority_additions?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass"
          style={{ padding: 24, borderRadius: 20, borderLeft: '4px solid #ef4444' }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>
            🎯 High-Priority Skill Additions
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {report.priority_additions.map((item, i) => (
              <motion.div
                key={item.skill}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="badge-missing"
                style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {item.skill}
                <span style={{ fontSize: 10, opacity: 0.7 }}>({item.demand_percentage}%)</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Course Update Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
          <HiOutlineLightBulb size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: '#fbbf24' }} />
          Category-Wise Suggestions
        </h3>

        {report.course_update_suggestions?.map((suggestion, i) => (
          <motion.div
            key={suggestion.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="glass card-hover"
            style={{ padding: 24, borderRadius: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{suggestion.category}</h4>
              <ImpactBadge impact={suggestion.impact} />
            </div>

            <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
              {suggestion.recommendation}
            </p>

            <div>
              <h5 style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Missing Skills in this Category:</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggestion.missing_skills?.map(skill => (
                  <span key={skill} className="badge-missing" style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12 }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skills Not In Demand */}
      {report.skills_not_in_demand?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass"
          style={{ padding: 24, borderRadius: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <HiOutlineMinusCircle size={20} color="#fbbf24" />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Skills Taught but Low Industry Demand</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>
            These skills are in the curriculum but not prominently requested in current job postings. Consider reviewing their emphasis.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {report.skills_not_in_demand.map(skill => (
              <span key={skill} className="badge-excess" style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12 }}>
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
