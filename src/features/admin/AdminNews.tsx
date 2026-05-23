import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  NewspaperIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  summary?: string;
  content: string;
  category: string;
  created_at: string;
}

interface NewsDraft {
  title: string;
  summary: string;
  content: string;
  category: string;
}

type CategoryOption = {
  value: string;
  label: string;
};

const fetchNews = async (): Promise<NewsItem[]> => {
  const { data } = await apiClient.get('/news');
  return data;
};

export const AdminNews = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
  });
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Public');
  const tone = 'Professional';
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('Announcement');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );
  const [activeView, setActiveView] = useState<'editor' | 'history'>('editor');

  const categories: CategoryOption[] = [
    { value: 'Announcement', label: t('announcement') || 'Announcement' },
    { value: 'Legal Update', label: t('legalUpdate') || 'Legal Update' },
    { value: 'Public Notice', label: t('publicNotice') || 'Public Notice' },
    { value: 'Court Holiday', label: t('courtHoliday') || 'Court Holiday' },
  ];

  const getCategoryLabel = (value: string) => {
    const match = categories.find((item) => item.value === value);
    return match?.label ?? value;
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<NewsDraft>('/news/generate', {
        topic,
        audience,
        tone,
        category,
      });
      return data;
    },
    onSuccess: (draft) => {
      setTitle(draft.title);
      setSummary(draft.summary);
      setContent(draft.content);
      setCategory(draft.category || category);
      setMessage({ text: t('draftGenerated') || 'Draft generated', type: 'success' });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setMessage({
        text: err.response?.data?.message || t('error') || 'An error occurred',
        type: 'error',
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('category', category);
      formData.append('content', content);
      if (image) formData.append('image', image);

      const { data } = await apiClient.post('/news', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      setTitle('');
      setSummary('');
      setCategory('Announcement');
      setContent('');
      setImage(null);
      setMessage({
        text: t('announcementPublished') || 'Announcement published successfully',
        type: 'success',
      });
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      setMessage({
        text: err.response?.data?.message || t('error') || 'An error occurred',
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/news/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
  });

  const handlePublish = (event: React.FormEvent) => {
    event.preventDefault();
    publishMutation.mutate();
  };

  const handleDeleteConfirm = (id: number) => {
    const confirmMsg =
      t('confirmDeleteNews') || t('confirmDeleteAnnouncement') || 'Delete this announcement?';
    if (window.confirm(confirmMsg)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* News Creation Hero */}
      <div className="app-card border-none bg-[image:var(--app-sidebar-bg)] p-12 text-white overflow-hidden relative shadow-2xl rounded-[40px]">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h1 className="font-display text-4xl font-black mb-2 flex items-center">
                <NewspaperIcon className="h-10 w-10 mr-4 text-[var(--app-accent)]" />
                {t('newsGenerator') || 'News Generator'}
              </h1>
              <p className="text-white/50 text-lg max-w-xl font-medium">
                {t('generateDraftDesc') ||
                  'Generate draft announcements using AI or write your own.'}
              </p>
            </div>
            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setActiveView('editor')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeView === 'editor'
                    ? 'bg-white text-black shadow-xl'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t('editor') || 'Editor'}
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeView === 'history'
                    ? 'bg-white text-black shadow-xl'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t('history') || 'History'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 bg-white/5 backdrop-blur-2xl p-8 rounded-[32px] border border-white/10 shadow-2xl">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                {t('topicLabel') || 'Topic'}
              </label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] transition-all"
                placeholder={t('topicPlaceholder') || 'e.g., Court holiday schedule'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                {t('audience') || 'Audience'}
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] transition-all appearance-none"
              >
                <option className="text-black" value="Public">
                  {t('public') || 'Public'}
                </option>
                <option className="text-black" value="Lawyers">
                  {t('lawyers') || 'Lawyers'}
                </option>
                <option className="text-black" value="Staff">
                  {t('courtStaff') || 'Court Staff'}
                </option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !topic}
                className="w-full bg-[var(--app-accent)] text-white hover:brightness-110 active:scale-95 px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center disabled:opacity-50"
              >
                {generateMutation.isPending
                  ? t('generating') || 'Generating...'
                  : t('generateDraft') || 'Generate Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Abstract Background Effects */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-[var(--app-accent)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[300px] h-[300px] bg-[var(--app-accent)] opacity-5 rounded-full blur-[100px]"></div>
      </div>

      {/* Main Content: Editor & Publications */}
      <div>
        {activeView === 'editor' ? (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <form onSubmit={handlePublish} className="app-card space-y-8 p-10 border-[var(--app-border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[var(--app-accent-soft)] rounded-2xl text-[var(--app-accent)] shadow-inner">
                    <PencilSquareIcon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black font-display tracking-tight text-[var(--app-text)]">
                    {t('draftEditor') || 'Draft Editor'}
                  </h2>
                </div>
                {message && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs animate-fade-in ${
                      message.type === 'success'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {message.type === 'success' && <DocumentPlusIcon className="h-4 w-4" />}
                    {message.text}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                    {t('headline') || 'Headline'}
                  </label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="app-input text-xl font-bold py-4"
                    placeholder={t('title') || 'Title'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                    {t('category') || 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="app-select py-4"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                  {t('summary') || 'Summary'}
                </label>
                <input
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  className="app-input py-4"
                  placeholder={t('shortSummary') || 'Short summary of the announcement'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--app-muted)] ml-1">
                  {t('fullContent') || 'Full Content'}
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="app-textarea min-h-64 py-4 leading-relaxed"
                  placeholder={t('announcementContent') || 'Write the full announcement here...'}
                  required
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[var(--app-border)]">
                <label className="flex cursor-pointer items-center gap-5 group flex-1">
                  <div className="p-4 rounded-3xl bg-[var(--app-panel-muted)] text-[var(--app-muted)] group-hover:bg-[var(--app-accent)] group-hover:text-white transition-all shadow-inner">
                    <PhotoIcon className="h-8 w-8" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--app-text)] mb-0.5">
                      {t('featuredImage') || 'Featured Image'}
                    </p>
                    <p className="text-[10px] text-[var(--app-muted)] uppercase tracking-widest truncate">
                      {image ? image.name : t('clickToUpload') || 'Click to upload'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(event) => setImage(event.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={publishMutation.isPending || !title || !content}
                  className="app-btn-primary px-16 py-5 shadow-2xl disabled:opacity-50 active:scale-95 transition-transform text-base"
                >
                  {publishMutation.isPending
                    ? t('publishing') || 'Publishing...'
                    : t('publishAnnouncement') || 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="app-card p-0 overflow-hidden border-none bg-[var(--app-panel-soft)]">
              <div className="p-8 bg-[var(--app-panel)] border-b border-[var(--app-border)] flex items-center justify-between">
                <h2 className="text-xl font-black font-display tracking-tight">
                  {t('recentPublications') || 'Recent Publications'}
                </h2>
                <NewspaperIcon className="h-6 w-6 text-[var(--app-muted)]" />
              </div>
              <div className="divide-y divide-stone-200 dark:divide-stone-800">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-bold text-[var(--app-muted)]">
                      {t('loadingArchives') || 'Loading archives...'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {news?.map((item) => (
                      <div
                        key={item.id}
                        className="group p-6 hover:bg-white dark:hover:bg-stone-900 transition-all rounded-[24px]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--app-accent)] px-2 py-0.5 bg-[var(--app-accent-soft)] rounded-md">
                            {getCategoryLabel(item.category)}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--app-muted)]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-tight text-[var(--app-text)] group-hover:text-[var(--app-accent)] transition-colors line-clamp-2 mb-4">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/news?id=${item.id}`)}
                            className="p-2 rounded-xl bg-[var(--app-panel-muted)] text-[var(--app-muted)] hover:bg-[var(--app-panel-soft)] transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(item.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};