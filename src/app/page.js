"use client";
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    if (!session) {
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
    <div className="min-h-screen bg-brutal-bg flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex space-x-4">
        {session ? (
          <Link href="/dashboard">
             <Button variant="white" className="border-3 text-lg">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login">
               <Button variant="outline" className="bg-white border-3 text-lg">Sign In</Button>
            </Link>
            <Link href="/register">
               <Button variant="mint" className="text-lg">Get Started</Button>
            </Link>
          </>
        )}
      </div>

      <div className="text-center mb-10 max-w-3xl">
        <div className="inline-block px-4 py-1.5 mb-6 border-3 border-black bg-brutal-yellow text-brutal-black font-black uppercase tracking-wider shadow-brutal-sm">
          Powered by Gemini 2.5 AI
        </div>
        <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
          Recruiter-Level <br/>
          <span className="bg-brutal-mint px-2 border-4 border-black relative inline-block shadow-brutal mt-2">Resume Analysis</span>
        </h1>
        <p className="text-xl font-bold bg-white inline-block p-4 border-3 border-black shadow-[4px_4px_0_#000] max-w-2xl mt-4">
          Upload your resume and let our AI engine evaluate it, identify weaknesses, and provide an actionable improvement plan along with ATS scores.
        </p>
      </div>

      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full max-w-2xl p-12 transition-all duration-200 border-4 ${isDragging ? 'border-brutal-blue bg-brutal-blue/20 scale-105 shadow-none' : 'border-black bg-white shadow-brutal'} flex flex-col items-center justify-center text-center cursor-pointer`}
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
            <div className="w-20 h-20 bg-brutal-mint border-4 border-black shadow-brutal flex items-center justify-center mb-4">
              <File className="w-10 h-10 text-black" />
            </div>
            <div className="bg-brutal-pink p-3 border-3 border-black font-bold text-lg inline-block">
              <p>{file.name}</p>
              <p className="text-sm opacity-80 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`w-24 h-24 mb-6 flex items-center justify-center border-4 border-black shadow-brutal transition-colors ${isDragging ? 'bg-brutal-blue text-white' : 'bg-brutal-yellow text-black'}`}>
              <UploadCloud className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase">Drop your resume</h3>
            <p className="font-bold text-lg opacity-80 bg-slate-100 px-3 py-1 border-2 border-black">or click to browse (PDF only)</p>
          </>
        )}
      </div>

      {file && (
        <Button 
          onClick={(e) => { e.stopPropagation(); handleUpload(); }}
          disabled={loading}
          variant="default"
          size="lg"
          className={`mt-10 text-2xl py-8 px-12 border-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              ANALYZING...
            </>
          ) : (
            'START ANALYSIS'
          )}
        </Button>
      )}
    </div>
  );
}
