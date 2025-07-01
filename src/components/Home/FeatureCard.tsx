// FeatureCard component
const FeatureCard = ({
    icon: Icon,
    iconBg,
    title,
    description,
    iconClassName = "",
    rotateIcon = false
}: {
    icon: React.ElementType;
    iconBg: string;
    title: string;
    description: string;
    iconClassName?: string;
    rotateIcon?: boolean;
}) => (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-slate-200/50">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
            <Icon className={`w-6 h-6 text-white ${rotateIcon ? "rotate-90" : ""} ${iconClassName}`} />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

export default FeatureCard;