"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Layout, Code, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function PortfolioGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
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
            setResult(res.data.resultPayload);
            setStatus('done');
            toast.success('Portfolio Ready!', 'Your portfolio config has been generated.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Failed', 'Could not generate portfolio.');
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
    if (!selectedResume) {
      toast.warning('Missing Info', 'Please select a resume first.');
      return;
    }
    setStatus('queueing');
    try {
      const res = await api.post('/career/portfolio', { resumeId: selectedResume, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Generating', 'AI is crafting your portfolio...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start portfolio generation.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast.success('Copied!', 'Portfolio JSON copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Portfolio Gen</h1>
      <p className="text-xl font-bold bg-brutal-blue text-white inline-block px-2 border-2 border-brutal-black mb-8">One-click personal website architecture.</p>

      {status !== 'done' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <label className="block font-black text-lg mb-2">Select Source Resume</label>
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

                <ModelSelector value={modelId} onChange={setModelId} />

                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-pink text-black hover:bg-pink-400"
                  onClick={handleGenerate}
                  disabled={status === 'queueing' || status === 'polling'}
                >
                  {status === 'queueing' || status === 'polling' ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Layout className="w-5 h-5" /> Designing Layout...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <Sparkles className="w-5 h-5" /> Generate Portfolio
                     </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {status === 'idle' && (
              <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50">
                 <p className="font-bold text-xl">Generate a full portfolio data structure ready for React/Next.js.</p>
              </div>
            )}
            {status === 'polling' && (
               <div className="h-full border-4 border-brutal-black bg-brutal-yellow text-black flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 bg-brutal-blue border-4 border-brutal-black animate-bounce mb-4"></div>
                  <h2 className="text-2xl font-black">Extracting Projects...</h2>
                  <p className="font-bold">Writing your bio...</p>
               </div>
            )}
            {status === 'error' && (
               <div className="p-4 bg-red-100 border-2 border-red-500 font-bold text-red-700">
                 Something went wrong. Please try again.
               </div>
            )}
          </div>
        </div>
      )}

      {status === 'done' && result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
          <div className="flex justify-between items-center border-b-4 border-brutal-black pb-4">
             <div>
               <h2 className="text-3xl font-black">Live Preview</h2>
               <p className="font-bold text-gray-600">A wireframe of your new site.</p>
             </div>
             <Button variant="outline" onClick={copyToClipboard} className="border-2 border-brutal-black font-bold gap-2 hover:bg-brutal-bg">
                {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                {copied ? 'Copied JSON' : 'Export JSON Data'}
             </Button>
          </div>

          {/* MOCK PORTFOLIO PREVIEW (Brutalist style) */}
          <div className="border-4 border-brutal-black overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,1)]">
            {/* Header */}
            <div className="bg-brutal-yellow p-12 text-center border-b-4 border-brutal-black">
              <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">{result.header?.name || 'Your Name'}</h1>
              <p className="text-2xl font-bold bg-white inline-block px-4 py-1 border-2 border-brutal-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                {result.header?.title || 'Software Engineer'}
              </p>
              <p className="mt-6 font-medium max-w-2xl mx-auto text-lg">{result.header?.tagline}</p>
            </div>

            {/* About & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-3 bg-white">
              <div className="md:col-span-2 p-8 border-r-4 border-brutal-black">
                <h3 className="text-2xl font-black mb-4 uppercase">About Me</h3>
                <p className="font-medium text-lg leading-relaxed">{result.about}</p>
              </div>
              <div className="p-8 bg-brutal-bg">
                <h3 className="text-2xl font-black mb-4 uppercase">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills?.map((skill, i) => (
                    <span key={i} className="bg-white border-2 border-brutal-black px-3 py-1 font-bold text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="p-8 bg-brutal-pink border-t-4 border-brutal-black">
              <h3 className="text-3xl font-black mb-8 uppercase text-center">Featured Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.projects?.map((proj, i) => (
                  <Card key={i} className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all">
                    <CardContent className="p-6">
                      <h4 className="text-xl font-black mb-2">{proj.name}</h4>
                      <p className="font-medium mb-4 text-sm">{proj.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {proj.techStack?.map((tech, j) => (
                          <span key={j} className="text-xs font-bold bg-slate-200 px-2 py-1 uppercase">{tech}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="p-12 text-center bg-brutal-blue text-white border-t-4 border-brutal-black">
              <h3 className="text-3xl font-black mb-6 uppercase">Let&apos;s Build Something</h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {result.contact?.email && <a href={`mailto:${result.contact.email}`} className="bg-white text-black font-bold border-4 border-brutal-black px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">Email Me</a>}
                {result.contact?.linkedin && <a href={result.contact.linkedin} target="_blank" className="bg-white text-black font-bold border-4 border-brutal-black px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">LinkedIn</a>}
                {result.contact?.github && <a href={result.contact.github} target="_blank" className="bg-white text-black font-bold border-4 border-brutal-black px-6 py-3 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">GitHub</a>}
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pb-12">
            <Button variant="outline" onClick={() => { setStatus('idle'); setResult(null); }} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
              Generate Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
