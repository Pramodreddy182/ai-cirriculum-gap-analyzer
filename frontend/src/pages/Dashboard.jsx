import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineDocumentText, HiOutlineBriefcase, HiOutlineChartBar, HiOutlineCheck } from 'react-icons/hi';
import { getDashboardStats } from '../api';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass card-hover"
    style={{
      padding: 24, borderRadius: 16, flex: 1, minWidth: 200,
      display: 'flex', alignItems: 'center', gap: 16,
    }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: `${color}20`, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#94a3b8' }}>{label}</div>
    </div>
  </motion.div>
);

const ScoreRing = ({ score, size = 160, delay = 0.5 }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="score-ring-bg" fill="none" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius}
          fill="none" strokeWidth="8" stroke={color}
          className="score-ring"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: 'round' }}
        />
        <text x="60" y="55" textAnchor="middle" fill="#f1f5f9" fontSize="24" fontWeight="800">{score}%</text>
        <text x="60" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10">Readiness</text>
      </svg>
    </motion.div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800 }}>Dashboard</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer" style={{ height: 96, flex: 1, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    );
  }

  const latest = stats?.latest_analysis;
  const hasData = latest != null;

  // Build bar chart data
  const barData = [];
  if (hasData) {
    const allSkills = new Set([...latest.curriculum_skills, ...latest.industry_skills]);
    allSkills.forEach(skill => {
      barData.push({
        name: skill.length > 15 ? skill.substring(0, 15) + '…' : skill,
        fullName: skill,
        Curriculum: latest.curriculum_skills.includes(skill) ? 1 : 0,
        Industry: latest.industry_skills.includes(skill) ? 1 : 0,
      });
    });
    barData.sort((a, b) => (b.Industry + b.Curriculum) - (a.Industry + a.Curriculum));
  }

  // Build pie data
  const pieData = hasData ? [
    { name: 'Overlap', value: latest.overlap_count, color: '#10b981' },
    { name: 'Missing', value: latest.missing_count, color: '#ef4444' },
    { name: 'Excess', value: latest.excess_count, color: '#f59e0b' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Overview of curriculum analysis and skill gap metrics
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard icon={HiOutlineDocumentText} label="Syllabi Uploaded" value={stats?.total_syllabi || 0} color="#6366f1" delay={0.1} />
        <StatCard icon={HiOutlineBriefcase} label="Job Postings" value={stats?.total_job_postings || 0} color="#06b6d4" delay={0.2} />
        <StatCard icon={HiOutlineChartBar} label="Analyses Run" value={stats?.total_analyses || 0} color="#10b981" delay={0.3} />
        <StatCard icon={HiOutlineCheck} label="Readiness Score" value={hasData ? `${latest.readiness_score}%` : 'N/A'} color="#f59e0b" delay={0.4} />
      </div>

      {!hasData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass"
          style={{
            padding: 60, borderRadius: 20, textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}
        >
          <div style={{ fontSize: 64 }}>📊</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>No Analysis Yet</h2>
          <p style={{ color: '#94a3b8', maxWidth: 400 }}>
            Upload syllabi and job postings, then run an analysis to see your dashboard come to life.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Charts Row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Score Ring + Pie */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass"
              style={{ padding: 28, borderRadius: 20, flex: '0 0 320px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Readiness Score</h3>
              <ScoreRing score={latest.readiness_score} size={180} delay={0.6} />

              <div style={{ width: '100%', marginTop: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 12, textAlign: 'center' }}>Skill Distribution</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bar chart */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass"
              style={{ padding: 28, borderRadius: 20, flex: 1, minWidth: 400 }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>
                Curriculum vs Industry Skills
              </h3>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={barData.slice(0, 20)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v === 1 ? '✓' : '✗'} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                    formatter={(value, name) => [value ? 'Present' : 'Absent', name]}
                  />
                  <Bar dataKey="Curriculum" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Industry" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Missing Skills Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass"
            style={{ padding: 28, borderRadius: 20 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>
              🔴 Top Missing Skills (Industry demands, not in curriculum)
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {latest.missing_skills.slice(0, 20).map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="badge-missing"
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
