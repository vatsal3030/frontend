"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';

export default function MockInterviewGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [status, setStatus] = useState('idle'); // idle, queueing, polling, done, error
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);

  // For interactive interview UI
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showGuidance, setShowGuidance] = useState(false);
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
            toast.success('Interview Ready!', 'Your mock interview questions are prepared.');
            clearInterval(interval);
          } else if (res.data.status === 'FAILED') {
            setStatus('error');
            toast.error('Failed', 'Could not generate interview questions.');
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
    setActiveQuestion(0);
    setShowGuidance(false);
    try {
      const res = await api.post('/career/mock-interview', { resumeId: selectedResume, targetRole, modelId });
      setJobId(res.data.jobId);
      setStatus('polling');
      toast.info('Generating', 'AI is preparing your mock interview...');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error('Error', 'Failed to start mock interview generation.');
    }
  };

  const nextQuestion = () => {
    if (activeQuestion < (result?.questions?.length || 0) - 1) {
      setActiveQuestion(prev => prev + 1);
      setShowGuidance(false);
    }
  };

  const prevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(prev => prev - 1);
      setShowGuidance(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-black mb-2 uppercase tracking-tighter">Mock Interview</h1>
      <p className="text-xl font-bold bg-brutal-blue text-white inline-block px-2 border-2 border-brutal-black mb-8">Generate tough, highly-specific interview questions based on your resume.</p>

      {status !== 'done' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* INPUT PANE */}
          <div className="space-y-6">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <label className="block font-black text-lg mb-2">1. Select Resume Context</label>
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

                <label className="block font-black text-lg mb-2">2. Target Role & Company</label>
                <input 
                  className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                  placeholder="e.g. Senior Frontend Engineer at Meta"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />

                <ModelSelector value={modelId} onChange={setModelId} />

                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-green text-black"
                  onClick={handleGenerate}
                  disabled={status === 'queueing' || status === 'polling'}
                >
                  {status === 'queueing' || status === 'polling' ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Sparkles className="w-5 h-5" /> Generating Questions...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <Sparkles className="w-5 h-5" /> Start Mock Interview
                     </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {status === 'idle' && (
              <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50">
                 <p className="font-bold text-xl">Submit to start your interactive mock interview.</p>
              </div>
            )}
            {status === 'polling' && (
               <div className="h-full border-4 border-brutal-black bg-brutal-pink flex flex-col items-center justify-center p-8 text-center shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 bg-brutal-yellow border-4 border-brutal-black animate-bounce mb-4"></div>
                  <h2 className="text-2xl font-black">AI is studying your resume...</h2>
                  <p className="font-bold">Crafting tailored questions...</p>
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

      {/* RESULTS / INTERVIEW PANE */}
      {status === 'done' && result && result.questions && result.questions.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black">Question {activeQuestion + 1} of {result.questions.length}</h2>
             <span className={`text-xs font-bold uppercase px-3 py-1 border-2 border-brutal-black text-white ${
               result.questions[activeQuestion].type === 'behavioral' ? 'bg-brutal-pink text-black' :
               result.questions[activeQuestion].type === 'technical' ? 'bg-brutal-blue' : 'bg-brutal-yellow text-black'
             }`}>
               {result.questions[activeQuestion].type}
             </span>
          </div>

          <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
            <CardContent className="p-8 md:p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-6 text-brutal-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
              <h3 className="text-3xl md:text-4xl font-black leading-tight mb-8">&quot;{result.questions[activeQuestion].question}&quot;</h3>
              
              <div className="bg-slate-100 border-l-4 border-brutal-black p-4 text-left inline-block">
                 <p className="text-sm font-bold text-gray-500 uppercase">Context:</p>
                 <p className="font-medium text-gray-800">{result.questions[activeQuestion].context}</p>
              </div>
            </CardContent>
          </Card>

          {!showGuidance ? (
            <div className="text-center mb-8">
               <Button variant="default" onClick={() => setShowGuidance(true)} className="text-lg px-8 border-2 border-brutal-black bg-brutal-yellow text-black hover:bg-yellow-300">
                  Reveal Expected Answer
               </Button>
            </div>
          ) : (
            <div className="bg-brutal-mint border-4 border-brutal-black p-6 mb-8 shadow-[4px_4px_0_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-2 mb-4 border-b-2 border-brutal-black pb-2">
                 <CheckCircle className="w-6 h-6" />
                 <h4 className="text-xl font-black">Expected Answer Guidance</h4>
               </div>
               <p className="font-medium text-lg leading-relaxed">{result.questions[activeQuestion].expectedAnswerGuidance}</p>
            </div>
          )}

          <div className="flex justify-between items-center border-t-4 border-brutal-black pt-6">
             <Button variant="ghost" onClick={prevQuestion} disabled={activeQuestion === 0} className="border-2 border-brutal-black font-bold">
               Previous
             </Button>
             <div className="flex gap-2">
               {result.questions.map((_, i) => (
                 <div key={i} className={`w-3 h-3 border-2 border-brutal-black rounded-full ${i === activeQuestion ? 'bg-brutal-blue' : 'bg-white'}`} />
               ))}
             </div>
             <Button variant="ghost" onClick={nextQuestion} disabled={activeQuestion === result.questions.length - 1} className="border-2 border-brutal-black font-bold bg-brutal-blue text-white hover:bg-blue-600">
               Next <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" onClick={() => { setStatus('idle'); setResult(null); }} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
              Restart Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
