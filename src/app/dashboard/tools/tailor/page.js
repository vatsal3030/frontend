"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function ResumeTailor() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [modelId, setModelId] = useState('default');
  const toast = useToast();

  useEffect(() => {
    // Fetch available resumes
    api.get('/resumes').then(res => setResumes(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'polling' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/resumes/jobs/${jobId}`);
          if (res.data.status === 'COMPLETED') {
            setResult(res.data.resultPayload);
            setStatus('done');
            toast.success('Tailoring Done!', 'Your resume has been optimized for this JD.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Tailoring Failed', 'AI could not process your resume.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, jobId, toast]);

  const handleTailor = async () => {
    if (!selectedResume || !jobDescription) {
      toast.warning('Missing Info', 'Please select a resume and paste a job description.');
      return;
    }
    setStatus('queueing');
    try {
      const res = await api.post('/career/tailor-resume', { resumeId: selectedResume, jobDescription, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Processing', 'AI is tailoring your resume...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start tailoring.');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">AI Tailoring</h1>
      <p className="text-xl font-bold bg-brutal-yellow inline-block px-2 border-2 border-brutal-black mb-8">Target your resume to a specific job description instantly.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INPUT PANE */}
        <div className="space-y-6">
          <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <label className="block font-black text-lg mb-2">1. Select Baseline Resume</label>
              <select 
                className="w-full border-2 border-brutal-black p-3 font-bold bg-brutal-bg mb-6 cursor-pointer"
                value={selectedResume}
                onChange={e => setSelectedResume(e.target.value)}
              >
                <option value="">-- Select Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.title || r.originalName || 'Untitled Resume'}</option>
                ))}
              </select>

              <label className="block font-black text-lg mb-2">2. Paste Job Description</label>
              <textarea 
                className="w-full border-2 border-brutal-black p-3 font-medium min-h-[200px] mb-6"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />

              <ModelSelector value={modelId} onChange={setModelId} />

              <Button 
                variant="brutal" 
                className="w-full text-xl py-6 bg-brutal-blue text-white"
                onClick={handleTailor}
                disabled={status === 'queueing' || status === 'polling'}
              >
                {status === 'queueing' || status === 'polling' ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-5 h-5" /> AI is Analyzing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5" /> Tailor Resume
                   </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RESULTS PANE */}
        <div className="space-y-6">
          {status === 'idle' && (
            <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50">
               <p className="font-bold text-xl">Submit to see tailored results here.</p>
            </div>
          )}
          {status === 'polling' && (
             <div className="h-full border-4 border-brutal-black bg-brutal-pink flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <div className="w-16 h-16 bg-brutal-yellow border-4 border-brutal-black animate-spin mb-4"></div>
                <h2 className="text-2xl font-black">AI is comparing JD...</h2>
                <p className="font-bold">This takes about 10-20 seconds.</p>
             </div>
          )}
          {status === 'error' && (
             <div className="p-4 bg-red-100 border-2 border-red-500 font-bold text-red-700">
               Something went wrong. Please try again.
             </div>
          )}
          {status === 'done' && result && (
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between border-b-4 border-brutal-black pb-4 mb-4">
                   <h2 className="text-2xl font-black">Match Score</h2>
                   <div className="text-4xl font-black bg-brutal-green text-white px-4 py-2 border-4 border-brutal-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                     {result.matchScore}%
                   </div>
                </div>

                <h3 className="font-black text-xl mb-2 bg-brutal-yellow inline-block px-1">Suggested Keywords</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.suggestedKeywords?.map((kw, i) => (
                    <span key={i} className="text-xs font-bold px-2 py-1 bg-slate-200 border-2 border-brutal-black">{kw}</span>
                  ))}
                </div>

                <h3 className="font-black text-xl mb-2 bg-brutal-blue text-white inline-block px-1">Tailored Summary</h3>
                <p className="text-sm font-medium border-l-4 border-brutal-blue pl-4 py-2 mb-6 bg-slate-50">{result.tailoredSummary}</p>

                <h3 className="font-black text-xl mb-2 bg-brutal-pink inline-block px-1">Rewritten Bullets</h3>
                <div className="space-y-4">
                   {result.tailoredBullets?.map((tb, i) => (
                     <div key={i} className="border-2 border-brutal-black p-3 bg-slate-50 relative">
                        <div className="absolute top-2 right-2 text-brutal-green"><CheckCircle2 className="w-5 h-5"/></div>
                        <p className="text-xs text-red-500 line-through mb-1">{tb.original}</p>
                        <p className="text-sm font-bold text-green-700">{tb.suggested}</p>
                     </div>
                   ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
