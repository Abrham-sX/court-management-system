import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NewspaperIcon, ArrowRightIcon, CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  image_url?: string;
  created_at: string;
}

const fetchNews = async (): Promise<NewsItem[]> => {
  const { data } = await apiClient.get('/news');
  return data;
};

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${imageUrl}`;
};

export const NewsWidget = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState('All');

  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });

  // Helper to translate category names
  const getCategoryLabel = (category: string): string => {
    const key = category.toLowerCase().replace(/\s+/g, '_');
    return t(key) || category;
  };

  const categories = useMemo(() => {
    const baseCategories = ['All', 'Announcement', 'Legal Update', 'Public Notice', 'Court Holiday'];
    const dynamicCategories = news?.map((item) => item.category).filter(Boolean) as string[] | undefined;
    return Array.from(new Set([...(dynamicCategories || []), ...baseCategories]));
  }, [news]);

  const filteredNews = useMemo(() => {
    const items = news || [];
    return items.filter((item) => filter === 'All' || item.category === filter);
  }, [news, filter]);

  return (
    <div className="app-card overflow-hidden flex flex-col min-h-[420px] transition-all">
      <div className="flex flex-col gap-4 flex-shrink-0 mb-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="app-heading text-lg font-black flex items-center min-w-0">
            <div className="p-2 bg-[var(--app-accent-soft)] rounded-xl mr-3 shrink-0">
              <NewspaperIcon className="h-4 w-4 text-[var(--app-accent)]" />
            </div>
            <span className="truncate">
              {t('latestAnnouncements') || 'Latest Announcements'}
            </span>
          </h2>

          <Link
            to="/news"
            className="text-xs font-black text-[var(--app-accent)] hover:opacity-70 transition-opacity shrink-0"
          >
            {t('viewAll') || 'View All'}
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 5).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === category
                  ? 'bg-[var(--app-accent)] text-white border-[var(--app-accent)] shadow-md'
                  : 'bg-[var(--app-panel-soft)] text-[var(--app-muted)] border-[var(--app-border)] hover:bg-[var(--app-panel-muted)]'
              }`}
            >
              {category === 'All' ? (t('all') || 'All') : getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel-soft)] animate-pulse"
              >
                <div className="h-20 w-20 rounded-2xl bg-[var(--app-panel-muted)] shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-24 bg-[var(--app-panel-muted)] rounded-full"></div>
                  <div className="h-5 w-3/4 bg-[var(--app-panel-muted)] rounded-full"></div>
                  <div className="h-3 w-full bg-[var(--app-panel-muted)] rounded-full"></div>
                  <div className="h-3 w-2/3 bg-[var(--app-panel-muted)] rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredNews.slice(0, 4).map((item) => {
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                dateStyle: 'medium',
              });
              const articleHref = isAuthenticated ? `/news?id=${item.id}` : `/article/${item.id}`;
              const categoryLabel = item.category ? getCategoryLabel(item.category) : (t('announcement') || 'Announcement');
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(articleHref)}
                  className="group relative bg-[var(--app-panel-soft)] border border-[var(--app-border)] p-4 rounded-[24px] hover:border-[var(--app-accent)] hover:shadow-lg hover:scale-[1.005] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-stretch gap-4 overflow-hidden"
                >
                  <div className="h-24 sm:h-auto sm:w-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[var(--app-accent-soft)] to-[var(--app-panel-muted)] flex items-center justify-center border border-[var(--app-border)] relative">
                    {item.image_url ? (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <NewspaperIcon className="h-9 w-9 text-[var(--app-accent)] opacity-30 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/95 backdrop-blur-md text-[var(--app-accent)] text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                        {categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)] mb-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-[var(--app-accent)] shrink-0" />
                        <span>{dateStr}</span>
                      </div>
                      <h3 className="app-heading font-black text-base md:text-lg group-hover:text-[var(--app-accent)] transition-colors leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="app-muted text-xs leading-relaxed line-clamp-2 mt-2">
                        {item.summary || item.content || ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--app-accent)] group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
                        {t('readFullArticle') || 'Read full article'}
                        <ArrowRightIcon className="h-4 w-4 ml-2" />
                      </span>

                      <span className="text-[10px] font-bold text-[var(--app-muted)] opacity-70">
                        {isAuthenticated ? '/news' : '/article'}
                      </span>
                    </div>
                  </div>

                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[var(--app-border)] rounded-3xl">
            <MagnifyingGlassIcon className="h-8 w-8 text-[var(--app-muted)] opacity-20 mb-2" />
            <p className="text-xs font-medium text-[var(--app-muted)]">
              {t('noAnnouncements') || 'No announcements available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};