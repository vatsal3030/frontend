export default function RecruiterLayout({ children }) {
  return (
    <div className="min-h-screen bg-brutal-bg text-black">
      <nav className="bg-brutal-blue border-b-4 border-brutal-black p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-white">
          <h1 className="text-2xl font-black uppercase tracking-tighter shadow-[2px_2px_0_rgba(0,0,0,1)] text-white">
            AI Career OS <span className="text-brutal-yellow">/ Recruiter</span>
          </h1>
        </div>
      </nav>
      {children}
    </div>
  );
}
