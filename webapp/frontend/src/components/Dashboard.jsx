import React, { useState } from 'react';
import { Activity, User, Calendar, Settings, Smile, Frown, Brain, Clock, ShieldCheck } from 'lucide-react';

const Dashboard = () => {
  // FUTURE INTEGRATION: Replace this state with a 'useEffect' hook 
  // that fetches data from 'http://localhost:3000/logs' (your NestJS backend).
  const [selectedLog, setSelectedLog] = useState(null);

  // MOCK DATA: Mirrors the "Recent Documents" and "Appointments" style from your references.
  const mockLogs = [
    { 
      id: 1, 
      time: '14:08', 
      date: 'Feb 3, 2026', 
      type: 'Hand Flapping', 
      emotion: 'Happy', 
      confidence: 0.94, 
      image: 'https://images.unsplash.com/photo-1620121692029-d088224efc74?q=80&w=400', // Mock capture
      details: 'Repetitive hand movement detected for 15 seconds.'
    },
    { 
      id: 2, 
      time: '09:16', 
      date: 'Feb 3, 2026', 
      type: 'Rocking', 
      emotion: 'Anxious', 
      confidence: 0.88, 
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400',
      details: 'Rhythmic swaying detected while sitting near the window.'
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 text-blue-600">
          <Brain size={32} />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">StimTrack</h1>
        </div>
        
        <div className="space-y-2">
          {['Home', 'Detections', 'Reports', 'Settings'].map((item) => (
            <div key={item} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${item === 'Detections' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
              {item === 'Home' && <Activity size={20} />}
              {item === 'Detections' && <ShieldCheck size={20} />}
              {item === 'Reports' && <Calendar size={20} />}
              {item === 'Settings' && <Settings size={20} />}
              <span>{item}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* LOG FEED */}
        <div className="w-96 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold">Stimming Logs</h2>
            <p className="text-sm text-slate-400">Live AI Detection Feed</p>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {mockLogs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedLog?.id === log.id ? 'border-blue-500 bg-blue-50 shadow-md translate-x-1' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{log.time} • {log.date}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${log.emotion === 'Happy' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.emotion}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{log.type}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* DETAIL VIEW */}
        <div className="flex-1 p-10 bg-slate-50 overflow-y-auto">
          {selectedLog ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{selectedLog.type}</h2>
                  <p className="text-slate-500 flex items-center gap-2 mt-1">
                    <Clock size={16} /> Detected at {selectedLog.time} on {selectedLog.date}
                  </p>
                </div>
                {/* FUTURE INTEGRATION: Add a button to delete or export specific logs */}
                <button className="bg-white border border-slate-200 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-slate-100 transition-all">Export Log</button>
              </header>

              <div className="grid grid-cols-3 gap-8">
                {/* SCREENSHOT CARD */}
                <div className="col-span-2 bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
                  <div className="aspect-video rounded-[1.5rem] overflow-hidden bg-slate-200 relative">
                    {/* FUTURE INTEGRATION: Use actual URL from backend (e.g., http://localhost:3000/${log.imageUrl}) */}
                    <img src={selectedLog.image} alt="Detection" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold">
                      Confidence: {(selectedLog.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* AI METRICS SIDEBAR */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Detected Emotion</h4>
                    <div className="flex items-center gap-4">
                      {selectedLog.emotion === 'Happy' ? <Smile size={40} className="text-green-500" /> : <Frown size={40} className="text-orange-500" />}
                      <span className="text-2xl font-bold">{selectedLog.emotion}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Observation Notes</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{selectedLog.details}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <Activity size={80} strokeWidth={1} />
              <p className="mt-4 font-medium">Select an activity log to view the AI analysis</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;