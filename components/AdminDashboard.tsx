
import React, { useState, useEffect } from 'react';
import { Wallpaper, MediaType } from '../types';
import { fetchWallpapersFromCloud, pushWallpaperToCloud, deleteWallpaperFromCloud } from '../services/syncService';
import { generateMetadata } from '../services/geminiService';
import { PlusIcon, AdminIcon } from './Icons';

interface Props {
  onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  // Form State
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [description, setDescription] = useState("");

  const refreshList = async () => {
    setIsLoading(true);
    const data = await fetchWallpapersFromCloud();
    setWallpapers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress("Reading local file...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setMediaUrl(base64);
      setMediaType(file.type.startsWith('video') ? MediaType.VIDEO : MediaType.IMAGE);
      setIsUploading(false);
      setUploadProgress("");
    };
    reader.readAsDataURL(file);
  };

  const handleAddWallpaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    setIsUploading(true);
    setUploadProgress("AI is analyzing media...");

    // Use Gemini to generate cool metadata based on the user's description
    const metadata = await generateMetadata(description || "A beautiful wallpaper");

    setUploadProgress("Syncing to cloud...");

    const newWallpaper: Wallpaper = {
      id: Date.now().toString(),
      type: mediaType,
      url: mediaUrl,
      title: metadata.title,
      description: metadata.description,
      author: 'Admin',
      likes: 0,
      tags: metadata.tags,
      createdAt: Date.now(),
    };

    await pushWallpaperToCloud(newWallpaper);
    await refreshList();
    
    // Reset Form
    setMediaUrl("");
    setDescription("");
    setIsUploading(false);
    setUploadProgress("");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this? This will sync for everyone.")) {
      setIsLoading(true);
      await deleteWallpaperFromCloud(id);
      await refreshList();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 pb-24 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <AdminIcon className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Cloud Synced</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition flex items-center gap-2"
          >
            {isLoading && <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
            Back to Feed
          </button>
        </header>

        {/* Upload Section */}
        <section className="bg-neutral-800 rounded-xl p-6 mb-8 border border-neutral-700 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5 text-indigo-400" />
            Add New Wallpaper
          </h2>
          <form onSubmit={handleAddWallpaper} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Source File</label>
                <input 
                  type="file" 
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="w-full bg-neutral-700 p-2 rounded border border-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Or Paste URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/media.mp4"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.toLowerCase().match(/\.(mp4|webm|ogg)$/)) {
                      setMediaType(MediaType.VIDEO);
                    } else {
                      setMediaType(MediaType.IMAGE);
                    }
                  }}
                  className="w-full bg-neutral-700 p-2 rounded border border-neutral-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-neutral-400 mb-1">Short Description (for AI Analysis)</label>
              <textarea 
                rows={2}
                placeholder="Describe the mood, colors, and subject..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-700 p-2 rounded border border-neutral-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button 
              disabled={isUploading || !mediaUrl}
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              {isUploading ? (uploadProgress || "Uploading...") : "Publish to Cloud"}
            </button>
          </form>
        </section>

        {/* Current Content Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Current Library ({wallpapers.length})</h2>
            <button onClick={refreshList} className="text-xs text-indigo-400 font-bold uppercase hover:underline">
              Force Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {wallpapers.map(wp => (
              <div key={wp.id} className="group relative aspect-[9/16] bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                {wp.type === MediaType.VIDEO ? (
                  <video src={wp.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                ) : (
                  <img src={wp.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-2">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest text-center">{wp.title}</span>
                  <button 
                    onClick={() => handleDelete(wp.id)}
                    className="p-2 bg-red-600/80 rounded-full hover:bg-red-500 transition scale-90 group-hover:scale-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                
                {wp.type === MediaType.VIDEO && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[8px] uppercase font-black tracking-tighter">Video</div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
