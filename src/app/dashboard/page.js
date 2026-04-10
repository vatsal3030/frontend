"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { FileText, ArrowRight, LogOut, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
        console.error("Error fetching resumes:", error.response?.data || error.message);
        if (error.response?.status === 401) {
           console.log("Authentication failed. Redirecting to login...");
           await supabase.auth.signOut();
           router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 border-b-4 border-brutal-black pb-6">
        <div>
          <h1 className="text-4xl font-black rounded-none">Your Dashboard</h1>
          <p className="text-xl font-bold mt-2 bg-brutal-yellow inline-block px-2 border-2 border-brutal-black">Manage AI analyzed resumes.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/">
             <Button variant="mint" className="text-lg">+ New Analysis</Button>
          </Link>
          <Button variant="white" onClick={handleLogout} className="px-4">
            <LogOut className="w-5 h-5 font-black" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           {/* Brutalist Loader */}
           <div className="w-16 h-16 bg-brutal-blue border-4 border-brutal-black shadow-brutal animate-bounce"></div>
        </div>
      ) : resumes.length === 0 ? (
        <Card className="max-w-2xl mx-auto text-center py-20 bg-brutal-white">
          <CardContent>
             <FileText className="w-24 h-24 text-brutal-black mx-auto mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
             <h2 className="text-3xl font-black mb-4">No resumes analyzed yet</h2>
             <p className="text-lg font-bold max-w-md mx-auto bg-brutal-pink px-2 py-1 border-2 border-brutal-black shadow-brutal-sm">Upload your first resume to get detailed AI feedback.</p>
             <Link href="/" className="mt-8 inline-block">
                <Button variant="default" className="text-xl px-10 py-6">Upload Resume</Button>
             </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resumes.map(r => (
            <Card key={r.id} className="group bg-white hover:bg-slate-50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-brutal-blue border-3 border-brutal-black shadow-brutal-sm group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                      <FileText className="w-8 h-8 text-brutal-black" />
                    </div>
                    <div className="pl-2">
                       <h3 className="font-black text-xl truncate w-40" title={r.candidateName || r.originalName}>{r.candidateName || r.originalName || 'Unknown'}</h3>
                       <p className="text-sm font-bold opacity-80">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-brutal-bg border-3 border-brutal-black p-4 text-center">
                    <p className="text-xs font-black uppercase tracking-wider mb-1">ATS Score</p>
                    <span className="text-4xl font-black">{r.atsScore}</span>
                  </div>
                  <div className="bg-brutal-yellow border-3 border-brutal-black p-4 text-center">
                    <p className="text-xs font-black uppercase tracking-wider mb-1">Job Fit</p>
                    <span className="text-4xl font-black">{r.jobFitScore}</span>
                  </div>
                </div>

                <Link href={`/results/${r.id}`} className="block w-full">
                  <Button variant="white" className="w-full text-lg justify-between border-3 bg-slate-100">
                    View Details
                    <ArrowRight className="w-5 h-5 transition group-hover:translate-x-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
