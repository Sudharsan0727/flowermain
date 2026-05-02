import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {
  IconUpload,
  IconCopy,
  IconTrash,
  IconCheck,
  IconX,
  IconPhoto,
  IconSearch,
  IconExternalLink
} from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";

const MediaManagement = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ title: '', text: '', type: 'success' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/media`, { credentials: 'include' });
      const data = await res.json();
      setMedia(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching media:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch(`${API_BASE}/api/media`, { credentials: 'include',
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchMedia();
        setStatusMessage({
          title: 'Upload Successful',
          text: `${files.length} images have been added to your media library.`,
          type: 'success'
        });
        setShowStatusModal(true);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatusMessage({
        title: 'Upload Failed',
        text: 'There was an error during the batch upload.',
        type: 'error'
      });
      setShowStatusModal(true);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setStatusMessage({
      title: 'Link Copied!',
      text: 'Image URL has been copied to your clipboard. You can now use it in your bulk upload file.',
      type: 'success'
    });
    setShowStatusModal(true);
  };

  const handleDeleteRequest = (item) => {
    setAssetToDelete(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/media/${assetToDelete.id}`, { method: 'DELETE' , credentials: 'include' });
      if (res.ok) {
        setMedia(media.filter(m => m.id !== assetToDelete.id));
        setShowDeleteConfirm(false);
        setAssetToDelete(null);
        setStatusMessage({
          title: 'Asset Deleted',
          text: 'The image has been permanently removed from your library.',
          type: 'success'
        });
        setShowStatusModal(true);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatusMessage({
          title: 'Delete Failed',
          text: errorData.message || 'There was an error removing the asset on the server.',
          type: 'error'
        });
        setShowStatusModal(true);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setStatusMessage({
        title: 'Delete Failed',
        text: 'There was an error removing the asset.',
        type: 'error'
      });
      setShowStatusModal(true);
      setShowDeleteConfirm(false);
    }
  };

  const filteredMedia = media.filter(m =>
    m.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AdminLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">Media Library</h1>
            <p className="text-slate-500 mt-1">Host and manage images for your products and banners.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="media-upload-input"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleUpload}
            />
            <button
              onClick={() => document.getElementById('media-upload-input').click()}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-violet-800 transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <IconUpload size={18} />
              )}
              {uploading ? 'Uploading...' : 'Upload Assets'}
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/30 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-6 text-sm font-bold">
            <div className="text-slate-400">
              Total Assets: <span className="text-slate-900">{media.length}</span>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your library...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <IconPhoto size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No assets found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Upload your first image to start building your media library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <img
                    src={getImageUrl(item.url)}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => window.open(getImageUrl(item.url), '_blank')}
                      className="p-2 bg-white text-slate-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                      title="View Full Image"
                    >
                      <IconExternalLink size={18} />
                    </button>
                    <button
                      onClick={() => copyToClipboard(getImageUrl(item.url))}
                      className="p-2 bg-white text-slate-900 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                      title="Copy Link"
                    >
                      <IconCopy size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(item)}
                      className="p-2 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg"
                      title="Delete"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-800 truncate mb-1" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {statusMessage.type === 'success' ? <IconCheck size={40} stroke={2.5} /> : <IconX size={40} stroke={2.5} />}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{statusMessage.title}</h3>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">{statusMessage.text}</p>
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <IconTrash size={32} />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-3 font-serif">Delete this asset?</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-slate-700">"{assetToDelete?.filename}"</span>? This action cannot be undone and will break any product links using this URL.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaManagement;



