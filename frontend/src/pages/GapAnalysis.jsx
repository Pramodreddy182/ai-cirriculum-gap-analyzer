import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getDashboardStats } from '../api';

export default function GapAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('missing');

  useEffect(() => {
    getDashboardStats()
      .then(res => setData(res.latest_analysis))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Gap Analysis</h1>
        {[1, 2, 3].map(i => <div key={i} className="shimmer" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Gap Analysis</h1>
        <div className="glass" style={{ padding: 60, borderRadius: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 64 }}>🔍</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginTop: 16 }}>No Analysis Data</h2>
          <p style={{ color: '#94a3b8' }}>Upload syllabi and job postings first, then run an analysis.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'missing', label: '🔴 Missing Skills', count: data.missing_skills?.length || 0 },
    { key: 'overlap', label: '🟢 Overlap Skills', count: data.overlap_skills?.length || 0 },
    { key: 'excess', label: '🟡 Excess Skills', count: data.excess_skills?.length || 0 },
  ];

  const currentSkills = tab === 'missing' ? data.missing_skills : tab === 'overlap' ? data.overlap_skills : data.excess_skills;
  const badgeClass = tab === 'missing' ? 'badge-missing' : tab === 'overlap' ? 'badge-present' : 'badge-excess';

  // Categorize skills for radar chart
  const categories = {};
  const allSkills = [...(data.curriculum_skills || []), ...(data.industry_skills || [])];
  allSkills.forEach(s => {
    const cat = getCategory(s);
    if (!categories[cat]) categories[cat] = { curriculum: 0, industry: 0 };
  });
  (data.curriculum_skills || []).forEach(s => { categories[getCategory(s)].curriculum++; });
  (data.industry_skills || []).forEach(s => { categories[getCategory(s)].industry++; });

  const radarData = Object.entries(categories).map(([cat, v]) => ({
    category: cat.length > 12 ? cat.substring(0, 12) + '…' : cat,
    Curriculum: v.curriculum,
    Industry: v.industry,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Gap Analysis</h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Detailed comparison of curriculum vs industry skill requirements</p>
      </motion.div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Readiness Score', value: `${data.readiness_score}%`, color: data.readiness_score >= 70 ? '#10b981' : data.readiness_score >= 40 ? '#f59e0b' : '#ef4444', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Missing Skills', value: data.missing_skills?.length || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Shared Skills', value: data.overlap_skills?.length || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Excess Skills', value: data.excess_skills?.length || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass card-hover"
            style={{ flex: 1, minWidth: 160, padding: 20, borderRadius: 16, textAlign: 'center' }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass"
        style={{ padding: 28, borderRadius: 20 }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>Skill Category Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar name="Curriculum" dataKey="Curriculum" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            <Radar name="Industry" dataKey="Industry" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#6366f1' }} /> Curriculum
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#06b6d4' }} /> Industry
          </div>
        </div>
      </motion.div>

      {/* Skill Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass"
        style={{ padding: 28, borderRadius: 20 }}
      >
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: tab === t.key ? '#f1f5f9' : '#94a3b8',
                fontWeight: tab === t.key ? 600 : 400, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Skill badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {currentSkills?.map((skill, i) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={badgeClass}
              style={{ padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}
            >
              {skill}
            </motion.span>
          ))}
          {(!currentSkills || currentSkills.length === 0) && (
            <p style={{ color: '#64748b', fontSize: 14 }}>No skills in this category</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* Utility: guess skill category */
function getCategory(skill) {
  const map = {
    'Programming Languages': ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'SQL', 'R', 'MATLAB', 'HTML', 'CSS', 'Bash', 'Kotlin', 'Swift', 'PHP', 'Dart'],
    'Frameworks': ['React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'TailwindCSS', 'Bootstrap', 'Flutter', 'React Native'],
    'ML / AI': ['Machine Learning', 'Deep Learning', 'Artificial Intelligence', 'Neural Networks', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Natural Language Processing', 'Computer Vision', 'Large Language Models', 'GPT', 'BERT', 'Transformer Architecture', 'Prompt Engineering', 'RAG', 'MLOps', 'MLflow'],
    'Data Science': ['Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Data Visualization', 'Statistics', 'Probability', 'EDA', 'Data Preprocessing', 'Feature Engineering'],
    'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'GitHub Actions', 'Linux', 'Microservices', 'Serverless'],
    'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Redis', 'Elasticsearch', 'Firebase', 'NoSQL'],
    'Software Eng': ['Git', 'Version Control', 'REST APIs', 'GraphQL', 'Agile', 'Scrum', 'System Design', 'Data Structures', 'Algorithms', 'Object-Oriented Programming', 'Design Patterns', 'TDD', 'Clean Code', 'API Design'],
  };
  for (const [cat, skills] of Object.entries(map)) {
    if (skills.includes(skill)) return cat;
  }
  return 'Other';
}
