/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  Settings, 
  Users, 
  Menu, 
  Bell, 
  Search,
  PhoneForwarded,
  CalendarCheck,
  CheckCircle2,
  Voicemail,
  Clock,
  ChevronRight,
  PlayCircle,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Call } from './data/mockData';
import { cn } from './lib/utils';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={cn("font-medium", trendUp ? "text-emerald-600" : "text-rose-600")}>
        {trend}
      </span>
      <span className="text-slate-500 ml-2">vs semaine dernière</span>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial calls
    fetch('/api/calls')
      .then(res => res.json())
      .then(data => {
        const parsedCalls = data.map((c: any) => typeof c === 'string' ? JSON.parse(c) : c);
        setCalls(parsedCalls);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch calls", err);
        setLoading(false);
      });

    // Listen for real-time updates
    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
      try {
        const newCall = JSON.parse(event.data);
        setCalls(prev => [newCall, ...prev]);
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    return () => eventSource.close();
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Calculate stats
  const totalCalls = calls.length;
  const bookedCalls = calls.filter(c => c.heure_rdv).length;
  const uniqueContacts = new Set(calls.map(c => c.callerNumber)).size;
  const avgDuration = totalCalls > 0 
    ? Math.round(calls.reduce((acc, call) => acc + call.duration, 0) / totalCalls) 
    : 0;

  // Generate weekly stats dynamically
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const dynamicWeeklyStats = days.map(day => ({ name: day, calls: 0, avgDuration: 0, totalDuration: 0 }));
  calls.forEach(call => {
    const date = new Date(call.date);
    const dayName = days[date.getDay()];
    const stat = dynamicWeeklyStats.find(s => s.name === dayName);
    if (stat) {
      stat.calls++;
      stat.totalDuration += call.duration;
    }
  });
  
  dynamicWeeklyStats.forEach(stat => {
    stat.avgDuration = stat.calls > 0 ? Math.round((stat.totalDuration / stat.calls) / 60 * 10) / 10 : 0;
  });
  
  const orderedWeeklyStats = [...dynamicWeeklyStats.slice(1), dynamicWeeklyStats[0]];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <PhoneCall size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">AI Reception</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", 
              activeTab === 'dashboard' ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white")}
          >
            <LayoutDashboard size={18} className="mr-3" />
            Tableau de bord
          </button>
          <button 
            onClick={() => setActiveTab('calls')}
            className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", 
              activeTab === 'calls' ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white")}
          >
            <PhoneCall size={18} className="mr-3" />
            Journal d'appels
          </button>
          <button 
            onClick={() => setActiveTab('contacts')}
            className={cn("w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", 
              activeTab === 'contacts' ? "bg-blue-600 text-white" : "hover:bg-slate-800 hover:text-white")}
          >
            <Users size={18} className="mr-3" />
            Contacts
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={18} className="mr-3" />
            Paramètres
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center md:hidden">
            <button className="text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-semibold text-slate-900">AI Reception</span>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 px-3 py-2 rounded-lg w-96 border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
            <Search size={18} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Rechercher un appel, un nom, un numéro..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-semibold text-sm">
              RC
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Aperçu de l'activité</h1>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-500">Période:</span>
                    <select className="bg-white border border-slate-200 rounded-md px-3 py-1.5 font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                      <option>7 derniers jours</option>
                      <option>30 derniers jours</option>
                      <option>Ce mois-ci</option>
                    </select>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Appels Totaux" value={totalCalls} icon={PhoneCall} trend="+12.5%" trendUp={true} />
                  <StatCard title="Rendez-vous Pris" value={bookedCalls} icon={CalendarCheck} trend="+8.2%" trendUp={true} />
                  <StatCard title="Contacts Uniques" value={uniqueContacts} icon={Users} trend="+5.4%" trendUp={true} />
                  <StatCard title="Durée Moyenne" value={formatDuration(avgDuration)} icon={Clock} trend="-12s" trendUp={true} />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Volume d'appels</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={orderedWeeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="calls" name="Appels totaux" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCalls)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Durée Moyenne (min)</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orderedWeeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                          <Bar dataKey="avgDuration" name="Durée (min)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Calls Preview */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Appels Récents</h3>
                    <button 
                      onClick={() => setActiveTab('calls')}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      Voir tout <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3">Contact</th>
                          <th className="px-6 py-3">Date & Heure</th>
                          <th className="px-6 py-3">Durée</th>
                          <th className="px-6 py-3">Problème</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {calls.slice(0, 4).map((call) => (
                          <tr key={call.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedCall(call)}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{call.callerName}</div>
                              <div className="text-slate-500 text-xs mt-0.5">{call.callerNumber}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {formatDistanceToNow(new Date(call.date), { addSuffix: true, locale: fr })}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {formatDuration(call.duration)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-600 line-clamp-1">{call.probleme || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                Détails
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calls' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Journal d'appels</h1>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    Exporter CSV
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
                  <div className="p-4 border-b border-slate-200 flex items-center space-x-4 bg-slate-50">
                    <div className="flex-1 max-w-md relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="all">Tous les appels</option>
                      <option value="with_rdv">Avec RDV</option>
                      <option value="without_rdv">Sans RDV</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3">Contact</th>
                          <th className="px-6 py-3">Date & Heure</th>
                          <th className="px-6 py-3">Durée</th>
                          <th className="px-6 py-3">Problème</th>
                          <th className="px-6 py-3">Résumé IA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {calls.map((call) => (
                          <tr 
                            key={call.id} 
                            onClick={() => setSelectedCall(call)}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-slate-900">{call.callerName}</div>
                              <div className="text-slate-500 text-xs mt-0.5">{call.callerNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                              <div>{format(new Date(call.date), 'dd MMM yyyy', { locale: fr })}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{format(new Date(call.date), 'HH:mm')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1.5 text-slate-400" />
                                {formatDuration(call.duration)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-600">{call.probleme || '-'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-slate-600 line-clamp-2 text-sm max-w-md">
                                {call.summary}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call Details Slide-over Panel */}
        {selectedCall && (
          <>
            <div 
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
              onClick={() => setSelectedCall(null)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900">Détails de l'appel</h2>
                <button 
                  onClick={() => setSelectedCall(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedCall.callerName}</h3>
                    <p className="text-slate-500 mt-1">{selectedCall.callerNumber}</p>
                  </div>
                  {selectedCall.heure_rdv && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                      <CalendarCheck size={14} className="mr-1.5" />
                      RDV: {selectedCall.heure_rdv}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600 mb-8 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center">
                    <CalendarCheck size={16} className="mr-2 text-slate-400" />
                    {format(new Date(selectedCall.date), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-slate-400" />
                    {formatDuration(selectedCall.duration)}
                  </div>
                </div>

                {selectedCall.probleme && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Problème / Motif</h4>
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-900 text-sm font-medium">
                      {selectedCall.probleme}
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Résumé de l'IA</h4>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-900 text-sm leading-relaxed">
                    {selectedCall.summary}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Transcription</h4>
                    <button className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors">
                      <PlayCircle size={14} className="mr-1.5" />
                      Écouter l'enregistrement
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedCall.transcript.map((msg, idx) => (
                      <div key={idx} className={cn("flex flex-col", msg.speaker === 'AI' ? "items-start" : "items-end")}>
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-xs font-medium text-slate-500">
                            {msg.speaker === 'AI' ? 'Réceptionniste IA' : selectedCall.callerName}
                          </span>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl max-w-[85%] text-sm",
                          msg.speaker === 'AI' 
                            ? "bg-slate-100 text-slate-800 rounded-tl-sm" 
                            : "bg-blue-600 text-white rounded-tr-sm"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex space-x-3">
                <button className="flex-1 bg-white border border-slate-300 text-slate-700 font-medium py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm">
                  Rappeler
                </button>
                <button className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm">
                  Marquer comme traité
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

