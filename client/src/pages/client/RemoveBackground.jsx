import React, { useState } from "react";
import { Eraser, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { removeBackground, resetState } from "../../redux/slices/aiSlice";

const RemoveBackground = () => {
  const [input, setInput] = useState("");

  const dispatch = useDispatch();
  const { data, isLoading, error, success } = useSelector(state => state.ai);
  const { token } = useSelector(state => state.auth);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", input);
    dispatch(removeBackground(formData));
  };

  // Reset
  const handleReset = () => {
    setInput("");
    dispatch(resetState());
  };

  // Download image
  const handleDownload = async () => {
    if (!data?.content) return;
    try {
      const response = await fetch(data.content);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "background-removed.png";
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // Show toast on success or error
  React.useEffect(() => {
    if (success && data) {
      toast.success("Background removed successfully!");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, data]);


  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>

        <input
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
          required
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG and other image formats
        </p>

        <button

          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {isLoading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>
      {/* right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!data?.content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-600 dark:text-gray-300">
              <Eraser className="w-9 h-9" />
              <p>
                Upload an image and click "Remove Background" to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full">
            <img src={data.content} alt="image" className="w-full h-full" />

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-linear-to-r from-[#F6AB41] to-[#FF4938] text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-gray-900 dark:text-white py-2 rounded-lg text-sm cursor-pointer mt-5"
              >
                Download
              </button>

              <button
                onClick={handleReset}
                className="flex-1 border border-gray-400 py-2 rounded-lg text-sm bg-gray-100 cursor-pointer mt-5"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;
