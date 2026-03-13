import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { setUser } from '../redux/slices/authSlice';
import { Camera } from 'lucide-react'

const UpdateProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || ''
  });
  const [sessions, setSessions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null)
  const [profileImage, setProfileImage] = useState(null)

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

 const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get('/user/sessions');
        if (res.data?.success) setSessions(res.data.sessions.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load sessions');
      }
    };
    fetchSessions();
  }, []);

const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    // Validate password if provided
    if (profileForm.password || profileForm.passwordConfirm) {
      if (profileForm.password !== profileForm.passwordConfirm) {
        toast.error(t('dashboard.passwordMismatch') || 'Passwords do not match')
        return
      }
      if (profileForm.password.length < 6) {
        toast.error(t('dashboard.passwordMinLength') || 'Password must be at least 6 characters')
        return
      }
    }

    try {
      const formData = new FormData()
      formData.append('firstName', profileForm.firstName)
      formData.append('lastName', profileForm.lastName)
      if (profileForm.password) {
        formData.append('password', profileForm.password)
      }
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }

      const res = await api.put('/user/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (res.data?.success) {
        // update stored user
        const updatedUser = res.data.user
        dispatch(setUser(updatedUser))
        toast.success(t('dashboard.profileUpdated') || 'Profile updated')
        setProfileImage(null)
      } else {
        toast.error(res.data?.message || 'Update failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed')
    }
  }


  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg ">
      <h2 className="text-2xl font-bold mb-6">{t('dashboard.updateProfile') || 'Update Profile'}</h2>
           
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md my-8'>
            <h3 className='text-lg font-semibold mb-4'>{t('dashboard.updateProfile') || 'Update Profile'}</h3>
            <form onSubmit={handleUpdateProfile} className='space-y-4'>
              
              {/* Profile Picture */}
              <div>
                <label className='block text-sm font-medium mb-2'>{t('dashboard.profilePicture') || 'Profile Picture'}</label>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden'>
                    {previewImage ? (
                      <img src={previewImage} alt='Preview' className='w-full h-full object-cover' />
                    ) : (
                      <Camera className='text-gray-400' size={32} />
                    )}
                  </div>
                  <label className='px-4 py-2 bg-blue-600 text-white rounded cursor-pointer text-sm hover:bg-blue-700'>
                    {t('dashboard.chooseImage') || 'Choose Image'}
                    <input type='file' accept='image/*' onChange={handleImageChange} className='hidden' />
                  </label>
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium'>First name</label>
                <input name='firstName' value={profileForm.firstName} onChange={handleProfileChange} className='w-full px-3 py-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm font-medium'>Last name</label>
                <input name='lastName' value={profileForm.lastName} onChange={handleProfileChange} className='w-full px-3 py-2 border rounded' />
              </div>
              <div>
                <label className='block text-sm font-medium'>Email</label>
                <input name='email' readOnly value={profileForm.email} className='w-full px-3 py-2 border rounded bg-gray-100' />
              </div>

              {/* Password Section */}
              <div className='border-t pt-4'>
                <p className='text-sm font-medium mb-3'>{t('dashboard.changePassword') || 'Change Password (optional)'}</p>
                <div>
                  <label className='block text-sm font-medium'>New Password</label>
                  <input 
                    type='password' 
                    name='password' 
                    value={profileForm.password} 
                    onChange={handleProfileChange} 
                    placeholder={t('dashboard.enterPassword') || 'Leave empty to keep current'} 
                    className='w-full px-3 py-2 border rounded' 
                  />
                </div>
                <div className='mt-2'>
                  <label className='block text-sm font-medium'>Confirm Password</label>
                  <input 
                    type='password' 
                    name='passwordConfirm' 
                    value={profileForm.passwordConfirm} 
                    onChange={handleProfileChange} 
                    placeholder={t('dashboard.confirmPassword') || 'Confirm new password'} 
                    className='w-full px-3 py-2 border rounded' 
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>

                <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>{t('dashboard.save') || 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">{t('dashboard.lastSessions') || 'Last 5 Sessions'}</h3>
        <ul className="space-y-2">
          {sessions.map(s => (
            <li key={s.id} className="flex justify-between items-center p-3 bg-gray-100 rounded">
              <div>
                <span className="font-medium">{s.device || s.userAgent || 'Unknown device'}</span>
                <span className="ml-2 text-xs text-gray-500">{s.ip || 'Unknown IP'} • {new Date(s.lastActive).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
