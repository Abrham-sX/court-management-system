import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import {
  NewspaperIcon,
  CalendarIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../i18n';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  content: string;
  image_url?: string;
  category: string;
  created_at: string;
}

const fetchNews = async (): Promise<NewsItem[]> => {
  const { data } = await apiClient.get('/news');
  return data;
};

export const News = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('All');
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('id');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const { data: news, isLoading } = useQuery({ queryKey: ['news'], queryFn: fetchNews });

  const rawCategories = ['All', 'Announcement', 'Legal Update', 'Public Notice', 'Court Holiday'];

  // Translate category for display
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'Announcement':
        return t('announcement') || 'Announcement';
      case 'Legal Update':
        return t('legalUpdate') || 'Legal Update';
      case 'Public Notice':
        return t('publicNotice') || 'Public Notice';
      case 'Court Holiday':
        return t('courtHoliday') || 'Court Holiday';
      default:
        return category;
    }
  };

  // Translate the filter button labels (including "All")
  const getFilterButtonLabel = (category: string): string => {
    if (category === 'All') return t('all') || 'All';
    return getCategoryLabel(category);
  };

  const filteredNews = news?.filter((item) => filter === 'All' || item.category === filter) || [];

  useEffect(() => {
    if (highlightedId && news) {
      const matchedArticle = news.find((n) => String(n.id) === highlightedId);
      if (matchedArticle) {
        setFilter('All'); // reset to All to guarantee visibility
        setSelectedArticle(matchedArticle); // automatically open in reader modal
      }

      const timer = setTimeout(() => {
        const element = document.getElementById(`news-card-${highlightedId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [highlightedId, news]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--app-border)] pb-8">
        <div>
          <h1 className="app-heading text-4xl font-black flex items-center mb-2">
            <NewspaperIcon className="h-10 w-10 mr-4 text-[var(--app-accent)]" />
            {t('courtNews') || 'Court News'}
          </h1>
          <p className="app-muted text-lg">
            {t('stayInformed') || 'Stay informed with the latest announcements'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {rawCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === cat
                  ? 'bg-[var(--app-accent)] text-white shadow-lg'
                  : 'bg-[var(--app-panel-soft)] text-[var(--app-muted)] hover:bg-[var(--app-panel-muted)]'
              }`}
            >
              {getFilterButtonLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="app-card animate-pulse h-32 bg-[var(--app-panel-muted)] rounded-[24px]"
            ></div>
          ))}
        </div>
      ) : filteredNews.length > 0 ? (
        <div className="flex flex-col gap-6">
          {filteredNews.map((item) => {
            const isHighlighted = String(item.id) === highlightedId;
            return (
              <div
                id={`news-card-${item.id}`}
                key={item.id}
                onClick={() => setSelectedArticle(item)}
                className={`app-card group flex flex-col md:flex-row overflow-hidden hover:scale-[1.005] hover:shadow-xl transition-all duration-500 gap-6 p-5 cursor-pointer relative ${
                  isHighlighted
                    ? 'ring-4 ring-[var(--app-accent)] shadow-[0_0_30px_rgba(var(--app-accent-rgb),0.15)] scale-[1.01] border-[var(--app-accent)]'
                    : ''
                }`}
              >
                {/* Image Section */}
                <div className="h-48 md:h-auto w-full md:w-64 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[var(--app-accent-soft)] to-[var(--app-panel-muted)] flex items-center justify-center border border-[var(--app-border)] relative">
                  {item.image_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${item.image_url}`}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <NewspaperIcon className="h-16 w-16 text-[var(--app-accent)] opacity-20 group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-md text-[var(--app-accent)] text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center text-[var(--app-muted)] text-[10px] font-bold uppercase tracking-widest mb-2">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-[var(--app-accent)]" />
                      {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </div>
                    <h2 className="app-heading font-black text-xl md:text-2xl mb-3 group-hover:text-[var(--app-accent)] transition-colors leading-tight">
                      {item.title}
                    </h2>
                    <p className="app-muted text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                      {item.summary || item.content}
                    </p>
                  </div>

                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-[var(--app-accent)] self-start group-hover:translate-x-1 transition-transform duration-300">
                    <span className="mr-2">{t('readFullArticle') || 'Read full article'}</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </div>
                </div>

                {/* Left accent glowing hover strip */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="app-card py-20 text-center">
          <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-[var(--app-muted)] opacity-20 mb-4" />
          <p className="app-muted text-xl font-display">
            {t('noNewsInThisCategory') || 'No news found in this category.'}
          </p>
        </div>
      )}

      {/* Immersive Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[var(--app-panel)] border border-[var(--app-border)] rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-in flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image/gradient banner */}
            <div className="relative h-64 flex-shrink-0 bg-gradient-to-br from-[var(--app-accent-soft)] to-[var(--app-panel-muted)] flex items-center justify-center border-b border-[var(--app-border)]">
              {selectedArticle.image_url ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedArticle.image_url}`}
                  alt={selectedArticle.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <NewspaperIcon className="h-20 w-20 text-[var(--app-accent)] opacity-20" />
              )}

              {/* Category overlay */}
              <div className="absolute top-6 left-6">
                <span className="bg-white/95 backdrop-blur-md text-[var(--app-accent)] text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
                  {getCategoryLabel(selectedArticle.category)}
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                aria-label={t('close') || 'Close'}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-8 flex-1 overflow-auto space-y-6">
              <div className="flex items-center text-[var(--app-muted)] text-xs font-bold uppercase tracking-widest">
                <CalendarIcon className="h-4 w-4 mr-1.5 text-[var(--app-accent)]" />
                {new Date(selectedArticle.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>

              <h2 className="app-heading font-black text-3xl leading-tight">{selectedArticle.title}</h2>

              <div className="border-t border-[var(--app-border)] pt-6">
                <p className="app-text text-base leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content || selectedArticle.summary}
                </p>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-6 bg-[var(--app-panel-muted)] border-t border-[var(--app-border)] flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all"
              >
                {t('closeReader') || 'Close Reader'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};