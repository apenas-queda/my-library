
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface UserProfileSectionProps {
  profile: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = () => {
    onUpdate(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img 
            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} 
            alt={profile.name} 
            className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-inner object-cover"
          />
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer">
              <span className="text-[10px] text-white font-bold">Edit</span>
            </div>
          )}
        </div>

        <div className="flex-grow text-center sm:text-left">
          {isEditing ? (
            <div className="space-y-3">
              <input 
                className="text-2xl font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full max-w-xs outline-none focus:ring-2 focus:ring-indigo-500"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
              />
              <textarea 
                className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                value={tempProfile.bio}
                rows={2}
                onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
              />
              <div className="flex gap-2 justify-center sm:justify-start">
                <button onClick={handleSave} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors">Save Profile</button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-black text-gray-900">{profile.name}</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-md">{profile.bio || "No bio yet. Tell the world about your reading journey!"}</p>
              <div className="flex items-center justify-center sm:justify-start gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">📖</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-600">✨</div>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reader Level: Legend</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;
