import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, Download, Share2, Trash2, Play, Video, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { generateVideo, fetchVideos, fetchVideoStats, deleteVideo, shareVideo } from '../../redux/slices/videoSlice';
import { fetchSocialAccounts, initiateSocialLogin } from '../../redux/slices/socialSlice';

export default function GenerateVideos() {
  const [activeTab, setActiveTab] = useState('generate');
  const [formData, setFormData] = useState({
    topic: '',
    duration: 30,
    tone: 'professional'
  });
  const [shareModal, setShareModal] = useState(null);
  const [sharePlatforms, setSharePlatforms] = useState(['instagram', 'facebook', 'tiktok']);
  const [shareCaption, setShareCaption] = useState('');

  const dispatch = useDispatch();
  const { videos, stats, isLoading, error, success } = useSelector(state => state.video);
  const { accounts: socialAccounts, isLoading: socialLoading } = useSelector(state => state.social);

  useEffect(() => {
    if (activeTab === 'my-videos') {
      dispatch(fetchVideos());
      dispatch(fetchVideoStats());
      dispatch(fetchSocialAccounts());
    }
  }, [activeTab, dispatch]);

  // check URL params for social login callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const platform = params.get('platform');
    const connected = params.get('connected');
    if (platform && connected === '1') {
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected!`);
      // remove params so it doesn't recur
      params.delete('platform');
      params.delete('connected');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
      dispatch(fetchSocialAccounts());
    }
  }, [dispatch]);

  // Show toast on success or error
  useEffect(() => {
    if (success) {
      toast.success('Operation completed successfully!');
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleGenerateVideo = async (e) => {
    e.preventDefault();
    if (!formData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    dispatch(generateVideo(formData));
    setFormData({ topic: '', duration: 30, tone: 'professional' });
  };

  const handleShareVideo = async (videoId) => {
    if (!shareCaption.trim()) {
      toast.error('Please enter a caption');
      return;
    }
    if (sharePlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    dispatch(shareVideo({ videoId, platforms: sharePlatforms, caption: shareCaption }));
    setShareModal(null);
    setShareCaption('');
    setSharePlatforms(['instagram', 'facebook', 'tiktok']);
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    dispatch(deleteVideo(videoId));
  };

  const handleSocialLogin = async (platform) => {
    dispatch(initiateSocialLogin({ platform, redirectUrl: window.location.href }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Video Generator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into stunning videos with AI-powered content creation and seamless social media sharing
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-sm border border-gray-200 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 px-6 py-3 font-medium rounded-md transition-all duration-200 ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Create Video
          </button>
          <button
            onClick={() => setActiveTab('my-videos')}
            className={`flex-1 px-6 py-3 font-medium rounded-md transition-all duration-200 ${
              activeTab === 'my-videos'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            My Videos
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Create New Video</h2>
                </div>

                <form onSubmit={handleGenerateVideo} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Video Topic
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleInputChange}
                      placeholder="e.g., How to cook pasta, Benefits of meditation..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="15"
                        max="300"
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">
                        Tone
                      </label>
                      <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading && <Loader size={20} className="animate-spin" />}
                    <Video className="w-5 h-5" />
                    {isLoading ? 'Generating...' : 'Generate Video'}
                  </button>
                </form>

                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">💡 Pro Tip</p>
                      <p className="text-blue-700 text-sm mt-1">
                        Each video generation costs 5 credits from your monthly limit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Videos</p>
                      <p className="text-2xl font-bold text-blue-600">{stats?.totalVideos || 0}</p>
                    </div>
                    <Video className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Social Shares</p>
                      <p className="text-2xl font-bold text-purple-600">{stats?.totalShares || 0}</p>
                    </div>
                    <Share2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Status</p>
                      <p className="text-green-600 font-semibold">Active</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Videos Tab */}
        {activeTab === 'my-videos' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-gray-600">
                  <Loader className="w-6 h-6 animate-spin" />
                  <p>Loading videos...</p>
                </div>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div
                    key={video.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Video Player or Thumbnail */}
                    {video.video_url ? (
                      <div className="aspect-video relative">
                        <video 
                          src={video.video_url} 
                          controls 
                          className="w-full h-full object-cover rounded-t-2xl"
                        />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center relative">
                        <div className="text-center">
                          <div className="text-5xl mb-3">🎬</div>
                          <p className={`text-sm font-medium px-3 py-1 rounded-full ${
                            video.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {video.status === 'completed' ? 'Completed' : 'Processing'}
                          </p>
                        </div>
                        {video.status === 'completed' && (
                          <div className="absolute top-3 right-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Video Info */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {video.duration}s
                        </div>
                      </div>
                      <p className="text-gray-800 font-semibold mb-4 line-clamp-2 leading-relaxed">
                        {video.script}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {video.status === 'completed' && (
                          <>
                            {socialAccounts && socialAccounts.length > 0 ? (
                              <button
                                onClick={() => setShareModal(video.id)}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              >
                                <Share2 size={16} />
                                Share
                              </button>
                            ) : (
                              <button
                                onClick={() => setShareModal(video.id)}
                                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              >
                                <Share2 size={16} />
                                Connect Social
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 hover:shadow-md"
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
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="text-7xl mb-6">🎬</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No videos yet</h3>
                  <p className="text-gray-600 mb-6">Create your first AI-powered video to get started!</p>
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Create Your First Video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Share Modal */}
        {shareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Share Video</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Platforms
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'instagram', label: '📸 Instagram', color: 'from-pink-500 to-purple-600' },
                      { value: 'tiktok', label: '🎵 TikTok', color: 'from-black to-gray-800' },
                      { value: 'facebook', label: '👥 Facebook', color: 'from-blue-600 to-blue-800' }
                    ].map(platform => {
                      const account = socialAccounts?.find(account => account.platform === platform.value);
                      const isConnected = !!account;
                      return (
                        <div key={platform.value} className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={sharePlatforms.includes(platform.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSharePlatforms([...sharePlatforms, platform.value]);
                                } else {
                                  setSharePlatforms(sharePlatforms.filter(p => p !== platform.value));
                                }
                              }}
                              disabled={!isConnected}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            {platform.label}
                            {isConnected && (
                              <span className="text-green-500 text-sm">
                                ✓ {account.page_name ? `Connected to ${account.page_name}` : 'Connected'}
                              </span>
                            )}
                          </label>
                          {!isConnected && (
                            <button
                              onClick={() => handleSocialLogin(platform.value)}
                              disabled={socialLoading}
                              className={`bg-gradient-to-r ${platform.color} hover:opacity-90 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200`}
                            >
                              {socialLoading ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Caption
                  </label>
                  <textarea
                    value={shareCaption}
                    onChange={(e) => setShareCaption(e.target.value)}
                    placeholder="Add an engaging caption..."
                    rows="4"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShareModal(null)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleShareVideo(shareModal)}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader size={16} className="animate-spin" />
                        Sharing...
                      </div>
                    ) : (
                      'Share Video'
                    )}
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
