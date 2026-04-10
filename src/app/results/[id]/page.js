"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, FileCheck2, UserCircle, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    if (!id) return;
    const fetchResult = async () => {
      try {
        const res = await api.get(`/resumes/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const atsData = [
    { name: 'Score', value: data.ats_score },
    { name: 'Remaining', value: 100 - data.ats_score }
  ];
  
  const fitData = [
    { name: 'Fit', value: data.job_fit_score },
    { name: 'Remaining', value: 100 - data.job_fit_score }
  ];

  const COLORS = ['#3b82f6', '#1e293b']; // Blue, Slate-800
  const getColor = (score) => {
    if (score >= 80) return ['#10b981', '#1e293b']; // Emerald
    if (score >= 50) return ['#f59e0b', '#1e293b']; // Amber
    return ['#ef4444', '#1e293b']; // Red
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8 max-w-7xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header Profile */}
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{data.candidate_name || 'Candidate Profile'}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-4">
              {data.email && <span className="flex items-center"><Mail className="w-4 h-4 mr-2" />{data.email}</span>}
              {data.phone && <span className="flex items-center"><Phone className="w-4 h-4 mr-2" />{data.phone}</span>}
              {data.linkedin && <a href={data.linkedin} target="_blank" className="flex items-center hover:text-blue-400 transition"><ExternalLink className="w-4 h-4 mr-2" />LinkedIn</a>}
              {data.github && <a href={data.github} target="_blank" className="flex items-center hover:text-emerald-400 transition"><ExternalLink className="w-4 h-4 mr-2" />GitHub</a>}
            </div>
          </div>
          <div className="mt-6 md:mt-0 px-4 py-2 bg-slate-900 rounded-full border border-slate-700 text-sm font-medium">
            Orig File: <span className="text-slate-300">{data.original_name}</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-xl font-semibold mb-3 flex items-center"><UserCircle className="w-5 h-5 mr-2 text-blue-400" /> AI Professional Summary</h3>
          <p className="text-slate-300 leading-relaxed text-lg">{data.summary}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 bg-slate-800/50 p-1.5 rounded-xl w-max">
        <button 
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-2.5 rounded-lg font-medium transition ${activeTab === 'insights' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
        >
          AI Insights & Scoring
        </button>
        <button 
          onClick={() => setActiveTab('resume')}
          className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center space-x-2 ${activeTab === 'resume' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
        >
          <FileCheck2 className="w-4 h-4" /> <span>Recommended Resume</span>
        </button>
      </div>

      {activeTab === 'insights' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Scoring */}
          <div className="lg:col-span-4 space-y-8">
            {/* ATS Score Card */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl flex flex-col items-center shadow-lg">
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Simulated ATS Score</h3>
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={atsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                      {atsData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(data.ats_score)[index]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${data.ats_score >= 80 ? 'text-emerald-400' : data.ats_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{data.ats_score}</span>
                </div>
              </div>
              <p className="text-center text-sm text-slate-400 mt-2 px-4">Likelihood of passing basic automated screening.</p>
            </div>

            {/* Job Fit Score Card */}
            <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl flex flex-col items-center shadow-lg">
              <h3 className="text-lg font-semibold text-slate-300 mb-2">Role Fit Evaluation</h3>
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fitData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                      {fitData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(data.job_fit_score)[index]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${data.job_fit_score >= 80 ? 'text-emerald-400' : data.job_fit_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{data.job_fit_score}</span>
                </div>
              </div>
              <p className="text-center text-sm text-slate-400 mt-2 px-4">Match against general structural tech expectations.</p>
            </div>
          </div>

          {/* Right Column - SWO */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-800/50 border border-emerald-500/20 p-6 rounded-3xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-emerald-400 pb-3 border-b border-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 mr-2" /> Strengths
              </h3>
              <ul className="space-y-3">
                {data.strengths?.map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-300">
                    <span className="text-emerald-400 mr-3 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-red-500/20 p-6 rounded-3xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-red-400 pb-3 border-b border-red-500/10">
                <XCircle className="w-6 h-6 mr-2" /> Weaknesses & Flags
              </h3>
              <ul className="space-y-3">
                {data.weaknesses?.map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-300">
                    <span className="text-red-400 mr-3 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 border border-blue-500/20 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Lightbulb className="w-48 h-48 -mb-10 -mr-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4 flex items-center text-blue-400 pb-3 border-b border-blue-500/10 relative z-10">
                <Lightbulb className="w-6 h-6 mr-2" /> Actionable Suggestions
              </h3>
              <ul className="space-y-3 relative z-10">
                {data.suggestions?.map((item, idx) => (
                  <li key={idx} className="flex items-start text-slate-300">
                    <span className="text-blue-400 mr-3 mt-1">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl prose prose-invert max-w-none">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-6 py-4 rounded-xl mb-8 flex items-start">
            <Lightbulb className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <p className="m-0">This is an AI-generated recommended rewrite of your resume layout, addressing the weaknesses and explicitly restructuring content for maximum recruiter impact.</p>
          </div>
          <ReactMarkdown>{data.recommended_doc || "No recommendation available."}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
