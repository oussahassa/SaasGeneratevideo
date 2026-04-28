import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateVideo, fetchVideos, fetchVideoStats, deleteVideo, shareVideo } from '../redux/slices/videoSlice';
import { fetchSocialAccounts, initiateSocialLogin } from '../redux/slices/socialSlice';
import { refreshCredits } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

// Constants
export const VIDEO_DURATION_LIMITS = { min: 15, max: 300 };
export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'funny', label: 'Funny' },
  { value: 'educational', label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' }
];

export const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: '📸 Instagram', color: 'from-pink-500 to-purple-600' },
  { value: 'tiktok', label: '🎵 TikTok', color: 'from-black to-gray-800' },
  { value: 'facebook', label: '👥 Facebook', color: 'from-blue-600 to-blue-800' }
];

export const DEFAULT_SHARE_PLATFORMS = ['instagram', 'facebook', 'tiktok'];

/**
 * Custom hook for video management operations
 * Provides video generation, sharing, and management functionality
 */
export const useVideoManagement = () => {
  const dispatch = useDispatch();
  const { videos, stats, isLoading, error, success } = useSelector(state => state.video);
  const { accounts: socialAccounts, isLoading: socialLoading } = useSelector(state => state.social);

  const [shareModal, setShareModal] = useState(null);
  const [sharePlatforms, setSharePlatforms] = useState(DEFAULT_SHARE_PLATFORMS);
  const [shareCaption, setShareCaption] = useState('');

  // Load videos and stats
  const loadVideoData = useCallback(() => {
    dispatch(fetchVideos());
    dispatch(fetchVideoStats());
    dispatch(fetchSocialAccounts());
  }, [dispatch]);

  // Generate video with validation
  const handleGenerateVideo = useCallback(async (formData) => {
    if (!formData.topic?.trim()) {
      toast.error('Please enter a topic');
      return false;
    }

    // Validate duration
    const duration = parseInt(formData.duration) || 30;
    if (duration < VIDEO_DURATION_LIMITS.min || duration > VIDEO_DURATION_LIMITS.max) {
      toast.error(`Duration must be between ${VIDEO_DURATION_LIMITS.min} and ${VIDEO_DURATION_LIMITS.max} seconds`);
      return false;
    }

    dispatch(generateVideo({
      ...formData,
      duration: Math.min(Math.max(duration, VIDEO_DURATION_LIMITS.min), VIDEO_DURATION_LIMITS.max)
    }));
    return true;
  }, [dispatch]);

  // Share video to social platforms
  const handleShareVideo = useCallback(async (videoId) => {
    if (!shareCaption.trim()) {
      toast.error('Please enter a caption');
      return false;
    }
    if (sharePlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return false;
    }

    dispatch(shareVideo({ videoId, platforms: sharePlatforms, caption: shareCaption }));
    closeShareModal();
    return true;
  }, [shareCaption, sharePlatforms, dispatch]);

  // Delete video with confirmation
  const handleDeleteVideo = useCallback(async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return false;
    dispatch(deleteVideo(videoId));
    return true;
  }, [dispatch]);

  // Toggle platform selection
  const togglePlatform = useCallback((platform) => {
    setSharePlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  // Open share modal
  const openShareModal = useCallback((videoId) => {
    setShareModal(videoId);
    setShareCaption('');
    setSharePlatforms(DEFAULT_SHARE_PLATFORMS);
  }, []);

  // Close share modal
  const closeShareModal = useCallback(() => {
    setShareModal(null);
    setShareCaption('');
    setSharePlatforms(DEFAULT_SHARE_PLATFORMS);
  }, []);

  // Initiate social login
  const handleSocialLogin = useCallback((platform) => {
    dispatch(initiateSocialLogin({ platform, redirectUrl: window.location.href }));
  }, [dispatch]);

  // Check if platform is connected
  const isPlatformConnected = useCallback((platform) => {
    return !!socialAccounts?.find(account => account.platform === platform);
  }, [socialAccounts]);

  // Get platform account info
  const getPlatformAccount = useCallback((platform) => {
    return socialAccounts?.find(account => account.platform === platform);
  }, [socialAccounts]);

  return {
    // State
    videos,
    stats,
    isLoading,
    error,
    success,
    socialAccounts,
    socialLoading,
    shareModal,
    sharePlatforms,
    shareCaption,
    setShareCaption,

    // Actions
    loadVideoData,
    handleGenerateVideo,
    handleShareVideo,
    handleDeleteVideo,
    togglePlatform,
    openShareModal,
    closeShareModal,
    handleSocialLogin,
    isPlatformConnected,
    getPlatformAccount,

    // Constants
    VIDEO_DURATION_LIMITS,
    TONE_OPTIONS,
    SOCIAL_PLATFORMS,
    DEFAULT_SHARE_PLATFORMS
  };
};