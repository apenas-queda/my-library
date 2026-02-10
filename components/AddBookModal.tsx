
import React, { useState, useRef } from 'react';
import { ItemType, NewItemInput } from '../types';
import { fetchBookDetails } from '../services/geminiService';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: NewItemInput) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<NewItemInput>({
    title: '',
    author: '',
    type: ItemType.BOOK,
    totalProgress: 100,
    coverUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [coverMode, setCoverMode] = useState<'URL' | 'FILE'>('URL');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) return;
    onAdd(formData);
    setFormData({
      title: '',
      author: '',
      type: ItemType.BOOK,
      totalProgress: 100,
      coverUrl: ''
    });
    setAiSuggestion(null);
    onClose();
  };

  const handleAiLookup = async () => {
    if (!formData.title) return;
    setLoading(true);
    const details = await fetchBookDetails(formData.title, formData.author);
    if (details) {
      setFormData(prev => ({
        ...prev,
        totalProgress: details.totalPages || prev.totalProgress,
        coverUrl: prev.coverUrl || `https://picsum.photos/seed/${formData.title.length}/300/450`
      }));
      setAiSuggestion(details.description);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Add to Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex space-x-4 mb-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: ItemType.BOOK })}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-all ${
                formData.type === ItemType.BOOK 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📚 Book
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: ItemType.COMIC })}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-all ${
                formData.type === ItemType.COMIC 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🦸 Comic
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="The Great Gatsby..."
              />
              <button
                type="button"
                onClick={handleAiLookup}
                disabled={loading || !formData.title}
                className="px-3 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                title="Lookup details with AI"
              >
                {loading ? '...' : '✨'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Author / Illustrator</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="F. Scott Fitzgerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {formData.type === ItemType.BOOK ? 'Total Pages' : 'Total Chapters'}
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.totalProgress}
                onChange={(e) => setFormData({ ...formData, totalProgress: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">Cover Image</label>
              <div className="flex bg-gray-100 rounded-lg p-0.5 text-[10px] font-bold">
                <button 
                  type="button" 
                  onClick={() => setCoverMode('URL')}
                  className={`px-2 py-1 rounded-md transition-all ${coverMode === 'URL' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >URL</button>
                <button 
                  type="button" 
                  onClick={() => setCoverMode('FILE')}
                  className={`px-2 py-1 rounded-md transition-all ${coverMode === 'FILE' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >FILE</button>
              </div>
            </div>

            {coverMode === 'URL' ? (
              <input
                type="url"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all bg-gray-50 overflow-hidden"
              >
                {formData.coverUrl && formData.coverUrl.startsWith('data:') ? (
                  <img src={formData.coverUrl} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-xs text-gray-400 mt-1 font-medium">Click to upload image</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            )}
          </div>

          {aiSuggestion && (
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-700 italic">“{aiSuggestion}”</p>
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-gray-600 font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Save to Shelf
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
