"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { FileText, ArrowRight, Activity, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await api.get('/resumes');
        setResumes(data);
      } catch (error) {
        console.error("Error fetching resumes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Your Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage and review your AI analyzed resumes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition shadow-lg shadow-blue-500/20">
            + New Analysis
          </Link>
          <button onClick={handleLogout} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No resumes analyzed yet</h2>
          <p className="text-slate-400 max-w-md mx-auto">Upload your first resume to get detailed AI feedback and an ATS score prediction.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition">Upload Resume</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(r => (
            <div key={r.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-blue-500/10 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-200 truncate w-40">{r.candidate_name || 'Unknown'}</h3>
                    <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">ATS Score</p>
                  <div className="flex items-end space-x-1">
                    <span className={`text-2xl font-bold ${r.ats_score > 70 ? 'text-emerald-400' : r.ats_score > 40 ? 'text-amber-400' : 'text-red-400'}`}>{r.ats_score}</span>
                    <span className="text-sm text-slate-500 mb-1">/100</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Job Fit</p>
                  <div className="flex items-end space-x-1">
                    <span className="text-2xl font-bold text-blue-400">{r.job_fit_score}</span>
                    <span className="text-sm text-slate-500 mb-1">/100</span>
                  </div>
                </div>
              </div>

              <Link href={`/results/${r.id}`} className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-700/50 hover:bg-blue-600/20 hover:text-blue-400 rounded-lg font-medium transition text-slate-300">
                <span>View Details</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
