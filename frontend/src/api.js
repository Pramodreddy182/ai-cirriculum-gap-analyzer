import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Upload
export const uploadSyllabus = async (file, text, courseName) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);
  if (courseName) formData.append('course_name', courseName);
  const res = await api.post('/upload/syllabus', formData);
  return res.data;
};

export const uploadJobs = async (file, text, title) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (text) formData.append('text', text);
  if (title) formData.append('title', title);
  const res = await api.post('/upload/jobs', formData);
  return res.data;
};

export const getSyllabi = async () => {
  const res = await api.get('/upload/syllabi');
  return res.data;
};

export const getJobPostings = async () => {
  const res = await api.get('/upload/jobs');
  return res.data;
};

// Analyze
export const runAnalysis = async (syllabusIds, jobPostingIds) => {
  const res = await api.post('/analyze', {
    syllabus_ids: syllabusIds,
    job_posting_ids: jobPostingIds,
  });
  return res.data;
};

export const getAnalyses = async () => {
  const res = await api.get('/analyses');
  return res.data;
};

export const getAnalysis = async (id) => {
  const res = await api.get(`/analysis/${id}`);
  return res.data;
};

// Reports
export const getStudentReport = async (analysisId) => {
  const res = await api.get(`/report/student/${analysisId}`);
  return res.data;
};

export const getFacultyReport = async (analysisId) => {
  const res = await api.get(`/report/faculty/${analysisId}`);
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get('/report/dashboard/stats');
  return res.data;
};
