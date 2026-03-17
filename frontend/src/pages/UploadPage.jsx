import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineBriefcase, HiOutlinePlay, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { uploadSyllabus, uploadJobs, getSyllabi, getJobPostings, runAnalysis } from '../api';
import { useNavigate } from 'react-router-dom';

const SAMPLE_SYLLABUS = `Course: Introduction to Machine Learning
Topics covered:
- Python programming and NumPy arrays
- Data preprocessing and feature engineering
- Supervised learning: Linear Regression, Logistic Regression, Decision Trees
- Unsupervised learning: K-Means Clustering, PCA
- Model evaluation and cross-validation
- Introduction to Neural Networks and Deep Learning
- Statistics and Probability fundamentals
- Data Visualization using Matplotlib and Seaborn
- Version Control with Git`;

const SAMPLE_JOBS = `Senior ML Engineer - Tech Corp
Requirements:
- Strong Python and SQL skills
- Experience with TensorFlow or PyTorch for model training
- MLOps: Docker, Kubernetes, CI/CD pipelines
- Model deployment using FastAPI or Flask
- Experience with MLflow for experiment tracking
- Cloud platforms: AWS or GCP
- Knowledge of Large Language Models and Prompt Engineering
- Data pipeline development with Apache Spark
- REST API design and microservices architecture
- Agile methodologies and Git version control`;

