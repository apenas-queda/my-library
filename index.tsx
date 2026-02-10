
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
enum ItemType { BOOK = 'BOOK', COMIC = 'COMIC' }
enum ItemStatus { READING = 'READING', FINISHED = 'FINISHED' }

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
  joinedAt: number;
}

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: ItemType;
  status: ItemStatus;
  currentProgress: number;
  totalProgress: number;
  coverUrl: string;
  lastUpdated: number;
  rating?: number;
  review?: string;
  comments: Comment[];
}

// --- Services ---
// Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fetchBookDetails = async (title: string, author: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `For "${title}" by "${author}", provide total pages/chapters and a 1-sentence description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalPages: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["totalPages", "description"]
        }
      }
    });
    // Access .text property directly
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

// --- Components ---

const ProgressBar = ({ current, total, color = 'bg-indigo-600' }: { current: number, total: number, color?: string }) => {
  const pct = Math.min(Math.round((current / total) * 100), 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
        <span>{pct}% concluído</span>
        <span>{current} / {total}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// Fixed typing by using React.FC to allow React's special props like 'key' in a JSX context
const LibraryCard: React.FC<{ 
  item: LibraryItem; 
  user: UserProfile; 
  onUpdate: (item: LibraryItem) => void; 
  onDelete: (id: string) => void; 
}> = ({ item, user, onUpdate, onDelete }) => {
  const [tab, setTab] = useState<'PROG' | 'REV'>('PROG');
  const [newComment, setNewComment] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleStatus = () => {
    const isFin = item.status === ItemStatus.FINISHED;
    onUpdate({
      ...item,
      status: isFin ? ItemStatus.READING : ItemStatus.FINISHED,
      currentProgress: isFin ? 0 : item.totalProgress,
      lastUpdated: Date.now()
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ ...item, coverUrl: reader.result as string, lastUpdated: Date.now() });
      reader.readAsDataURL(file);
    }
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.name,
      userAvatar: user.avatar,
      text: newComment,
      timestamp: Date.now()
    };
    onUpdate({ ...item, comments: [...item.comments, comment], lastUpdated: Date.now() });
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500">
      <div className="w-full md:w-44 h-64 md:h-auto relative bg-slate-50 overflow-hidden">
        <img src={item.coverUrl || `https://picsum.photos/seed/${item.id}/300/450`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button onClick={() => fileRef.current?.click()} className="bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl">Trocar Capa</button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleUpload} />
        </div>
        <div className="absolute top-4 left-4">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-sm ${item.type === ItemType.BOOK ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
            {item.type === ItemType.BOOK ? 'Livro' : 'HQ'}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-4">
          <div className="truncate pr-4">
            <h3 className="text-xl font-black text-slate-900 truncate">{item.title}</h3>
            <p className="text-sm text-slate-400 font-medium italic">por {item.author}</p>
          </div>
          <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <div className="flex gap-4 border-b border-slate-50 mb-4">
          <button onClick={() => setTab('PROG')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all ${tab === 'PROG' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Progresso</button>
          <button onClick={() => setTab('REV')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all ${tab === 'REV' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Resenha ({item.comments.length})</button>
        </div>

        <div className="flex-grow">
          {tab === 'PROG' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
              <ProgressBar current={item.currentProgress} total={item.totalProgress} color={item.status === ItemStatus.FINISHED ? 'bg-green-500' : 'bg-indigo-600'} />
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                <input 
                  type="number" 
                  className="w-20 bg-transparent text-lg font-black text-slate-900 outline-none" 
                  value={item.currentProgress}
                  onChange={(e) => onUpdate({ ...item, currentProgress: parseInt(e.target.value) || 0, lastUpdated: Date.now() })}
                />
                <button onClick={handleStatus} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${item.status === ItemStatus.FINISHED ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white'}`}>
                  {item.status === ItemStatus.FINISHED ? 'Concluído ✓' : 'Finalizar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 h-48 flex flex-col">
              <div className="flex-shrink-0">
                <div className="flex gap-1 mb-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => onUpdate({...item, rating: s})} className={`text-xl ${s <= (item.rating || 0) ? 'text-amber-400' : 'text-slate-100'}`}>★</button>
                  ))}
                </div>
                <textarea 
                  className="w-full p-2 bg-slate-50 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-300 resize-none h-16" 
                  placeholder="O que achou da história?"
                  value={item.review || ''}
                  onChange={(e) => onUpdate({...item, review: e.target.value})}
                />
              </div>
              <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {item.comments.map(c => (
                  <div key={c.id} className="flex gap-2 items-start">
                    <img src={c.userAvatar} className="w-5 h-5 rounded-full bg-slate-100" alt={c.userName} />
                    <div className="bg-slate-50 rounded-xl p-2 flex-grow">
                      <p className="text-[10px] text-slate-600 leading-tight">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={addComment} className="flex gap-2">
                <input className="flex-grow text-[11px] bg-indigo-50 border-none rounded-full px-3 py-1.5 outline-none" placeholder="Comentar..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button className="bg-indigo-600 text-white p-1.5 rounded-full"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [items, setItems] = useState<LibraryItem[]>(() => JSON.parse(localStorage.getItem('lib-v4') || '[]'));
  const [profile, setProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('prof-v4') || JSON.stringify({
    name: 'Leitor Curioso',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    bio: 'Minha jornada literária.',
    joinedAt: Date.now()
  })));
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => localStorage.setItem('lib-v4', JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('prof-v4', JSON.stringify(profile)), [profile]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = fd.get('title') as string;
    const author = fd.get('author') as string;
    const type = fd.get('type') as ItemType;

    setLoading(true);
    const details = await fetchBookDetails(title, author);
    
    const newItem: LibraryItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      author,
      type,
      status: ItemStatus.READING,
      currentProgress: 0,
      totalProgress: details?.totalPages || 100,
      coverUrl: '',
      comments: [],
      lastUpdated: Date.now()
    };

    setItems([newItem, ...items]);
    setLoading(false);
    setShowAdd(false);
  };

  const filtered = useMemo(() => items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.author.toLowerCase().includes(search.toLowerCase())), [items, search]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 serif tracking-tight hidden sm:block">BiblioStack</h1>
          </div>

          <div className="flex-grow max-w-md mx-8 relative group">
            <input 
              type="text" 
              placeholder="Buscar na estante..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-black text-slate-900 leading-none">{profile.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nível: Curador</p>
            </div>
            <img src={profile.avatar} className="w-10 h-10 rounded-2xl border-2 border-indigo-50 shadow-sm" alt={profile.name} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <section className="mb-12">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black serif mb-4 leading-tight">Sua jornada, uma página de cada vez.</h2>
              <p className="text-indigo-100 text-lg mb-8 opacity-90">Organize seus livros e HQs, acompanhe seu progresso e eternize suas memórias literárias.</p>
              <button onClick={() => setShowAdd(true)} className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 active:scale-95 transition-all">Adicionar à Estante</button>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 -skew-x-12 translate-x-1/4" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map(item => (
            <LibraryCard 
              key={item.id} 
              item={item} 
              user={profile}
              onUpdate={u => setItems(items.map(i => i.id === u.id ? u : i))}
              onDelete={id => setItems(items.filter(i => i.id !== id))}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 rounded-[3rem]">
              <p className="text-slate-400 font-bold serif text-xl">Nenhum tesouro encontrado aqui...</p>
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 serif">Novo na Estante</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-300 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <label className="flex-1 text-center py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all has-[:checked]:bg-white has-[:checked]:text-indigo-600 has-[:checked]:shadow-sm text-slate-400">
                  <input type="radio" name="type" value={ItemType.BOOK} className="hidden" defaultChecked /> Livro
                </label>
                <label className="flex-1 text-center py-2 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all has-[:checked]:bg-white has-[:checked]:text-indigo-600 has-[:checked]:shadow-sm text-slate-400">
                  <input type="radio" name="type" value={ItemType.COMIC} className="hidden" /> HQ
                </label>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título da Obra</label>
                <input required name="title" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: O Pequeno Príncipe" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Autor ou Ilustrador</label>
                <input required name="author" className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Antoine de Saint-Exupéry" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                {loading ? 'Consultando IA...' : 'Adicionar Agora'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
