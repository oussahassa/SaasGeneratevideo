import React, { useState, useEffect } from 'react';
import { Edit, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import Markdown from 'react-markdown';
import { fetchMyArticles, setPage, setFilter } from '../../redux/slices/articleSlice';

const WriteArticle = () => {

  const articleLength = [
    {length: 800, text: 'Short (500-800 words)'},
    {length: 1200, text: 'Medium (800-1200 words)'},
    {length: 1600, text: 'Long (1200+ words)'},
  ];
  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { articles, page, lim, filter, total, loading: articleLoading, error } = useSelector(state => state.article);

  useEffect(() => {
    if (activeTab === 'myArticles') {
      dispatch(fetchMyArticles({ page, lim, filter }));
    }
  }, [activeTab, page, lim, filter, dispatch]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Write an article about ${input} in ${selectedLength.text}`;
      const { data } = await axios.post(
        import.meta.env.VITE_API_URL + '/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'myArticles') {
      dispatch(fetchMyArticles({ page, lim, filter }));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchMyArticles({ page: newPage, lim, filter }));
  };

  const handleFilterChange = (e) => {
    dispatch(setFilter(e.target.value));
    dispatch(fetchMyArticles({ page, lim, filter: e.target.value }));
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex flex-col gap-4 text-slate-700'>
      <div className='flex gap-4 mb-4'>
        <button
          className={`px-4 py-2 rounded-lg border ${activeTab === 'generate' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => handleTabChange('generate')}
        >
          Generate Article
        </button>
        <button
          className={`px-4 py-2 rounded-lg border ${activeTab === 'myArticles' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => handleTabChange('myArticles')}
        >
          My Articles
        </button>
      </div>
      {activeTab === 'generate' ? (
        <div className='flex flex-wrap gap-4'>
          <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
            <div className='flex items-center gap-3'>
              <Sparkles className='w-6 text-[#4A7AFF]' />
              <h1 className='text-xl font-semibold'>Article Configuration</h1>
            </div>
            <p className='mt-6 text-sm font-medium'>Article Topic</p>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type='text'
              className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
              placeholder='The future of artificial intelligence is...'
              required
            />
            <p className='mt-4 text-sm font-medium'>Article Length</p>
            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
              {articleLength.map((item, index) => (
                <span
                  onClick={() => setSelectedLength(item)}
                  className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedLength.text === item.text ? 'bg-blue-50 text-blue-700' : 'text-gray-500 border-gray-300'}`}
                  key={index}
                >
                  {item.text}
                </span>
              ))}
            </div>
            <br />
            <button
              disabled={loading}
              className='w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'
            >
              {loading ? (
                <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              ) : (
                <Edit className='w-5' />
              )}
              Generate Article
            </button>
          </form>
          <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-150'>
            <div className='flex items-center gap-3'>
              <Edit className='w-5 h-5 text-[#4A7AFF]' />
              <h1 className='text-xl font-semibold'>Generated Article</h1>
            </div>
            {!content ? (
              <div className='flex-1 flex justify-center items-center'>
                <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                  <Edit className='w-9 h-9' />
                  <p>Enter a topic and click "Generate Article" to get started</p>
                </div>
              </div>
            ) : (
              <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
                <div className='reset-tw'>
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='w-full max-w-2xl p-4 bg-white rounded-lg border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <Edit className='w-5 h-5 text-[#4A7AFF]' />
            <h1 className='text-xl font-semibold'>My Articles</h1>
          </div>
          <div className='mb-4 flex gap-2'>
            <input
              type='text'
              value={filter}
              onChange={handleFilterChange}
              placeholder='Filter by topic...'
              className='p-2 border rounded-md text-sm w-1/2'
            />
          </div>
          {articleLoading ? (
            <div className='flex justify-center items-center h-32'>Loading...</div>
          ) : error ? (
            <div className='text-red-500'>{error}</div>
          ) : (
            <div>
              {articles.length === 0 ? (
                <div className='text-gray-400'>No articles found.</div>
              ) : (
                <>
                <ul className='space-y-4'>
                  {articles.map((article, idx) => (
                    <li key={idx} className='border rounded p-3 bg-gray-50'>
                      <div className='font-semibold mb-2'>{article.prompt}</div>
                      <div className='text-xs text-gray-500 mb-2'>Created: {article.created_at ? new Date(article.created_at).toLocaleString() : 'N/A'}</div>
                      <div className='reset-tw text-sm'>
                        <Markdown>{article.content}</Markdown>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className='flex justify-between items-center mt-4'>
                  <button
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                    className='px-3 py-1 rounded border bg-blue-100 text-blue-700 disabled:opacity-50'
                  >
                    Previous
                  </button>
                  <span className='text-sm'>Page {page} / {Math.ceil(total / lim)}</span>
                  <button
                    disabled={page >= Math.ceil(total / lim)}
                    onClick={() => handlePageChange(page + 1)}
                    className='px-3 py-1 rounded border bg-blue-100 text-blue-700 disabled:opacity-50'
                  >
                    Next
                  </button>
                </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WriteArticle
