"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ExternalLink } from 'lucide-react';

const COLUMNS = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

const COL_COLORS = {
  'SAVED': 'bg-brutal-bg',
  'APPLIED': 'bg-brutal-yellow',
  'INTERVIEWING': 'bg-brutal-blue',
  'OFFER': 'bg-brutal-green',
  'REJECTED': 'bg-brutal-pink'
};

export default function ApplicationTracker() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ company: '', role: '', url: '', salary: '', notes: '' });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data } = await api.get('/tracker');
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/tracker', formData);
      setApps([data, ...apps]);
      setShowModal(false);
      setFormData({ company: '', role: '', url: '', salary: '', notes: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to add application');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tracker/${id}`);
      setApps(apps.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // HTML5 Drag and Drop
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('appId', id);
  };

  const onDragOver = (e) => {
    e.preventDefault(); // allow drop
  };

  const onDrop = async (e, targetStatus) => {
    const id = e.dataTransfer.getData('appId');
    if (!id) return;

    // Optimistic UI update
    setApps(apps.map(a => a.id === id ? { ...a, status: targetStatus } : a));

    // Update DB
    try {
      await api.put(`/tracker/${id}`, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      fetchApps(); // revert on fail
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-4 border-brutal-black pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Job Tracker</h1>
          <p className="text-xl font-bold mt-2 bg-brutal-yellow inline-block px-2 border-2 border-brutal-black">Kanban Board for your career.</p>
        </div>
        <Button variant="brutal" onClick={() => setShowModal(true)} className="bg-brutal-blue text-white text-lg">
          <Plus className="w-5 h-5 mr-2" /> Add Application
        </Button>
      </div>

      {loading ? (
         <div className="flex justify-center p-20"><div className="w-16 h-16 bg-brutal-blue border-4 border-brutal-black animate-spin"></div></div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
          {COLUMNS.map(col => (
            <div 
              key={col}
              className={`min-w-[300px] max-w-[300px] border-4 border-brutal-black flex-1 flex flex-col snap-center ${COL_COLORS[col]} shadow-[4px_4px_0_rgba(0,0,0,1)]`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col)}
            >
              <div className="p-3 border-b-4 border-brutal-black bg-white">
                 <h2 className="text-xl font-black">{col}</h2>
                 <span className="text-sm font-bold text-gray-500">{apps.filter(a => a.status === col).length} jobs</span>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-white/50 min-h-[500px]">
                {apps.filter(a => a.status === col).map(app => (
                  <div 
                    key={app.id} 
                    draggable 
                    onDragStart={(e) => onDragStart(e, app.id)}
                    className="bg-white border-2 border-brutal-black p-4 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all relative group"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-black text-lg leading-tight mb-1">{app.role}</h3>
                    <p className="font-bold text-gray-700 mb-2">{app.company}</p>
                    
                    {app.salary && <span className="inline-block bg-brutal-green text-white text-xs font-bold px-2 py-1 border-2 border-brutal-black mb-2">{app.salary}</span>}
                    
                    {app.url && (
                      <a href={app.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-blue-600 hover:underline">
                         View Posting <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-md w-full p-6 relative">
            <h2 className="text-2xl font-black mb-4">New Application</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Company *</label>
                <input required className="w-full border-2 border-brutal-black p-2" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Role *</label>
                <input required className="w-full border-2 border-brutal-black p-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">URL / Link</label>
                <input type="url" className="w-full border-2 border-brutal-black p-2" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <div>
                <label className="block font-bold mb-1">Salary Range</label>
                <input className="w-full border-2 border-brutal-black p-2" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="white" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                <Button type="submit" variant="brutal" className="flex-1 bg-brutal-yellow">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
