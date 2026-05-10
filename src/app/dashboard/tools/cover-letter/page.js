"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function CoverLetterGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [modelId, setModelId] = useState('default');
  const toast = useToast();

  useEffect(() => {
    api.get('/resumes').then(res => setResumes(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    let interval;
    if (status === 'polling' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/resumes/jobs/${jobId}`);
          if (res.data.status === 'COMPLETED') {
            // BUG FIX: Worker stores cover letter as { text: "..." }.
            // Extract the text string so copy/display work correctly.
            const payload = res.data.resultPayload;
            setResult(typeof payload === 'object' && payload?.text ? payload.text : payload);
            setStatus('done');
            toast.success('Cover Letter Ready!', 'Your personalized cover letter has been generated.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Generation Failed', 'Could not generate cover letter. Please try again.');
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
    if (!selectedResume || !jobDescription) {
      toast.warning('Missing Info', 'Please select a resume and paste a job description.');
      return;
    }
    setStatus('queueing');
    try {
      const res = await api.post('/career/cover-letter', { resumeId: selectedResume, jobDescription, companyName, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Generating', 'AI is crafting your cover letter...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start cover letter generation.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied!', 'Cover letter copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Cover Letter Gen</h1>
      <p className="text-xl font-bold bg-brutal-mint inline-block px-2 border-2 border-brutal-black mb-8">Generate a highly personalized cover letter in seconds.</p>

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

              <label className="block font-black text-lg mb-2">2. Company Name (Optional)</label>
              <input 
                className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                placeholder="e.g. Google, Stripe"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />

              <label className="block font-black text-lg mb-2">3. Paste Job Description</label>
              <textarea 
                className="w-full border-2 border-brutal-black p-3 font-medium min-h-[200px] mb-6 focus:bg-brutal-yellow/20 outline-none"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />

              <ModelSelector value={modelId} onChange={setModelId} />

              <Button 
                variant="brutal" 
                className="w-full text-xl py-6 bg-brutal-pink text-black hover:bg-pink-400"
                onClick={handleGenerate}
                disabled={status === 'queueing' || status === 'polling'}
              >
                {status === 'queueing' || status === 'polling' ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-5 h-5" /> AI is Writing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5" /> Generate Cover Letter
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
               <p className="font-bold text-xl">Submit to see your cover letter here.</p>
            </div>
          )}
          {status === 'polling' && (
             <div className="h-full border-4 border-brutal-black bg-brutal-blue text-white flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <div className="w-16 h-16 bg-brutal-yellow border-4 border-brutal-black animate-pulse mb-4"></div>
                <h2 className="text-2xl font-black">AI is drafting...</h2>
                <p className="font-bold">This takes about 10-20 seconds.</p>
             </div>
          )}
          {status === 'error' && (
             <div className="p-4 bg-red-100 border-2 border-red-500 font-bold text-red-700">
               Something went wrong. Please try again.
             </div>
          )}
          {status === 'done' && result && (
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col h-full">
              <CardContent className="p-6 grow flex flex-col">
                <div className="flex items-center justify-between border-b-4 border-brutal-black pb-4 mb-4">
                   <h2 className="text-2xl font-black">Your Cover Letter</h2>
                   <Button variant="outline" onClick={copyToClipboard} className="border-2 border-brutal-black font-bold gap-2">
                     {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                     {copied ? 'Copied!' : 'Copy text'}
                   </Button>
                </div>

                <div className="grow">
                   <textarea 
                     readOnly 
                     className="w-full h-full min-h-[400px] font-serif text-sm p-4 border-none outline-none resize-none bg-slate-50 border-l-4 border-brutal-pink"
                     value={result}
                   />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
