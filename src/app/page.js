"use client";
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function Home() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const token = Cookies.get('token');

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      router.push(`/results/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Make sure Gemini API Key is set.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex space-x-4">
        {token ? (
          <Link href="/dashboard" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md hover:text-white transition">Dashboard</Link>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition">Sign In</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition shadow-lg shadow-blue-500/30">Get Started</Link>
          </>
        )}
      </div>

      <div className="text-center mb-10 max-w-2xl">
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20">
          Powered by Gemini 2.5 AI
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Recruiter-Level <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Resume Analysis</span>
        </h1>
        <p className="text-lg text-slate-400">
          Upload your resume and let our AI engine evaluate it, identify weaknesses, and provide an actionable improvement plan along with ATS scores.
        </p>
      </div>

      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full max-w-xl p-12 transition-all duration-300 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer ${isDragging ? 'border-blue-400 bg-blue-500/10 scale-102' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'}`}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input 
          id="file-upload" 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files[0])}
        />
        
        {file ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <File className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-slate-200">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center ${isDragging ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'} transition-colors`}>
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop your resume</h3>
            <p className="text-slate-400">or click to browse from your computer (PDF only)</p>
          </>
        )}
      </div>

      {file && (
        <button 
          onClick={handleUpload}
          disabled={loading}
          className={`mt-8 flex items-center px-8 py-3 rounded-xl font-bold transition-all ${loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-105'}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Analyzing Resume...
            </>
          ) : (
            'Analyze My Resume'
          )}
        </button>
      )}
    </div>
  );
}
