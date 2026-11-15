import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowUp,
    Building2,
    LayoutGrid,
    LifeBuoy,
    ListChecks,
    LucideIcon,
    MessageSquarePlus,
    Rocket,
    Search,
    UserRound,
    X,
} from 'lucide-react';
import { faqSections, FAQItem, FAQSectionIcon } from "../data/faqData";
import { FAQCard } from "../utils/componentImports";
import Seo from "../components/seo/Seo";
import { SITE_URL } from "../lib/site";

const faqJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
    ],
};

const sectionIcons: Record<FAQSectionIcon, LucideIcon> = {
    start: Rocket,
    maker: LayoutGrid,
    account: UserRound,
    check: ListChecks,
    help: LifeBuoy,
    office: Building2,
};

const questionId = (sectionId: string, index: number) => `${sectionId}-${index + 1}`;

const matches = (item: FAQItem, query: string) =>
    [item.question, item.answer, item.footnote ?? '', ...(item.bullets ?? [])]
        .some((text) => text.toLowerCase().includes(query));

const FAQ: FC = () => {
    const [showButton, setShowButton] = useState(false);
    const [query, setQuery] = useState('');
    const [openIds, setOpenIds] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState(faqSections[0].id);

    const trimmed = query.trim().toLowerCase();
    const searching = trimmed.length > 0;

    // Sections with their questions narrowed to the search, keeping original ids
    const visibleSections = useMemo(() =>
        faqSections
            .map((section) => ({
                ...section,
                entries: section.items
                    .map((item, index) => ({ item, id: questionId(section.id, index) }))
                    .filter(({ item }) => !searching || matches(item, trimmed)),
            }))
            .filter((section) => section.entries.length > 0),
        [searching, trimmed]
    );

    const resultCount = visibleSections.reduce((n, s) => n + s.entries.length, 0);
    const allIds = useMemo(
        () => faqSections.flatMap((s) => s.items.map((_, i) => questionId(s.id, i))),
        []
    );
    const allOpen = openIds.size === allIds.length;

    useEffect(() => {
        const handleScroll = () => setShowButton(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Open and scroll to a question linked by hash, e.g. /faq#saving-1
    useEffect(() => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (!hash) return;
        if (allIds.includes(hash)) setOpenIds(new Set([hash]));
        requestAnimationFrame(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
        });
    }, [allIds]);

    // Highlight the section currently in view in the sidebar
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveSection(visible[0].target.id);
            },
            { rootMargin: '-120px 0px -60% 0px' }
        );
        visibleSections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [visibleSections]);

    const toggle = useCallback((id: string) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="dark:text-gray-50">
            <Seo
                title="FAQ"
                path="/faq"
                description="FAQs about course selection (I asked the registrar) and how to use ECE Pathmaker"
                jsonLd={faqJsonLd}
            />

            {/* Header */}
            <header className="
                relative overflow-hidden rounded-xl px-8 py-10
                bg-gradient-to-br from-green1/60 via-neutral1 to-neutral1
                dark:from-green4/70 dark:via-slate-700 dark:to-slate-700
                border border-neutral2 dark:border-gray-600
            ">
                <p className="text-sm font-semibold uppercase tracking-wider text-green3 dark:text-green1">
                    Help centre
                </p>
                <h1 className="mt-2 text-3xl font-bold">Frequently asked questions</h1>
                <p className="mt-2 max-w-xl text-gray-600 dark:text-gray-300">
                    How to use Pathmaker, plus answers from the ECE undergrad office on course selection.
                </p>
                <div className="mt-6 flex max-w-xl items-center gap-3">
                    <label className="relative flex-1 cursor-text">
                        <span className="sr-only">Search the FAQ</span>
                        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search questions, e.g. XX slots, PEY, minors"
                            className="
                                w-full rounded-lg border border-neutral3 bg-white py-2.5 pl-9 pr-9
                                dark:border-gray-500 dark:bg-gray-800 dark:text-gray-50
                                focus:outline-none focus:ring-2 focus:ring-green2
                                [&::-webkit-search-cancel-button]:hidden
                            "
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </label>
                </div>
                {searching && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300" aria-live="polite">
                        {resultCount} {resultCount === 1 ? 'result' : 'results'}
                    </p>
                )}
            </header>

            <div className="mt-10 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
                {/* Sidebar */}
                <aside>
                    <nav aria-label="FAQ sections" className="lg:sticky lg:top-32">
                        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 lg:block">
                            On this page
                        </p>
                        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                            {faqSections.map((section) => {
                                const Icon = sectionIcons[section.icon];
                                const visible = visibleSections.find((s) => s.id === section.id);
                                const count = visible?.entries.length ?? 0;
                                const active = activeSection === section.id && count > 0;
                                return (
                                    <li key={section.id}>
                                        <button
                                            type="button"
                                            onClick={() => scrollToSection(section.id)}
                                            disabled={count === 0}
                                            aria-current={active ? 'true' : undefined}
                                            className={`
                                                flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors
                                                border lg:border-0 lg:border-l-2 lg:rounded-l-none
                                                disabled:cursor-default disabled:opacity-40
                                                ${active
                                                    ? 'border-green2 bg-green1/40 text-green4 dark:bg-green4/50 dark:text-green1 font-medium'
                                                    : 'border-neutral2 dark:border-gray-600 hover:bg-neutral1 dark:hover:bg-gray-600'}
                                            `}
                                        >
                                            <Icon aria-hidden className="size-4 shrink-0" />
                                            <span className="flex-1">{section.title}</span>
                                            <span className="rounded-full bg-neutral2 px-1.5 text-xs text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                                                {count}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        {!searching && (
                            <button
                                type="button"
                                onClick={() => setOpenIds(allOpen ? new Set() : new Set(allIds))}
                                className="mt-4 hidden px-3 text-sm text-green3 hover:underline dark:text-green1 lg:block"
                            >
                                {allOpen ? 'Collapse all' : 'Expand all'}
                            </button>
                        )}
                    </nav>
                </aside>

                {/* Content */}
                <div className="space-y-14">
                    {visibleSections.map((section) => {
                        const Icon = sectionIcons[section.icon];
                        const isOffice = section.icon === 'office';
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-32">
                                {isOffice && <hr className="mb-14 border-neutral2 dark:border-gray-600" />}
                                <div className="mb-5 flex items-start gap-4">
                                    <div className={`
                                        flex size-10 shrink-0 items-center justify-center rounded-lg
                                        ${isOffice
                                            ? 'bg-comp1/30 text-comp4 dark:bg-comp4/40 dark:text-comp1'
                                            : 'bg-green1/50 text-green4 dark:bg-green4/60 dark:text-green1'}
                                    `}>
                                        <Icon aria-hidden className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">{section.title}</h2>
                                        <p className="text-gray-600 dark:text-gray-300">{section.blurb}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {section.entries.map(({ item, id }) => (
                                        <FAQCard
                                            key={id}
                                            id={id}
                                            item={item}
                                            open={searching || openIds.has(id)}
                                            onToggle={() => toggle(id)}
                                            highlight={searching ? query : undefined}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {visibleSections.length === 0 && (
                        <div className="rounded-xl border border-dashed border-neutral3 px-6 py-12 text-center dark:border-gray-500">
                            <p className="font-medium">No questions match “{query.trim()}”.</p>
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="mt-2 text-sm text-green3 hover:underline dark:text-green1"
                            >
                                Clear search
                            </button>
                        </div>
                    )}

                    {/* Still stuck */}
                    <div className="flex flex-col items-start gap-4 rounded-xl bg-green3 px-6 py-6 text-neutral1 dark:bg-green4 sm:flex-row sm:items-center">
                        <MessageSquarePlus aria-hidden className="size-8 shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Didn't find your answer?</p>
                            <p className="text-sm text-neutral2">Ask a question, report a bug, or suggest a feature.</p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href="https://forms.gle/yBPDvHKAPVmhyz1M8"
                                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-green4 hover:bg-neutral1"
                            >
                                Feedback form
                            </a>
                            <a
                                href="https://github.com/sunnwydays/ecepathmaker/issues"
                                className="rounded-lg border border-neutral1/60 px-4 py-2 text-sm font-medium hover:bg-white/10"
                            >
                                GitHub issues
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {showButton && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="
                        fixed bottom-8 right-8 bg-green2 text-white
                        shadow-lg rounded-full size-12
                        flex items-center justify-center
                        hover:bg-green3 transition-all
                        dark:bg-green3 dark:hover:bg-green4
                    "
                    aria-label="Back to top"
                >
                    <ArrowUp className="size-5" />
                </button>
            )}
        </div>
    );
};

export default FAQ;
