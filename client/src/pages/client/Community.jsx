import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchImageHistory,fetchCreations, setPage } from '../../redux/slices/imageHistorySlice'
import { Heart } from 'lucide-react'
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
 // const creations = useSelector(state => state.ai.data?.creations || []);
  const aiLoading = useSelector(state => state.ai.isLoading);
  const { creations,images, total, page, limit, isLoading: historyLoading, error: historyError } = useSelector(state => state.imageHistory ? state.imageHistory : { creations: [], images: [], total: 0, page: 1, limit: 10, isLoading: false, error: null });

  // Like toggle logic (unchanged)
  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post('/api/user/toggle-like-creation', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message);
        // Optionally refresh creations
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch image history
  useEffect(() => {
    if (user) {
      dispatch(fetchImageHistory({ page, limit }));
      dispatch(fetchCreations());
    }
  }, [user, page, dispatch, limit]);

  // Pagination handler
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      {/* Community Creations */}
      <h2 className='text-lg font-bold mb-2'>Creations</h2>
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {creations.map((creation, index) => (
          <div key={index} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
            <img src={creation.content} alt='' className='w-full h-full object-cover rounded-lg' />
            <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-linear-to-b from-transparent to-black/80 text-white rounded-lg'>
              <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
              <div className='flex gap-1 items-center'>
                <p>{creation.likes.length}</p>
                <Heart onClick={() => imageLikeToggle(creation.id)} className={`min-w-5 h-5 hover:scale-110 cursor-pointer ${creation.likes.includes(user.id) ? 'fill-red-500 text-red-600' : 'text-white'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Historique Section */}
      <h2 className='text-lg font-bold mt-8 mb-2'>My Historique (Last 10 Images)</h2>
      <div className='bg-white rounded-xl p-4 min-h-48'>
        {historyLoading ? (
          <div className='flex justify-center items-center h-full'>
            <span className='w-8 h-8 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin'></span>
          </div>
        ) : historyError ? (
          <div className='text-red-500'>{historyError}</div>
        ) : images.length === 0 ? (
          <div className='text-gray-400'>No image history found.</div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            {images.map((img, idx) => (
              <div key={img.id || idx} className='flex flex-col items-center'>
                <img src={img.content} alt='historique' className='w-full h-32 object-cover rounded-lg mb-2' />
                <span className='text-xs text-gray-500'>{img.prompt}</span>
              </div>
            ))}
          </div>
        )}
        {/* Pagination */}
        {total > limit && (
          <div className='flex justify-center mt-4'>
            <button
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className='px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50'>Prev</button>
            <span className='px-3 py-1 mx-1'>{page}</span>
            <button
              disabled={page * limit >= total}
              onClick={() => handlePageChange(page + 1)}
              className='px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50'>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community

