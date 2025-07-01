import {
    Users,
    Github,
    Star,
    ArrowRight,
    Shapes,
    MousePointer,
    GitMerge,
    Download,
    Share2,
    BrainCircuit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OutlineButton from '../components/Buttons/OutlineButton';
import GradientButton from '../components/Buttons/GradientButton';
import Logo from '../components/Logo/Logo';
import FeatureCard from '../components/Home/FeatureCard';
import FooterLinkList from '../components/Home/FooterLinkList';

const Home = () => {
    const navigate = useNavigate();

    const navigateToAuthPage = () => {
        navigate('/auth');
    };

    const navigateToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Header */}
            <header className="relative z-50 bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Logo gradientText />

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={navigateToAuthPage}
                                className="text-slate-600 hover:text-indigo-600 transition-colors font-medium"
                            >
                                Sign in
                            </button>
                            <GradientButton onClick={navigateToDashboard}>
                                Start Drawing
                            </GradientButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg opacity-20 animate-bounce"></div>
                    <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg opacity-20 animate-bounce"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 leading-tight">
                            Step up your workflow game with{' '}
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                FlowDraw
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
                            Create, edit, and store flowcharts. Collaborate in real time. Access powerful productivity tools.
                        </p>

                        <p className="text-lg text-slate-500 mb-12">
                            Help shape the future of visual thinking.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <OutlineButton icon={ArrowRight}>
                                Try it now
                            </OutlineButton>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <FeatureCard
                                icon={Shapes}
                                iconBg="bg-gradient-to-br from-indigo-500 to-purple-600"
                                title="Intuitive Drawing"
                                description="Create beautiful flowcharts and diagrams with our intuitive drawing tools."
                            />
                            <FeatureCard
                                icon={Users}
                                iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
                                title="Real-time Collaboration"
                                description="Work together with your team in real-time, no matter where you are."
                            />
                            <FeatureCard
                                icon={BrainCircuit}
                                iconBg="bg-gradient-to-br from-pink-500 to-red-600"
                                title="AI Assisted Flowcharting"
                                description="Describe your process in plain language and instantly convert your words into flowcharts with AI."
                                rotateIcon
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Everything you need to create amazing diagrams
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Powerful tools that make diagramming intuitive and collaborative
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <MousePointer className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Precise Controls</h3>
                            <p className="text-slate-600">Fine-tune every element with precise positioning and styling controls.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <GitMerge className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Smart Connectors</h3>
                            <p className="text-slate-600">Automatically align and route connectors between shapes to keep your diagrams clean and readable.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <Download className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Export Options</h3>
                            <p className="text-slate-600">Export your diagrams in multiple formats including PNG, SVG, and PDF.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <Share2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Easy Sharing</h3>
                            <p className="text-slate-600">Share your work instantly with team members and stakeholders.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <Logo className="mb-4" />
                            <p className="text-slate-400 mb-4">
                                The open-source drawing tool for creating beautiful diagrams and flowcharts.
                            </p>
                            <div className="flex space-x-4">
                                <Github className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                                <Star className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                            </div>
                        </div>
                        <FooterLinkList
                            title="Product"
                            links={[
                                { label: "Features", href: "#" },
                                { label: "Pricing", href: "#" },
                                { label: "Roadmap", href: "#" },
                                { label: "Updates", href: "#" }
                            ]}
                        />
                        <FooterLinkList
                            title="Resources"
                            links={[
                                { label: "Documentation", href: "#" },
                                { label: "Tutorials", href: "#" },
                                { label: "Blog", href: "#" },
                                { label: "Community", href: "#" }
                            ]}
                        />
                        <FooterLinkList
                            title="Company"
                            links={[
                                { label: "About", href: "#" },
                                { label: "Privacy", href: "#" },
                                { label: "Terms", href: "#" },
                                { label: "Contact", href: "#" }
                            ]}
                        />
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
                        <p>&copy; 2025 FlowDraw. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;