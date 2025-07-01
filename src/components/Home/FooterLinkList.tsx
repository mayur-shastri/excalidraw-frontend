// FooterLinkList component
const FooterLinkList = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
    <div>
        <h4 className="font-semibold mb-4">{title}</h4>
        <ul className="space-y-2 text-slate-400">
            {links.map(link => (
                <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                </li>
            ))}
        </ul>
    </div>
);

export default FooterLinkList;