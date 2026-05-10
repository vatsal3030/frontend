"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GitBranch, Activity, Code2, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function GitHubAnalyzer() {
  const [githubUsername, setGithubUsername] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [modelId, setModelId] = useState('default');
  const toast = useToast();

  useEffect(() => {
    let interval;
    if (status === 'polling' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/resumes/jobs/${jobId}`);
          if (res.data.status === 'COMPLETED') {
            setResult(res.data.resultPayload);
            setStatus('done');
            toast.success('Analysis Complete!', 'Your GitHub profile has been analyzed.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Failed', 'Could not analyze GitHub profile.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, jobId, toast]);

  const handleGenerate = async () => {
    if (!githubUsername) {
      toast.warning('Missing Info', 'Please enter a GitHub username.');
      return;
    }
    setStatus('queueing');
    try {
      const res = await api.post('/career/github', { githubUsername, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Analyzing', 'AI is scanning your GitHub profile...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start GitHub analysis.');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">GitHub Analyzer</h1>
      <p className="text-xl font-bold bg-brutal-pink inline-block px-2 border-2 border-brutal-black mb-8">AI-driven insights into your open source footprint.</p>

      {status !== 'done' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <label className="block font-black text-lg mb-2">Target GitHub Username</label>
                <div className="flex items-center border-2 border-brutal-black bg-white mb-6 focus-within:bg-brutal-yellow/20">
                  <span className="pl-4 font-bold text-gray-500">github.com/</span>
                  <input 
                    className="w-full p-3 font-bold outline-none bg-transparent"
                    placeholder="torvalds"
                    value={githubUsername}
                    onChange={e => setGithubUsername(e.target.value)}
                  />
                </div>

                <ModelSelector value={modelId} onChange={setModelId} />

                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-blue text-white hover:bg-blue-600"
                  onClick={handleGenerate}
                  disabled={status === 'queueing' || status === 'polling'}
                >
                  {status === 'queueing' || status === 'polling' ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Activity className="w-5 h-5" /> Scanning Repositories...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <GitBranch className="w-5 h-5" /> Analyze Profile
                     </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {status === 'idle' && (
              <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50">
                 <p className="font-bold text-xl">Enter a username to audit their code portfolio.</p>
              </div>
            )}
            {status === 'polling' && (
               <div className="h-full border-4 border-brutal-black bg-brutal-green text-black flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 bg-white border-4 border-brutal-black animate-spin mb-4 flex items-center justify-center">
                    <Code2 className="w-8 h-8 text-brutal-black" />
                  </div>
                  <h2 className="text-2xl font-black">AI is reviewing code...</h2>
                  <p className="font-bold">Analyzing language distribution...</p>
               </div>
            )}
            {status === 'error' && (
               <div className="p-4 bg-red-100 border-2 border-red-500 font-bold text-red-700">
                 Something went wrong. Please check the username and try again.
               </div>
            )}
          </div>
        </div>
      )}

      {status === 'done' && result && (
        <div className="animate-in fade-in slide-in-from-bottom-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-brutal-black pb-4 gap-4">
             <div>
               <h2 className="text-4xl font-black flex items-center gap-3">
                 <GitBranch className="w-10 h-10 text-brutal-black" />
                 @{githubUsername}
               </h2>
               <p className="text-xl font-bold text-gray-600 mt-1">&quot;{result.developerArchetype}&quot;</p>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Overall Score</p>
                  <div className="text-5xl font-black">{result.overallScore}<span className="text-2xl text-gray-400">/100</span></div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             {/* TOP LANGUAGES */}
             <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
               <CardContent className="p-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                   <Code2 className="w-6 h-6" /> Top Languages
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {result.topLanguages?.map((lang, i) => (
                     <span key={i} className="bg-white border-2 border-brutal-black px-4 py-2 font-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                       {lang}
                     </span>
                   ))}
                 </div>
               </CardContent>
             </Card>

             {/* STRENGTHS */}
             <Card className="bg-brutal-blue text-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
               <CardContent className="p-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                   <TrendingUp className="w-6 h-6" /> Key Strengths
                 </h3>
                 <ul className="space-y-2 font-medium text-lg list-disc pl-5">
                   {result.strengths?.map((strength, i) => (
                     <li key={i}>{strength}</li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
          </div>

          {/* AREAS FOR GROWTH */}
          <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
            <CardContent className="p-8">
              <h3 className="text-3xl font-black mb-6 uppercase">Growth Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {result.areasForGrowth?.map((area, i) => (
                   <div key={i} className="bg-slate-100 border-l-4 border-brutal-pink p-4">
                     <p className="font-bold text-lg">{area}</p>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-12 pb-12">
            <Button variant="outline" onClick={() => { setStatus('idle'); setResult(null); }} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
              Analyze Another Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
