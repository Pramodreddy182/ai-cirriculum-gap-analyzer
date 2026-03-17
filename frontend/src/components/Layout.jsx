import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineChartBar,
  HiOutlineCloudUpload,
  HiOutlineSearchCircle,
  HiOutlineAcademicCap,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import AnimatedBackground from './AnimatedBackground';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineChartBar },
  { path: '/upload', label: 'Upload & Analyze', icon: HiOutlineCloudUpload },
  { path: '/gap-analysis', label: 'Gap Analysis', icon: HiOutlineSearchCircle },
  { path: '/student-report', label: 'Student Report', icon: HiOutlineAcademicCap },
  { path: '/course-suggestions', label: 'Course Suggestions', icon: HiOutlineLightBulb },
];

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="glass"
        style={{
          width: 260,
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '8px 12px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800,
          }}>
            CG
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>CurriculumGap</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>AI Analyzer</div>
          </div>
        </motion.div>

        {/* Nav items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item, i) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: isActive ? '#f1f5f9' : '#94a3b8',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.2s ease',
                })}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid rgba(148,163,184,0.1)' }}>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
            AI-Powered Analysis
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 260,
        padding: '32px 40px',
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