export default function UploadPage() {
  const navigate = useNavigate();
  const [syllabusText, setSyllabusText] = useState('');
  const [jobText, setJobText] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploadedSyllabi, setUploadedSyllabi] = useState([]);
  const [uploadedJobs, setUploadedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(1); // 1=upload, 2=review, 3=done
  const [error, setError] = useState('');

  const onDropSyllabus = useCallback(files => {
    if (files[0]) setSyllabusFile(files[0]);
  }, []);
  const onDropJob = useCallback(files => {
    if (files[0]) setJobFile(files[0]);
  }, []);

  const { getRootProps: getSyllabusProps, getInputProps: getSyllabusInput, isDragActive: isSyllabusDrag } = useDropzone({
    onDrop: onDropSyllabus,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const { getRootProps: getJobProps, getInputProps: getJobInput, isDragActive: isJobDrag } = useDropzone({
    onDrop: onDropJob,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/json': ['.json'] },
    maxFiles: 1,
  });

  const handleUploadSyllabus = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await uploadSyllabus(syllabusFile, syllabusText, courseName || 'Uploaded Course');
      setUploadedSyllabi(prev => [...prev, res]);
      setSyllabusText('');
      setSyllabusFile(null);
      setCourseName('');
    } catch (e) {
      setError('Failed to upload syllabus: ' + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const handleUploadJob = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await uploadJobs(jobFile, jobText, jobTitle || 'Job Posting');
      if (res.postings) {
        setUploadedJobs(prev => [...prev, ...res.postings]);
      } else {
        setUploadedJobs(prev => [...prev, res]);
      }
      setJobText('');
      setJobFile(null);
      setJobTitle('');
    } catch (e) {
      setError('Failed to upload job posting: ' + (e.response?.data?.detail || e.message));
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (uploadedSyllabi.length === 0 || uploadedJobs.length === 0) {
      setError('Upload at least one syllabus and one job posting first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const syllabusIds = uploadedSyllabi.map(s => s.id);
      const jobIds = uploadedJobs.map(j => j.id);
      await runAnalysis(syllabusIds, jobIds);
      setStep(3);
      setTimeout(() => navigate('/gap-analysis'), 2000);
    } catch (e) {
      setError('Analysis failed: ' + (e.response?.data?.detail || e.message));
    }
    setAnalyzing(false);
  };

  const loadSample = () => {
    setSyllabusText(SAMPLE_SYLLABUS);
    setJobText(SAMPLE_JOBS);
    setCourseName('Introduction to Machine Learning');
    setJobTitle('Senior ML Engineer');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1000 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Upload & Analyze</h1>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Upload syllabi and job postings to analyze skill gaps</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadSample}
            style={{
              padding: '10px 20px', borderRadius: 12, border: '1px solid #334155',
              background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}
          >
            Load Sample Data
          </motion.button>
        </div>
      </motion.div>

      {/* Progress steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
      >
        {[
          { n: 1, label: 'Upload Data' },
          { n: 2, label: 'Review Skills' },
          { n: 3, label: 'View Results' },
        ].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700,
              background: step >= s.n ? 'linear-gradient(135deg, #6366f1, #06b6d4)' : '#1e293b',
              color: step >= s.n ? '#fff' : '#64748b',
              border: step >= s.n ? 'none' : '1px solid #334155',
            }}>
              {step > s.n ? <HiOutlineCheck size={16} /> : s.n}
            </div>
            <span style={{ fontSize: 13, color: step >= s.n ? '#f1f5f9' : '#64748b', fontWeight: step === s.n ? 600 : 400 }}>
              {s.label}
            </span>
            {i < 2 && <div style={{ width: 40, height: 2, background: step > s.n ? '#6366f1' : '#334155', borderRadius: 1 }} />}
          </div>
        ))}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <HiOutlineX size={16} /> {error}
        </motion.div>
      )}

      {step === 3 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass"
          style={{ padding: 60, borderRadius: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <HiOutlineCheck size={40} color="#fff" />
          </motion.div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Analysis Complete!</h2>
          <p style={{ color: '#94a3b8' }}>Redirecting to Gap Analysis...</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Syllabus Upload */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass"
            style={{ flex: 1, minWidth: 400, padding: 24, borderRadius: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineDocumentText size={20} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Syllabus</h2>
            </div>

            <input
              type="text"
              placeholder="Course name (e.g., Machine Learning 101)"
              value={courseName}
              onChange={e => setCourseName(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: 13, marginBottom: 12, outline: 'none',
              }}
            />

            {/* Dropzone */}
            <div
              {...getSyllabusProps()}
              style={{
                padding: 24, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                border: `2px dashed ${isSyllabusDrag ? '#6366f1' : '#334155'}`,
                background: isSyllabusDrag ? 'rgba(99,102,241,0.05)' : 'transparent',
                marginBottom: 12, transition: 'all 0.2s',
              }}
            >
              <input {...getSyllabusInput()} />
              <HiOutlineCloudUpload size={32} color="#64748b" />
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>
                {syllabusFile ? `📄 ${syllabusFile.name}` : 'Drop PDF/TXT or click to browse'}
              </p>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 8 }}>— or paste text —</div>

            <textarea
              placeholder="Paste syllabus content here..."
              value={syllabusText}
              onChange={e => setSyllabusText(e.target.value)}
              rows={6}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadSyllabus}
              disabled={loading || (!syllabusFile && !syllabusText)}
              style={{
                width: '100%', padding: '12px 0', marginTop: 12, borderRadius: 12,
                background: (!syllabusFile && !syllabusText) ? '#334155' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', border: 'none', cursor: (!syllabusFile && !syllabusText) ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 14,
              }}
            >
              {loading ? 'Uploading...' : 'Upload Syllabus'}
            </motion.button>

            {/* Uploaded list */}
            <AnimatePresence>
              {uploadedSyllabi.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: 10, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ color: '#34d399', fontWeight: 600 }}>✓ {s.filename || 'Syllabus'}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.skill_count} skills extracted</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Job Posting Upload */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass"
            style={{ flex: 1, minWidth: 400, padding: 24, borderRadius: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HiOutlineBriefcase size={20} color="#22d3ee" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Job Postings</h2>
            </div>

            <input
              type="text"
              placeholder="Job title (e.g., Senior ML Engineer)"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: 13, marginBottom: 12, outline: 'none',
              }}
            />

            <div
              {...getJobProps()}
              style={{
                padding: 24, borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                border: `2px dashed ${isJobDrag ? '#06b6d4' : '#334155'}`,
                background: isJobDrag ? 'rgba(6,182,212,0.05)' : 'transparent',
                marginBottom: 12, transition: 'all 0.2s',
              }}
            >
              <input {...getJobInput()} />
              <HiOutlineCloudUpload size={32} color="#64748b" />
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>
                {jobFile ? `📄 ${jobFile.name}` : 'Drop PDF/TXT/JSON or click'}
              </p>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 8 }}>— or paste text —</div>

            <textarea
              placeholder="Paste job posting content here..."
              value={jobText}
              onChange={e => setJobText(e.target.value)}
              rows={6}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
              }}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUploadJob}
              disabled={loading || (!jobFile && !jobText)}
              style={{
                width: '100%', padding: '12px 0', marginTop: 12, borderRadius: 12,
                background: (!jobFile && !jobText) ? '#334155' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: '#fff', border: 'none', cursor: (!jobFile && !jobText) ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: 14,
              }}
            >
              {loading ? 'Uploading...' : 'Upload Job Posting'}
            </motion.button>

            <AnimatePresence>
              {uploadedJobs.map((j, i) => (
                <motion.div
                  key={j.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    marginTop: 10, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                    fontSize: 13,
                  }}
                >
                  <div style={{ color: '#22d3ee', fontWeight: 600 }}>✓ {j.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{j.skill_count} skills extracted</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Analyze Button */}
      {step < 3 && uploadedSyllabi.length > 0 && uploadedJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              padding: '16px 48px', borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 16,
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 0 20px rgba(99,102,241,0.3)',
            }}
          >
            {analyzing ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⏳</motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <HiOutlinePlay size={20} />
                Run Gap Analysis
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
