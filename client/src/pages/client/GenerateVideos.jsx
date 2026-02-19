import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, Download, Share2, Trash2 } from 'lucide-react';

export default function GenerateVideos() {
  const [activeTab, setActiveTab] = useState('generate');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    duration: 30,
    tone: 'professional'
  });
  const [shareModal, setShareModal] = useState(null);
  const [sharePlatform, setSharePlatform] = useState('instagram');
  const [shareCaption, setShareCaption] = useState('');

  useEffect(() => {
    if (activeTab === 'my-videos') {
      fetchUserVideos();
      fetchStats();
    }
  }, [activeTab]);

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/videos/get-videos');
      if (response.data.success) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/videos/get-stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleGenerateScript = async (e) => {
    e.preventDefault();
    if (!formData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/videos/generate-script', formData);
      if (response.data.success) {
        toast.success('Video script generated successfully!');
        setFormData({ topic: '', duration: 30, tone: 'professional' });
        // Refresh videos list
        setTimeout(() => fetchUserVideos(), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handleShareVideo = async (videoId) => {
    if (!shareCaption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/videos/share-to-social', {
        videoId,
        platform: sharePlatform,
        caption: shareCaption
      });
      if (response.data.success) {
        toast.success(`Video shared to ${sharePlatform}!`);
        setShareModal(null);
        setShareCaption('');
      }
    } catch (error) {
      toast.error('Failed to share video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await axios.delete(`/api/videos/delete-video/${videoId}`);
      if (response.data.success) {
        toast.success('Video deleted successfully');
        fetchUserVideos();
      }
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-4">
            Video Generation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
            Create AI-powered videos and share them on social media
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'generate'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-slate-300'
            }`}
          >
            Generate Video
          </button>
          <button
            onClick={() => setActiveTab('my-videos')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'my-videos'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 hover:text-slate-300'
            }`}
          >
            My Videos
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white    dark:bg-slate-800 rounded-lg p-8 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white mb-6">
                  Create a New Video
                </h2>

                <form onSubmit={handleGenerateScript} className="space-y-6">
                  <div>
                    <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">
                      Video Topic
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="e.g., How to cook pasta"
                      className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="15"
                        max="300"
                        className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">
                        Tone
                      </label>
                      <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="funny">Funny</option>
                        <option value="educational">Educational</option>
                        <option value="inspirational">Inspirational</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader size={20} className="animate-spin" />}
                    {loading ? 'Generating...' : 'Generate Video Script'}
                  </button>
                </form>

                <div className="mt-8 p-4 bg-blue-900/20 border border-blue-900 rounded-lg">
                  <p className="text-blue-300">
                    💡 <strong>Tip:</strong> Premium users can generate unlimited videos. Free users have 5 videos per month.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
                <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold mb-4">Quick Stats</h3>
                <div className="space-y-3 text-slate-300">
                  <div>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">Total Videos</p>
                    <p className="text-2xl font-bold text-blue-400">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">Social Shares</p>
                    <p className="text-2xl font-bold text-green-400">0</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">Status</p>
                    <p className="text-blue-400">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Videos Tab */}
        {activeTab === 'my-videos' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">Loading videos...</div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div
                    key={video.id}
                    className="bg-white    dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700 hover:border-blue-600 transition-colors"
                  >
                    {/* Video Thumbnail */}
                    <div className="bg-white    dark:bg-slate-900 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-sm">
                          {video.status === 'completed' ? 'Completed' : 'Processing'}
                        </p>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <p className="text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 text-xs mb-2">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-4 line-clamp-2">
                        {video.script?.substring(0, 80)}...
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {video.status === 'completed' && (
                          <>
                            <button
                              onClick={() => setShareModal(video.id)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                              <Share2 size={16} /> Share
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300 py-12">
                <div className="text-6xl mb-4">📹</div>
                <p>No videos yet. Create your first video!</p>
              </div>
            )}
          </div>
        )}

        {/* Share Modal */}
        {shareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white    dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-bold text-lg mb-4">Share Video</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">
                    Platform
                  </label>
                  <select
                    value={sharePlatform}
                    onChange={(e) => setSharePlatform(e.target.value)}
                    className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium mb-2">
                    Caption
                  </label>
                  <textarea
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    placeholder="Add a caption..."
                    rows="4"
                    className="w-full bg-white    dark:bg-slate-900 border border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-gray-200 dark:border-slate-600 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShareModal(null)}
                    className="flex-1 bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-gray-50 dark:bg-slate-700 hover:bg-slate-600 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleShareVideo(shareModal)}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {loading ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
