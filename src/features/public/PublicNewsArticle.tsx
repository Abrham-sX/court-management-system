import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';

export const PublicNewsArticle = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data } = await apiClient.get('/news');
      return data.find((n: any) => String(n.id) === id);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--app-bg)] flex flex-col justify-center items-center p-6 text-center">
        <NewspaperIcon className="h-24 w-24 text-[var(--app-muted)] opacity-50 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-[var(--app-text)]">
          {t('articleNotFound')}
        </h1>
        <Link to="/" className="app-btn-primary">
          {t('returnHome')}
        </Link>
      </div>
    );
  }

  const dateStr = new Date(article.created_at).toLocaleDateString(undefined, { dateStyle: 'long' });

  return (
    <div className="min-h-screen bg-[var(--app-bg)] py-12 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--app-accent)] opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center text-[var(--app-accent)] hover:opacity-70 transition-opacity font-bold text-sm mb-8">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          {t('backToHome')}
        </Link>

        <div className="app-card overflow-hidden !p-0 rounded-[32px] border-2 border-[var(--app-border)] shadow-2xl">
          {article.image_url && (
            <div className="w-full h-[400px] relative">
              <img
                src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${article.image_url}`}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
          )}

          <div className="p-10 md:p-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-[var(--app-accent-soft)] text-[var(--app-accent)] text-xs font-black uppercase tracking-widest rounded-xl">
                {article.category || t('announcement')}
              </span>
              <span className="text-sm font-bold text-[var(--app-muted)]">{dateStr}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-[var(--app-text)] mb-8 leading-tight font-display">
              {article.title}
            </h1>

            <div className="prose prose-lg max-w-none text-[var(--app-text)] opacity-90 leading-relaxed">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
              ) : (
                <p>{article.summary}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};