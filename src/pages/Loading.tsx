import { Pen } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg opacity-20 animate-bounce"></div>
        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="relative text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <Pen className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FlowDraw
          </span>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin mx-auto mb-4">
              <div className="w-full h-full border-4 border-transparent border-t-indigo-500 rounded-full"></div>
            </div>
            
            {/* Inner pulsing dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800">Loading your workspace</h2>
          <p className="text-slate-600">Preparing your creative tools...</p>
        </div>

        {/* Loading Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;