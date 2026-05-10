"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Map, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function RoadmapGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
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
            toast.success('Roadmap Ready!', 'Your career roadmap has been generated.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Failed', 'Could not generate roadmap.');
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
    if (!selectedResume || !targetRole) {
      toast.warning('Missing Info', 'Please select a resume and enter a target role.');
      return;
    }
    setStatus('queueing');
    try {
      const res = await api.post('/career/roadmap', { resumeId: selectedResume, targetRole, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Generating', 'AI is building your career roadmap...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start roadmap generation.');
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Skill Gap & Roadmap</h1>
      <p className="text-xl font-bold bg-brutal-green inline-block px-2 border-2 border-brutal-black mb-8">Discover what you&apos;re missing to land your dream role.</p>

      {status !== 'done' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <label className="block font-black text-lg mb-2">1. Current Resume</label>
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

                <label className="block font-black text-lg mb-2">2. Target Dream Role</label>
                <input 
                  className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                  placeholder="e.g. Machine Learning Engineer"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />

                <ModelSelector value={modelId} onChange={setModelId} />

                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-yellow text-black"
                  onClick={handleGenerate}
                  disabled={status === 'queueing' || status === 'polling'}
                >
                  {status === 'queueing' || status === 'polling' ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Map className="w-5 h-5" /> Analyzing Career Path...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <Map className="w-5 h-5" /> Generate Roadmap
                     </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {status === 'idle' && (
              <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50">
                 <p className="font-bold text-xl">Submit to see your personalized learning path.</p>
              </div>
            )}
            {status === 'polling' && (
               <div className="h-full border-4 border-brutal-black bg-brutal-blue text-white flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 bg-brutal-pink border-4 border-brutal-black animate-spin mb-4"></div>
                  <h2 className="text-2xl font-black">Connecting the dots...</h2>
                  <p className="font-bold">Building your custom curriculum...</p>
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
        <div className="animate-in fade-in slide-in-from-bottom-8">
          <div className="flex justify-between items-center mb-8 border-b-4 border-brutal-black pb-4">
             <h2 className="text-3xl font-black flex items-center gap-3">
               <Target className="w-8 h-8 text-brutal-blue" />
               Target: {result.targetRole}
             </h2>
             <span className="text-xl font-bold bg-brutal-black text-white px-4 py-2 uppercase">
               Level: {result.currentLevel}
             </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* LEFT COL: SKILL GAPS */}
             <div className="lg:col-span-1">
               <Card className="bg-brutal-pink border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] h-full">
                 <CardContent className="p-6">
                   <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                     <AlertTriangle className="w-6 h-6" /> Missing Skills
                   </h3>
                   <ul className="space-y-3">
                     {result.skillGaps.map((skill, idx) => (
                       <li key={idx} className="font-bold text-lg bg-white border-2 border-brutal-black p-2 shadow-sm">
                         {skill}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             </div>

             {/* RIGHT COL: ROADMAP */}
             <div className="lg:col-span-2 space-y-6">
               <h3 className="text-2xl font-black mb-4 uppercase">Step-by-Step Plan</h3>
               {result.roadmap.map((step, idx) => (
                 <Card key={idx} className="bg-white border-4 border-brutal-black hover:shadow-[8px_8px_0_rgba(0,0,0,1)] transition-all">
                   <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                     <div className="shrink-0">
                       <div className="w-16 h-16 bg-brutal-yellow border-4 border-brutal-black flex items-center justify-center text-2xl font-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                         {step.step}
                       </div>
                     </div>
                     <div>
                       <h4 className="text-2xl font-black mb-2 leading-tight">{step.title}</h4>
                       <p className="font-medium text-gray-700 mb-4">{step.description}</p>
                       
                       {step.resources && step.resources.length > 0 && (
                         <div className="bg-slate-100 border-l-4 border-brutal-blue p-3">
                           <p className="font-bold text-xs uppercase text-gray-500 mb-1">Recommended Resources</p>
                           <ul className="list-disc pl-4 space-y-1 text-sm font-medium">
                             {step.resources.map((res, i) => (
                               <li key={i}>{res}</li>
                             ))}
                           </ul>
                         </div>
                       )}
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" onClick={() => { setStatus('idle'); setResult(null); }} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
              Generate Another Path
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
