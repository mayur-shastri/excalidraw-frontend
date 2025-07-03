import React from 'react';
import { Pen, AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorProps {
    errorCode?: string | number;
    errorMessage?: string;
    onRetry?: () => void;
    onGoHome?: () => void;
    onGoBack?: () => void;
}

const Error: React.FC<ErrorProps> = ({
    errorCode = '500',
    errorMessage = 'Something went wrong. Please try again later.',
    onRetry,
    onGoHome,
    onGoBack
}) => {
    const getErrorTitle = (code: string | number) => {
        const codeStr = code.toString();
        switch (codeStr) {
            case '404':
                return 'Page Not Found';
            case '403':
                return 'Access Forbidden';
            case '401':
                return 'Unauthorized';
            case '500':
                return 'Server Error';
            case '503':
                return 'Service Unavailable';
            default:
                return 'Oops! Something went wrong';
        }
    };

    const getErrorDescription = (code: string | number) => {
        const codeStr = code.toString();
        switch (codeStr) {
            case '404':
                return 'The page you\'re looking for doesn\'t exist or has been moved.';
            case '403':
                return 'You don\'t have permission to access this resource.';
            case '401':
                return 'Please sign in to access this page.';
            case '500':
                return 'Our servers are experiencing some issues. We\'re working to fix this.';
            case '503':
                return 'The service is temporarily unavailable. Please try again later.';
            default:
                return 'We encountered an unexpected error. Please try again.';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-lg opacity-20 animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-red-200 to-pink-200 rounded-lg opacity-20 animate-bounce"></div>
                <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
            </div>

            <div className="relative max-w-md w-full">
                {/* Error Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-200/60 text-center">
                    {/* Logo */}
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Pen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            FlowDraw
                        </span>
                    </div>

                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                    </div>

                    {/* Error Code */}
                    <div className="mb-4">
                        <span className="text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            {errorCode}
                        </span>
                    </div>

                    {/* Error Title */}
                    <h1 className="text-2xl font-bold text-slate-800 mb-3">
                        {getErrorTitle(errorCode)}
                    </h1>

                    {/* Error Message */}
                    <p className="text-slate-600 mb-2">
                        {errorMessage || getErrorDescription(errorCode)}
                    </p>

                    <p className="text-sm text-slate-500 mb-8">
                        If this problem persists, please contact our support team.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </button>
                        )}

                        <div className="flex space-x-3">
                            {onGoBack && (
                                <button
                                    onClick={onGoBack}
                                    className="flex-1 border-2 border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Go Back
                                </button>
                            )}

                            {onGoHome && (
                                <button
                                    onClick={onGoHome}
                                    className="flex-1 border-2 border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                            Need help? Contact us at{' '}
                            <a href="mailto:support@flowdraw.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                support@flowdraw.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error;