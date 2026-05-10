"use client";
import { useState } from 'react';
import { Sparkles, Plus, Trash2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const INITIAL_STATE = {
  personal: { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', linkedin: 'linkedin.com/in/johndoe' },
  summary: 'Passionate Software Engineer with 5 years of experience building scalable web applications.',
  experience: [
    { id: 1, company: 'Tech Corp', role: 'Senior Developer', duration: '2020 - Present', bullets: ['Led migration to microservices', 'Improved performance by 40%'] }
  ],
  education: [
    { id: 1, school: 'University of Technology', degree: 'B.S. Computer Science', duration: '2016 - 2020' }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
};

export default function ResumeStudio() {
  const [data, setData] = useState(INITIAL_STATE);
  const [loadingAI, setLoadingAI] = useState(null); // stores ID of bullet being processed

  // Handlers for Data changes
  const updatePersonal = (field, value) => setData(p => ({ ...p, personal: { ...p.personal, [field]: value } }));
  const updateSummary = (value) => setData(p => ({ ...p, summary: value }));

  const updateExperience = (id, field, value) => {
    setData(p => ({
      ...p,
      experience: p.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const updateBullet = (expId, bulletIndex, value) => {
    setData(p => ({
      ...p,
      experience: p.experience.map(exp => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets];
          newBullets[bulletIndex] = value;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    }));
  };

  const addExperience = () => {
    setData(p => ({
      ...p,
      experience: [...p.experience, { id: Date.now(), company: '', role: '', duration: '', bullets: [''] }]
    }));
  };

  const addBullet = (expId) => {
    setData(p => ({
      ...p,
      experience: p.experience.map(exp => exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp)
    }));
  };

  const removeBullet = (expId, bulletIndex) => {
    setData(p => ({
      ...p,
      experience: p.experience.map(exp => {
        if (exp.id === expId) {
          const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    }));
  };

  const handleAIRewrite = async (expId, bulletIndex, text, action) => {
    if (!text.trim()) return;
    setLoadingAI(`${expId}-${bulletIndex}`);
    try {
      const res = await api.post('/career/rewrite-bullet', { text, action });
      if (res.data && res.data.result) {
        updateBullet(expId, bulletIndex, res.data.result);
      }
    } catch (err) {
      console.error("AI Rewrite failed", err);
      alert("AI Rewrite failed. Please try again.");
    } finally {
      setLoadingAI(null);
    }
  };

  return (
    <div className="min-h-screen bg-brutal-bg flex flex-col md:flex-row">
      {/* LEFT PANE: Editor Form */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r-4 border-brutal-black h-screen pb-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black uppercase tracking-tighter">AI Studio</h1>
          <Button variant="brutal" className="gap-2">
            <Save className="w-4 h-4" /> Save
          </Button>
        </div>

        {/* Personal Details */}
        <section className="mb-8 border-4 border-brutal-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black bg-brutal-yellow inline-block px-2 mb-4 border-2 border-brutal-black">Personal</h2>
          <div className="grid grid-cols-2 gap-4">
            <input className="border-2 border-brutal-black p-2 font-bold focus:bg-brutal-yellow/20 outline-none" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} placeholder="Full Name" />
            <input className="border-2 border-brutal-black p-2 font-bold focus:bg-brutal-yellow/20 outline-none" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="Email" />
            <input className="border-2 border-brutal-black p-2 font-bold focus:bg-brutal-yellow/20 outline-none" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="Phone" />
            <input className="border-2 border-brutal-black p-2 font-bold focus:bg-brutal-yellow/20 outline-none" value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="LinkedIn URL" />
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 border-4 border-brutal-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-black bg-brutal-pink inline-block px-2 border-2 border-brutal-black">Summary</h2>
             <Button variant="ghost" className="border-2 border-brutal-black bg-brutal-yellow hover:bg-yellow-300 font-bold gap-2 text-xs h-8 px-2">
                <Sparkles className="w-3 h-3" /> AI Generate
             </Button>
          </div>
          <textarea 
            className="w-full border-2 border-brutal-black p-2 font-bold focus:bg-brutal-pink/10 outline-none h-24 resize-none" 
            value={data.summary} 
            onChange={e => updateSummary(e.target.value)} 
          />
        </section>

        {/* Experience */}
        <section className="mb-8 border-4 border-brutal-black bg-white p-4 shadow-[4px_4px_0_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-black bg-brutal-blue inline-block px-2 text-white border-2 border-brutal-black">Experience</h2>
             <Button onClick={addExperience} variant="ghost" className="border-2 border-brutal-black font-bold h-8 px-2 text-xs hover:bg-slate-200">
                <Plus className="w-3 h-3 mr-1" /> Add Role
             </Button>
          </div>

          {data.experience.map((exp, i) => (
            <div key={exp.id} className={`p-4 border-2 border-brutal-black ${i > 0 ? 'mt-4' : ''} bg-slate-50 relative group`}>
               <div className="grid grid-cols-2 gap-2 mb-4">
                 <input className="border-2 border-brutal-black p-1 font-bold text-sm" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Role (e.g. Software Engineer)" />
                 <input className="border-2 border-brutal-black p-1 font-bold text-sm" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company" />
                 <input className="border-2 border-brutal-black p-1 font-bold text-sm col-span-2" value={exp.duration} onChange={e => updateExperience(exp.id, 'duration', e.target.value)} placeholder="Duration (e.g. Jan 2020 - Present)" />
               </div>
               
               <p className="font-black text-sm uppercase mb-2">Bullets</p>
               {exp.bullets.map((bullet, bIndex) => (
                 <div key={bIndex} className="mb-3">
                   <div className="flex gap-2 mb-1">
                     <textarea 
                       className="flex-1 border-2 border-brutal-black p-2 font-medium text-sm min-h-[60px]" 
                       value={bullet} 
                       onChange={e => updateBullet(exp.id, bIndex, e.target.value)} 
                     />
                     <Button variant="ghost" onClick={() => removeBullet(exp.id, bIndex)} className="px-2 border-2 border-brutal-black hover:bg-red-500 hover:text-white shrink-0">
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       variant="ghost" 
                       disabled={loadingAI === `${exp.id}-${bIndex}`}
                       onClick={() => handleAIRewrite(exp.id, bIndex, bullet, 'enhance')} 
                       className="h-6 px-2 text-[10px] font-bold border-2 border-brutal-black bg-brutal-yellow hover:bg-yellow-300"
                     >
                        <Sparkles className="w-3 h-3 mr-1" /> Enhance
                     </Button>
                     <Button 
                       variant="ghost" 
                       disabled={loadingAI === `${exp.id}-${bIndex}`}
                       onClick={() => handleAIRewrite(exp.id, bIndex, bullet, 'quantify')} 
                       className="h-6 px-2 text-[10px] font-bold border-2 border-brutal-black bg-brutal-mint hover:bg-green-300"
                     >
                        <Sparkles className="w-3 h-3 mr-1" /> Quantify Impact
                     </Button>
                   </div>
                 </div>
               ))}
               <Button onClick={() => addBullet(exp.id)} variant="ghost" className="w-full mt-2 border-dashed border-2 border-brutal-black h-8 text-xs font-bold hover:bg-slate-200">
                 + Add Bullet
               </Button>
            </div>
          ))}
        </section>

      </div>

      {/* RIGHT PANE: Live Preview */}
      <div className="w-full md:w-1/2 bg-slate-200 p-8 flex justify-center overflow-y-auto h-screen pb-24">
         <div className="w-full max-w-[210mm] bg-white shadow-2xl p-[20mm] transform scale-[0.8] md:scale-100 origin-top font-serif text-gray-800 border border-gray-300 min-h-[297mm]">
            {/* Live Preview Render */}
            <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest">{data.personal.name || 'Your Name'}</h1>
              <div className="text-sm mt-2 flex justify-center gap-4 text-gray-600">
                <span>{data.personal.email}</span>
                <span>•</span>
                <span>{data.personal.phone}</span>
                <span>•</span>
                <span>{data.personal.linkedin}</span>
              </div>
            </div>

            <div className="mb-6">
               <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-2">Professional Summary</h2>
               <p className="text-sm leading-relaxed">{data.summary}</p>
            </div>

            <div className="mb-6">
               <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Experience</h2>
               {data.experience.map((exp, i) => (
                 <div key={i} className="mb-4">
                   <div className="flex justify-between items-baseline mb-1">
                     <h3 className="font-bold text-md text-gray-900">{exp.role} <span className="font-normal italic">at {exp.company}</span></h3>
                     <span className="text-sm text-gray-600 font-medium">{exp.duration}</span>
                   </div>
                   <ul className="list-disc pl-5 text-sm space-y-1">
                     {exp.bullets.filter(b => b.trim() !== '').map((bullet, bi) => (
                       <li key={bi}>{bullet}</li>
                     ))}
                   </ul>
                 </div>
               ))}
            </div>

            <div className="mb-6">
               <h2 className="text-lg font-bold uppercase border-b border-gray-400 mb-3">Skills</h2>
               <p className="text-sm leading-relaxed">{data.skills.join(' • ')}</p>
            </div>
         </div>
      </div>
    </div>
  );
}
