"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, FileCheck2, UserCircle, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <div className="min-h-screen flex items-center justify-center p-8 bg-brutal-bg">
        <div className="w-16 h-16 bg-brutal-pink border-4 border-brutal-black shadow-brutal animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const atsData = [
    { name: 'Score', value: data.atsScore || 0 },
    { name: 'Remaining', value: 100 - (data.atsScore || 0) }
  ];
  
  const fitData = [
    { name: 'Fit', value: data.jobFitScore || 0 },
    { name: 'Remaining', value: 100 - (data.jobFitScore || 0) }
  ];

  const getColor = (score) => {
    if (score >= 80) return ['#90FFD9', '#1A1A1A']; // mint, black
    if (score >= 50) return ['#FFB800', '#1A1A1A']; // yellow, black
    return ['#FF90E8', '#1A1A1A']; // pink, black
  };

  return (
    <div className="min-h-screen bg-brutal-bg p-8 max-w-7xl mx-auto">
      <Link href="/dashboard" className="inline-block mb-8">
         <Button variant="white" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
         </Button>
      </Link>

      {/* Header Profile */}
      <Card className="mb-8 overflow-hidden bg-brutal-blue">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-black text-brutal-black mb-2">{data.candidateName || 'Candidate Profile'}</h1>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-brutal-black mt-4">
                {data.email && <span className="px-2 py-1 bg-white border-2 border-black">{data.email}</span>}
                {data.phone && <span className="px-2 py-1 bg-white border-2 border-black">{data.phone}</span>}
                {data.linkedin && <a href={data.linkedin} target="_blank" className="px-2 py-1 bg-white border-2 border-black hover:bg-brutal-yellow transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />LinkedIn</a>}
                {data.github && <a href={data.github} target="_blank" className="px-2 py-1 bg-white border-2 border-black hover:bg-brutal-yellow transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />GitHub</a>}
              </div>
            </div>
            <div className="mt-6 md:mt-0 px-4 py-2 bg-brutal-yellow border-3 border-black font-black text-lg shadow-[4px_4px_0_#000]">
              FILE: <span className="underline">{data.originalName}</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-4 border-brutal-black">
            <h3 className="text-2xl font-black mb-3 flex items-center"><UserCircle className="w-8 h-8 mr-2" /> Summary</h3>
            <p className="font-medium text-lg bg-white p-4 border-3 border-black shadow-brutal-sm">{data.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8">
        <Button 
          variant={activeTab === 'insights' ? 'default' : 'white'} 
          className="text-lg"
          onClick={() => setActiveTab('insights')}
        >
          AI Insights & Scoring
        </Button>
        <Button 
          variant={activeTab === 'resume' ? 'pink' : 'white'} 
          className="text-lg gap-2"
          onClick={() => setActiveTab('resume')}
        >
          <FileCheck2 className="w-5 h-5" /> Recommended Resume
        </Button>
      </div>

      {activeTab === 'insights' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Scoring */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="bg-white text-center">
              <CardHeader className="bg-brutal-yellow">
                <CardTitle>ATS Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 relative mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={atsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="#1A1A1A" strokeWidth={3}>
                        {atsData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(data.atsScore || 0)[index]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black">{data.atsScore || 0}</span>
                  </div>
                </div>
                <p className="font-bold mt-4 bg-slate-100 border-2 border-black p-2 shadow-[2px_2px_0_#000]">Likelihood of passing basic screening.</p>
              </CardContent>
            </Card>

            <Card className="bg-white text-center">
              <CardHeader className="bg-brutal-mint">
                <CardTitle>Role Fit</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-48 h-48 relative mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={fitData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" stroke="#1A1A1A" strokeWidth={3}>
                        {fitData.map((entry, index) => <Cell key={`cell-${index}`} fill={getColor(data.jobFitScore || 0)[index]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black">{data.jobFitScore || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - SWO */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-brutal-mint">
              <CardContent className="pt-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                   <CheckCircle2 className="w-8 h-8 mr-2 bg-white rounded-full" /> Strengths
                 </h3>
                 <ul className="space-y-3 font-bold text-lg">
                   {data.strengths?.map((item, idx) => (
                     <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                       <span className="mr-3">🔥</span> {item}
                     </li>
                   ))}
                 </ul>
              </CardContent>
            </Card>

            <Card className="bg-brutal-pink">
              <CardContent className="pt-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                   <XCircle className="w-8 h-8 mr-2 bg-white rounded-full" /> Weaknesses & Flags
                 </h3>
                 <ul className="space-y-3 font-bold text-lg">
                   {data.weaknesses?.map((item, idx) => (
                     <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                       <span className="mr-3">🚩</span> {item}
                     </li>
                   ))}
                 </ul>
              </CardContent>
            </Card>

            <Card className="bg-brutal-yellow">
               <CardContent className="pt-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                   <Lightbulb className="w-8 h-8 mr-2 bg-white rounded-full" /> Actionable Suggestions
                 </h3>
                 <ul className="space-y-3 font-bold text-lg">
                   {data.suggestions?.map((item, idx) => (
                     <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                       <span className="mr-3">💡</span> {item}
                     </li>
                   ))}
                 </ul>
               </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-white relative">
          <CardContent className="pt-6 prose prose-lg prose-headings:font-black prose-a:text-blue-600 prose-p:font-medium max-w-none">
            <div className="bg-brutal-blue border-3 border-black px-6 py-4 mb-4 flex flex-col md:flex-row items-start justify-between shadow-brutal-sm">
              <div className="flex items-start">
                <Lightbulb className="w-8 h-8 mr-3 flex-shrink-0 bg-white rounded-full p-1 border-2 border-black" />
                <p className="m-0 font-bold text-lg">AI-generated recommendation to address weaknesses and restructure content for recruiters.</p>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Button 
                  variant="white" 
                  className="font-bold text-sm px-3 border-2"
                  onClick={() => {
                    const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                    const blob = new Blob([content], { type: 'text/markdown' });
                    downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.md`);
                  }}
                >
                  .MD
                </Button>
                <Button 
                  variant="white" 
                  className="font-bold text-sm px-3 border-2"
                  onClick={() => {
                    const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                    const blob = new Blob([content], { type: 'text/plain' });
                    downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.txt`);
                  }}
                >
                  .TXT
                </Button>
                <Button 
                  variant="white" 
                  className="font-bold text-sm px-3 border-2 bg-brutal-yellow"
                  onClick={() => {
                    const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                    // Wrap the markdown structure inside a viable LaTeX template
                    const latexContent = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{hyperref}\n\\begin{document}\n\n${content}\n\n\\end{document}`;
                    const blob = new Blob([latexContent], { type: 'application/x-latex' });
                    downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.tex`);
                  }}
                >
                  .TEX (LaTeX)
                </Button>
              </div>
            </div>
            
            <div className="border-4 border-black p-8 bg-[#fdfdfd] shadow-brutal">
              <ReactMarkdown>{data.recommendedDoc || data.recommended_doc || "No recommendation available."}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper utility
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
