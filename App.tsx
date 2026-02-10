
import React, { useState, useEffect, useMemo } from 'react';
import { LibraryItem, ItemStatus, ItemType, NewItemInput, UserProfile, Comment } from './types';
import LibraryItemCard from './components/LibraryItemCard';
import AddBookModal from './components/AddBookModal';
import UserProfileSection from './components/UserProfileSection';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user-profile-v1');
    return saved ? JSON.parse(saved) : {
      name: 'Bibliophile Guest',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Reader-${Math.floor(Math.random() * 1000)}`,
      bio: 'Lover of stories, chaser of endings.',
      joinedAt: Date.now()
    };
  });

  const [items, setItems] = useState<LibraryItem[]>(() => {
    const saved = localStorage.getItem('my-library-v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'READING' | 'FINISHED' | 'REVIEWS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem('my-library-v3', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('user-profile-v1', JSON.stringify(profile));
  }, [profile]);

  const handleAddItem = (input: NewItemInput) => {
    const newItem: LibraryItem = {
      ...input,
      id: Math.random().toString(36).substr(2, 9),
      userId: profile.name,
      status: ItemStatus.READING,
      currentProgress: 0,
      lastUpdated: Date.now(),
      comments: []
    };
    setItems(prev => [newItem, ...prev]);
  };

  const handleUpdateProgress = (id: string, newProgress: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const isNowFinished = newProgress >= item.totalProgress;
        return { 
          ...item, 
          currentProgress: newProgress,
          status: isNowFinished ? ItemStatus.FINISHED : ItemStatus.READING,
          lastUpdated: Date.now()
        };
      }
      return item;
    }));
  };

  const handleUpdateReview = (id: string, rating: number, review: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, rating, review, lastUpdated: Date.now() };
      }
      return item;
    }));
  };

  const handleAddComment = (itemId: string, text: string) => {
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      userName: profile.name,
      userAvatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`,
      text,
      timestamp: Date.now()
    };
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, comments: [...item.comments, newComment], lastUpdated: Date.now() };
      }
      return item;
    }));
  };

  const handleUpdateCover = (id: string, newCoverUrl: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, coverUrl: newCoverUrl, lastUpdated: Date.now() };
      }
      return item;
    }));
  };

  const handleToggleStatus = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === ItemStatus.FINISHED ? ItemStatus.READING : ItemStatus.FINISHED;
        const newProgress = newStatus === ItemStatus.FINISHED ? item.totalProgress : 0;
        return { ...item, status: newStatus, currentProgress: newProgress, lastUpdated: Date.now() };
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Remove from library?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || 
                         (activeTab === 'READING' && item.status === ItemStatus.READING) ||
                         (activeTab === 'FINISHED' && item.status === ItemStatus.FINISHED) ||
                         (activeTab === 'REVIEWS' && (item.review || item.rating || item.comments.length > 0));
        return matchesSearch && matchesTab;
      })
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  }, [items, searchTerm, activeTab]);

  const stats = useMemo(() => {
    const total = items.length;
    const reading = items.filter(i => i.status === ItemStatus.READING).length;
    const finished = items.filter(i => i.status === ItemStatus.FINISHED).length;
    return { total, reading, finished };
  }, [items]);

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 serif hidden sm:block">Bibliotech</h1>
          </div>

          <div className="flex-grow max-w-md relative">
            <input 
              type="text" 
              placeholder="Search stories..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex-shrink-0 relative focus:outline-none"
          >
            <img 
              src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
              className="w-10 h-10 rounded-full border-2 border-indigo-100 hover:border-indigo-500 transition-all"
              alt="Profile"
            />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {showProfile && (
          <UserProfileSection profile={profile} onUpdate={setProfile} />
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
            <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total Books</p><h4 className="text-2xl font-black text-gray-900">{stats.total}</h4></div>
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📚</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
            <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Reading Now</p><h4 className="text-2xl font-black text-indigo-600">{stats.reading}</h4></div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📖</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
            <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Finished</p><h4 className="text-2xl font-black text-green-600">{stats.finished}</h4></div>
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎉</div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap gap-2 bg-gray-200/40 p-1 rounded-2xl">
            {(['ALL', 'READING', 'FINISHED', 'REVIEWS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'REVIEWS' ? 'Community Chat' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredItems.map(item => (
              <LibraryItemCard 
                key={item.id} 
                item={item} 
                currentUser={profile}
                onUpdateProgress={handleUpdateProgress}
                onUpdateReview={handleUpdateReview}
                onUpdateCover={handleUpdateCover}
                onAddComment={handleAddComment}
                onDelete={handleDeleteItem}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 mb-2">No adventures yet</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">Click the button below to add your first book or comic to the shelf.</p>
            <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-1">Add to Shelf</button>
          </div>
        )}
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-3xl shadow-2xl flex items-center justify-center hover:bg-indigo-700 hover:rotate-90 transition-all active:scale-90 z-40">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      </button>

      <AddBookModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddItem} />
    </div>
  );
};

export default App;
