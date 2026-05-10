"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Building, Users, Star, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function RecruiterDashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);

  // Form states
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');

  const [showJobForm, setShowJobForm] = useState(null); // companyId
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruiter/dashboard');
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruiter/companies', { name: companyName, description: companyDesc });
      setShowCompanyForm(false);
      setCompanyName('');
      setCompanyDesc('');
      toast.success('Company Created!', 'Your company has been registered.');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to create company.');
    }
  };

  const handleCreateJob = async (e, companyId) => {
    e.preventDefault();
    try {
      await api.post('/recruiter/jobs', { companyId, title: jobTitle, description: jobDesc });
      setShowJobForm(null);
      setJobTitle('');
      setJobDesc('');
      toast.success('Job Posted!', 'Your job listing is now live.');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to create job posting.');
    }
  };

  const loadCandidates = async (jobId) => {
    try {
      const res = await api.get(`/recruiter/jobs/${jobId}/matches`);
      setCandidates(res.data);
      setSelectedJob(jobId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Companies & Jobs Column */}
      <div className="md:col-span-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">Your Companies</h2>
          <Button variant="brutal" size="sm" onClick={() => setShowCompanyForm(!showCompanyForm)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showCompanyForm && (
          <Card className="border-4 border-brutal-black bg-brutal-yellow">
            <CardContent className="p-4">
              {/* BUG FIX: Wrap in <form> so Enter key works */}
              <form onSubmit={handleCreateCompany} className="space-y-3">
                <input 
                  placeholder="Company Name" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full p-2 border-2 border-brutal-black font-medium" 
                />
                <textarea 
                  placeholder="Description" 
                  value={companyDesc}
                  onChange={e => setCompanyDesc(e.target.value)}
                  className="w-full p-2 border-2 border-brutal-black font-medium" 
                />
                <Button type="submit" variant="brutal" className="w-full bg-white text-black">Save</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {companies.map(company => (
          <Card key={company.id} className="border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5" />
                <h3 className="font-black text-xl">{company.name}</h3>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-600 uppercase border-b-2 border-brutal-black pb-1">Job Postings</h4>
                
                {company.jobPostings.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => loadCandidates(job.id)}
                    className={`p-2 border-2 border-brutal-black cursor-pointer transition-colors ${selectedJob === job.id ? 'bg-brutal-green' : 'hover:bg-gray-100'}`}
                  >
                    <p className="font-bold">{job.title}</p>
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {job._count.matches} Matches
                    </p>
                  </div>
                ))}

                {showJobForm === company.id ? (
                  <form onSubmit={(e) => handleCreateJob(e, company.id)} className="space-y-2 mt-4">
                    <input 
                      placeholder="Job Title" 
                      value={jobTitle}
                      onChange={e => setJobTitle(e.target.value)}
                      className="w-full p-2 border-2 border-brutal-black text-sm" 
                    />
                    <textarea 
                      placeholder="Job Description" 
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                      className="w-full p-2 border-2 border-brutal-black text-sm" 
                    />
                    <Button type="submit" variant="brutal" size="sm" className="w-full bg-brutal-blue text-white">Post Job</Button>
                  </form>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-2 border-dashed border-brutal-black font-bold"
                    onClick={() => setShowJobForm(company.id)}
                  >
                    + Add Job
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidates Column */}
      <div className="md:col-span-2">
        {!selectedJob ? (
          <div className="h-full flex items-center justify-center border-4 border-dashed border-brutal-black p-12 bg-white/50">
            <p className="font-bold text-xl text-gray-500">Select a job posting to view matched candidates.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-3xl font-black flex items-center gap-2">
              <Star className="w-8 h-8 text-brutal-yellow fill-brutal-yellow" /> Ranked Candidates
            </h2>
            
            {candidates.length === 0 ? (
              <Card className="border-4 border-brutal-black p-8 text-center bg-white">
                <p className="font-bold text-lg">No matches found yet. Candidates will appear here as they are processed.</p>
              </Card>
            ) : (
              candidates.map((match, idx) => (
                <Card key={match.id} className="border-4 border-brutal-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <CardContent className="p-6 flex items-start gap-6">
                    <div className="shrink-0 w-16 h-16 bg-brutal-blue text-white font-black text-2xl flex items-center justify-center border-4 border-brutal-black rounded-full">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black">{match.user.name}</h3>
                          <p className="font-bold text-gray-600">{match.user.email}</p>
                        </div>
                        <div className="bg-brutal-green px-4 py-2 border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                          <span className="font-black text-xl">{Math.round(match.matchScore)}% Match</span>
                        </div>
                      </div>
                      <p className="mt-4 font-medium text-gray-800 bg-brutal-yellow/20 p-3 border-2 border-brutal-black">
                        {match.matchReason || "No detailed reasoning provided."}
                      </p>
                      <div className="mt-4 flex gap-4">
                        <Button variant="brutal" className="bg-brutal-black text-white">View Full Profile</Button>
                        <Button variant="outline" className="border-2 border-brutal-black font-bold bg-white text-black">Contact</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
