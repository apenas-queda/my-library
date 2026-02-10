
import React, { useState, useRef } from 'react';
import { LibraryItem, ItemStatus, ItemType, UserProfile, Comment } from '../types';
import ProgressBar from './ProgressBar';

interface LibraryItemCardProps {
  item: LibraryItem;
  currentUser: UserProfile;
  onUpdateProgress: (id: string, newProgress: number) => void;
  onUpdateReview: (id: string, rating: number, review: string) => void;
  onUpdateCover: (id: string, newCoverUrl: string) => void;
  onAddComment: (itemId: string, comment: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const LibraryItemCard: React.FC<LibraryItemCardProps> = ({ 
  item, 
  currentUser,
  onUpdateProgress, 
  onUpdateReview,
  onUpdateCover,
  onAddComment,
  onDelete,
  onToggleStatus 
}) => {
  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'REVIEW'>('PROGRESS');
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [tempProgress, setTempProgress] = useState(item.currentProgress.toString());
  const [tempRating, setTempRating] = useState(item.rating || 0);
  const [tempReview, setTempReview] = useState(item.review || '');
  const [tempCoverUrl, setTempCoverUrl] = useState(item.coverUrl || '');
  const [newComment, setNewComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFinished = item.status === ItemStatus.FINISHED;
  const typeLabel = item.type === ItemType.BOOK ? 'Book' : 'Comic';

  const handleSaveProgress = () => {
    const val = parseInt(tempProgress);
    if (!isNaN(val) && val >= 0 && val <= item.totalProgress) {
      onUpdateProgress(item.id, val);
    } else {
      setTempProgress(item.currentProgress.toString());
    }
    setIsEditingProgress(false);
  };

  const handleSaveReview = () => {
    onUpdateReview(item.id, tempRating, tempReview);
  };

  const handleSaveCover = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tempCoverUrl.trim()) {
      onUpdateCover(item.id, tempCoverUrl);
    }
    setIsEditingCover(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTempCoverUrl(result);
        onUpdateCover(item.id, result);
        setIsEditingCover(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(item.id, newComment);
    setNewComment('');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row h-full group`}>
      {/* Cover Side */}
      <div className="w-full sm:w-40 h-56 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
        <img 
          src={item.coverUrl || `https://picsum.photos/seed/${item.id}/300/450`} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
          <button 
            onClick={() => {
              setIsEditingCover(true);
              setTempCoverUrl(item.coverUrl);
            }}
            className="bg-white/90 hover:bg-white text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center space-x-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Change Cover</span>
          </button>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            item.type === ItemType.BOOK ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {typeLabel}
          </span>
          {isFinished && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
              Done ✓
            </span>
          )}
        </div>

        {isEditingCover && (
          <div className="absolute inset-0 z-10 bg-white/95 p-4 flex flex-col justify-center items-center text-center animate-in fade-in duration-200">
            <h4 className="text-xs font-black text-gray-900 mb-3 uppercase tracking-widest">Update Cover</h4>
            <div className="w-full space-y-3">
              <div className="flex space-x-2">
                <input 
                  autoFocus
                  type="url"
                  value={tempCoverUrl}
                  onChange={(e) => setTempCoverUrl(e.target.value)}
                  placeholder="URL..."
                  className="flex-grow px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <div className="flex space-x-1">
                <button onClick={() => handleSaveCover()} className="flex-1 bg-indigo-600 text-white text-[10px] font-bold py-2 rounded-lg shadow-sm">Save</button>
                <button onClick={() => setIsEditingCover(false)} className="flex-1 bg-gray-100 text-gray-600 text-[10px] font-bold py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Side */}
      <div className="p-6 flex-grow flex flex-col overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-grow pr-4">
            <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">{item.title}</h3>
            <p className="text-gray-500 text-sm italic font-medium">by {item.author}</p>
          </div>
          <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-4 border-b border-gray-100 mb-4 text-sm">
          <button 
            onClick={() => setActiveTab('PROGRESS')}
            className={`pb-2 font-semibold transition-all ${activeTab === 'PROGRESS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Bookmark
          </button>
          <button 
            onClick={() => setActiveTab('REVIEW')}
            className={`pb-2 font-semibold transition-all ${activeTab === 'REVIEW' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Review & Chat {item.comments.length > 0 ? `(${item.comments.length})` : ''}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {activeTab === 'PROGRESS' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <ProgressBar current={item.currentProgress} total={item.totalProgress} color={isFinished ? 'bg-green-500' : 'bg-indigo-600'} />
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block uppercase font-bold tracking-tight">On page</span>
                    {isEditingProgress ? (
                      <input 
                        autoFocus type="number" 
                        className="w-20 px-2 py-1 border border-indigo-300 rounded text-sm font-bold outline-none"
                        value={tempProgress}
                        onChange={(e) => setTempProgress(e.target.value)}
                        onBlur={handleSaveProgress}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveProgress()}
                      />
                    ) : (
                      <button onClick={() => setIsEditingProgress(true)} className="text-lg font-black text-gray-800 hover:text-indigo-600">
                        {item.currentProgress} <span className="text-gray-400 text-sm font-medium">/ {item.totalProgress}</span>
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => onToggleStatus(item.id)} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${isFinished ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {isFinished ? 'Reset' : 'Finish'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 flex flex-col h-full">
              <div className="flex-shrink-0">
                <div className="flex space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => { setTempRating(star); onUpdateReview(item.id, star, tempReview); }} className={`text-xl ${star <= (item.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
                <textarea
                  placeholder="Review the story..."
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs min-h-[60px] outline-none focus:ring-1 focus:ring-indigo-400"
                  value={tempReview}
                  onChange={(e) => setTempReview(e.target.value)}
                  onBlur={handleSaveReview}
                />
              </div>

              {/* Comments Section */}
              <div className="flex-grow overflow-y-auto space-y-3 pt-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Community Discussion</p>
                {item.comments.length > 0 ? (
                  item.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <img src={comment.userAvatar} alt="" className="w-6 h-6 rounded-full bg-indigo-50" />
                      <div className="bg-gray-50 rounded-2xl rounded-tl-none p-2 flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-700">{comment.userName}</span>
                          <span className="text-[9px] text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-tight">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No comments yet. Start the conversation!</p>
                )}
              </div>

              <form onSubmit={handlePostComment} className="flex-shrink-0 pt-3">
                <div className="flex gap-2">
                  <input 
                    className="flex-grow px-3 py-2 bg-indigo-50 border-none rounded-full text-xs outline-none focus:ring-1 focus:ring-indigo-300"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors active:scale-90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryItemCard;
