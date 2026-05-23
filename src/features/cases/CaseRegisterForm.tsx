import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { CaseQrSuccessModal } from '../../components/CaseQrSuccessModal';
import {
  DocumentIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ScaleIcon,
  UserGroupIcon,
  FolderOpenIcon,
  ClipboardDocumentCheckIcon,
  IdentificationIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import apiClient from '../../lib/axios';
import { useLanguage } from '../../i18n';

export const CaseRegisterForm = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: judgesList } = useQuery({
    queryKey: ['judgesList'],
    queryFn: async () =>
      (await apiClient.get('/users/judges')).data as {
        user_id: number;
        full_name: string;
        username: string;
      }[],
  });

  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(1);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [registeredCaseNumber, setRegisteredCaseNumber] = useState<string | null>(null);

  // Translation keys for steps
  const steps = [
    {
      step: 1,
      name: t('classification') || 'Classification',
      icon: FolderOpenIcon,
      desc: t('caseSpecifications') || 'Case specifications',
    },
    {
      step: 2,
      name: t('partiesInvolved') || 'Parties Involved',
      icon: UserGroupIcon,
      desc: t('plaintiffDefendant') || 'Plaintiff & Defendant',
    },
    {
      step: 3,
      name: t('routingFilings') || 'Routing & Filings',
      icon: ClipboardDocumentCheckIcon,
      desc: t('judiciaryDocuments') || 'Judiciary & Documents',
    },
  ];

  // Zod schema for rich validation
  const caseSchema = z
    .object({
      case_number: z.string().min(1, 'Case number is required'),
      case_type: z.string().min(1, 'Case type is required'),
      filing_division: z.string().min(1, 'Filing division is required'),
      urgency_level: z.string().min(1, 'Urgency level is required'),

      plaintiff_name: z.string().min(3, 'Plaintiff name must be at least 3 characters'),
      plaintiff_phone: z.string().optional(),
      plaintiff_email: z.string().min(1, 'Plaintiff email is required').email('Invalid email address'),
      plaintiff_address: z.string().optional(),
      lawyer_name: z.string().optional(),

      defendant_name: z.string().min(3, 'Defendant name must be at least 3 characters'),
      defendant_phone: z.string().optional(),
      defendant_email: z.string().min(1, 'Defendant email is required').email('Invalid email address'),
      defendant_address: z.string().optional(),
      defendant_lawyer: z.string().optional(),

      judge_name: z.string().optional(),
      assigned_judge_id: z.string().optional(),
      case_user_name: z.string().min(1, 'Client public portal username is required'),
      description: z.string().optional(),
      hearing_date: z.string().optional(),
      hearing_time: z.string().optional(),
      hearing_notes: z.string().optional(),
    })
    .refine(
      (data) => {
        const wantsHearing = !!data.hearing_date || !!data.hearing_time || !!data.hearing_notes?.trim();
        if (!wantsHearing) return true;
        return !!data.hearing_date && !!data.hearing_time;
      },
      {
        message: 'Hearing date and time are required when scheduling a hearing',
        path: ['hearing_date'],
      }
    )
    .refine(
      (data) => {
        const wantsHearing = !!data.hearing_date || !!data.hearing_time || !!data.hearing_notes?.trim();
        if (!wantsHearing) return true;
        return !!data.assigned_judge_id;
      },
      {
        message: 'Please assign a judge before scheduling a hearing',
        path: ['assigned_judge_id'],
      }
    );

  type CaseFormData = z.infer<typeof caseSchema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CaseFormData & { document?: FileList }>({
    resolver: zodResolver(caseSchema),
    mode: 'onChange',
    defaultValues: {
      case_number: '',
      case_type: 'Civil',
      filing_division: 'General Civil',
      urgency_level: 'Regular',
      plaintiff_name: '',
      plaintiff_email: '',
      defendant_name: '',
      defendant_email: '',
      description: '',
      judge_name: '',
      assigned_judge_id: '',
      case_user_name: '',
      lawyer_name: '',
      hearing_date: '',
      hearing_time: '',
      hearing_notes: '',
    },
  });

  const stepFields: Record<number, (keyof CaseFormData)[]> = {
    1: ['case_number', 'case_type', 'filing_division', 'urgency_level'],
    2: ['plaintiff_name', 'plaintiff_email', 'defendant_name', 'defendant_email'],
    3: ['assigned_judge_id', 'case_user_name', 'description', 'hearing_date', 'hearing_time', 'hearing_notes'],
  };

  const validateStepsUpTo = async (step: number) => {
    for (let currentStep = 1; currentStep <= step; currentStep += 1) {
      const isStepValid = await trigger(stepFields[currentStep], { shouldFocus: true });
      if (!isStepValid) return false;
    }
    return true;
  };

  const goToStep = async (nextStep: number) => {
    if (nextStep <= activeStep) {
      setActiveStep(nextStep);
      return;
    }
    const canProceed = await validateStepsUpTo(nextStep - 1);
    if (canProceed) setActiveStep(nextStep);
  };

  const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const caseTypeAbbrev = (watch('case_type') || 'CIV').substring(0, 3).toUpperCase();
    const formatted = `CASE-${year}-${caseTypeAbbrev}-${rand}`;
    setValue('case_number', formatted, { shouldValidate: true });
  };

  useEffect(() => {
    generateCaseNumber();
  }, [watch('case_type')]);

  const selectedFile = watch('document');

  const registerCase = async (data: CaseFormData & { document?: FileList }) => {
    const formData = new FormData();
    formData.append('case_number', data.case_number);
    formData.append('case_type', data.case_type);
    formData.append('plaintiff_name', data.plaintiff_name);
    formData.append('defendant_name', data.defendant_name);

    const complexDetails = {
      filing_division: data.filing_division,
      urgency_level: data.urgency_level,
      plaintiff_phone: data.plaintiff_phone,
      plaintiff_email: data.plaintiff_email,
      plaintiff_address: data.plaintiff_address,
      defendant_phone: data.defendant_phone,
      defendant_email: data.defendant_email,
      defendant_address: data.defendant_address,
      defendant_lawyer: data.defendant_lawyer,
      factual_summary: data.description,
    };

    formData.append('description', JSON.stringify(complexDetails));

    const selectedJudgeId = data.assigned_judge_id;
    if (selectedJudgeId) {
      formData.append('assigned_judge_id', selectedJudgeId);
      const judge = judgesList?.find((j) => String(j.user_id) === selectedJudgeId);
      if (judge) formData.append('judge_name', judge.full_name);
    } else if (data.judge_name) {
      formData.append('judge_name', data.judge_name);
    }
    if (data.case_user_name) formData.append('case_user_name', data.case_user_name);
    if (data.lawyer_name) formData.append('lawyer_name', data.lawyer_name);
    if (data.hearing_date) formData.append('hearing_date', data.hearing_date);
    if (data.hearing_time) formData.append('hearing_time', data.hearing_time);
    if (data.hearing_notes) formData.append('hearing_notes', data.hearing_notes);

    if (data.document && data.document[0]) {
      formData.append('document', data.document[0]);
    }

    const response = await apiClient.post('/cases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: registerCase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['recentCases'] });
      queryClient.invalidateQueries({ queryKey: ['judgeCases'] });
      queryClient.invalidateQueries({ queryKey: ['lawyerCases'] });
      setRegisteredCaseNumber(data.case_number ?? null);
      setIsQrModalOpen(true);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || t('registrationFailed') || 'Filing registration failed.');
    },
  });

  const onSubmit = (data: CaseFormData & { document?: FileList }) => mutation.mutate(data);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-[30px] bg-[image:var(--app-sidebar-bg)] p-8 text-white shadow-xl">
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-[var(--app-accent)]">
              <ScaleIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black tracking-tight">
                {t('registerNewCase') || 'Filing & Case Registration'}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Create an official judicial record. Please enter verified case metadata, assign appropriate
                actors, and upload relevant legal documentation.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Progress Steps Header - Using steps array with translations */}
        <div className="grid grid-cols-3 gap-4">
          {steps.map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => goToStep(s.step)}
              className={`p-4 rounded-2xl border transition-all duration-300 text-left relative flex items-center gap-3 ${
                activeStep === s.step
                  ? 'bg-[var(--app-panel-soft)] border-[var(--app-accent)] shadow-md translate-y-[-2px]'
                  : 'bg-[var(--app-panel)] border-[var(--app-border)] hover:bg-[var(--app-panel-soft)]'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  activeStep === s.step
                    ? 'bg-[var(--app-accent-soft)] text-[var(--app-accent)]'
                    : 'bg-[var(--app-panel-muted)] text-[var(--app-muted)]'
                }`}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-[var(--app-muted)] font-black uppercase tracking-widest">
                  Step {s.step}
                </p>
                <p className="text-sm font-bold text-[var(--app-text)]">{s.name}</p>
              </div>
              {activeStep > s.step && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute top-3 right-3" />}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="app-card space-y-8 bg-[var(--app-panel)] border border-[var(--app-border)] shadow-xl p-8 rounded-[24px]">
          {/* STEP 1: Case Classification */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[var(--app-border)] pb-4">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <FolderOpenIcon className="h-5 w-5 text-[var(--app-accent)]" />
                  {t('caseClassificationCoreDetails') || 'Case Classification & Core Details'}
                </h2>
                <p className="text-xs text-[var(--app-muted)] mt-1">
                  {t('specifyClassification') || 'Specify Classification Division, Case Types, Urgency Parameters, And Standard Formatting.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label">{t('caseClassificationType') || 'CASE CLASSIFICATION / TYPE'}</label>
                  <select {...register('case_type')} className="app-select">
                    <option value="Civil">{t('civil') || 'Civil Litigation'}</option>
                    <option value="Criminal">{t('criminal') || 'Criminal Trial'}</option>
                    <option value="Family">{t('family') || 'Family & Marital Law'}</option>
                    <option value="Commercial">{t('commercial') || 'Commercial & Trade'}</option>
                    <option value="Constitutional">{t('constitutionalAdministrative') || 'Constitutional / Administrative'}</option>
                    <option value="Labor">{t('laborEmploymentDispute') || 'Labor / Employment Dispute'}</option>
                    <option value="Probate">{t('probateEstateInheritance') || 'Probate / Estate Inheritance'}</option>
                  </select>
                  {errors.case_type && <p className="app-error">{errors.case_type.message}</p>}
                </div>

                <div>
                  <label className="app-label">{t('filingDivision') || 'FILING DIVISION'}</label>
                  <select {...register('filing_division')} className="app-select">
                    <option value="General Civil">{t('generalCivilDivision') || 'General Civil Division'}</option>
                    <option value="Commercial Division">{t('commercialContractDivision') || 'Commercial / Contract Division'}</option>
                    <option value="Criminal Bench">{t('criminalHighBench') || 'Criminal High Bench'}</option>
                    <option value="Family Bench">{t('familyCourtRegistry') || 'Family Court Registry'}</option>
                    <option value="Constitutional Appeals">{t('constitutionalAppealsCourt') || 'Constitutional Appeals Court'}</option>
                  </select>
                  {errors.filing_division && <p className="app-error">{errors.filing_division.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label">{t('urgencyPriorityStatus') || 'URGENCY & PRIORITY STATUS'}</label>
                  <select {...register('urgency_level')} className="app-select">
                    <option value="Regular">{t('regularSpeed') || 'Regular (Standard Processing Speed)'}</option>
                    <option value="Urgent">{t('urgentHighPriority') || 'Urgent (High Priority)'}</option>
                    <option value="Expedited">{t('expeditedOrder') || 'Expedited (Order)'}</option>
                    <option value="Immediate-Stay">{t('immediateStayOrder') || 'Immediate Stay Order'}</option>
                  </select>
                  {errors.urgency_level && <p className="app-error">{errors.urgency_level.message}</p>}
                </div>

                <div>
                  <label className="app-label flex items-center justify-between">
                    <span>{t('caseNumberOfficial') || 'CASE NUMBER (OFFICIAL)'}</span>
                    <button
                      type="button"
                      onClick={generateCaseNumber}
                      className="text-xs text-[var(--app-accent)] hover:underline flex items-center gap-1 font-bold"
                    >
                      <ArrowPathIcon className="h-3 w-3" /> {t('regenerate') || 'Regenerate'}
                    </button>
                  </label>
                  <input
                    type="text"
                    {...register('case_number')}
                    className="app-input font-mono tracking-wider font-bold"
                    placeholder={t('caseNumberPlaceholder') || 'CASE-2026-CIV-XXXX'}
                  />
                  {errors.case_number && <p className="app-error">{errors.case_number.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Parties Details */}
          {activeStep === 2 && (
            <div className="space-y-8 animate-fade-in">
              {/* Plaintiff Segment */}
              <div className="space-y-6">
                <div className="border-b border-[var(--app-border)] pb-4">
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <IdentificationIcon className="h-5 w-5 text-[var(--app-accent)]" />
                    {t('plaintiffPetitionerDetails') || 'Plaintiff / Petitioner Details'}
                  </h2>
                  <p className="text-xs text-[var(--app-muted)] mt-1">
                    {t('specifyIdentity') || 'Specify identity, contact information, and legal representation.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="app-label">{t('plaintiffFullName') || 'Plaintiff Full Name'}</label>
                    <input {...register('plaintiff_name')} className="app-input" placeholder={t('legalFullName') || 'Legal full name'} />
                    {errors.plaintiff_name && <p className="app-error">{errors.plaintiff_name.message}</p>}
                  </div>
                  <div>
                    <label className="app-label">{t('plaintiffPhoneNumber') || 'Plaintiff Phone Number'}</label>
                    <input {...register('plaintiff_phone')} className="app-input" placeholder={t('phonePlaceholder1') || '+1 234 567 8900'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="app-label flex items-center gap-1">
                      <span>{t('plaintiffEmailAddress') || 'Plaintiff Email Address'}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input {...register('plaintiff_email')} className="app-input" placeholder={t('emailPlaceholder1') || 'plaintiff@example.com'} />
                    {errors.plaintiff_email && <p className="app-error">{errors.plaintiff_email.message}</p>}
                  </div>
                  <div>
                    <label className="app-label">{t('plaintiffLawyerName') || 'Plaintiff Lawyer Name'}</label>
                    <input {...register('lawyer_name')} className="app-input" placeholder={t('representingLegalCounsel') || 'Representing legal counsel'} />
                  </div>
                </div>

                <div>
                  <label className="app-label">{t('plaintiffResidenceAddress') || 'Plaintiff Residence / Address'}</label>
                  <input {...register('plaintiff_address')} className="app-input" placeholder={t('addressPlaceholder') || 'Street, City, Postal Code'} />
                </div>
              </div>

              {/* Defendant Segment */}
              <div className="space-y-6 pt-4 border-t border-[var(--app-border)]">
                <div className="border-b border-[var(--app-border)] pb-4">
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <IdentificationIcon className="h-5 w-5 text-red-500" />
                    {t('defendantRespondentDetails') || 'Defendant / Respondent Details'}
                  </h2>
                  <p className="text-xs text-[var(--app-muted)] mt-1">
                    {t('specifyTargetOpposing') || 'Specify target opposing party information.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="app-label">{t('defendantFullName') || 'Defendant Full Name'}</label>
                    <input {...register('defendant_name')} className="app-input" placeholder={t('respondentFullName') || 'Respondent full name'} />
                    {errors.defendant_name && <p className="app-error">{errors.defendant_name.message}</p>}
                  </div>
                  <div>
                    <label className="app-label">{t('defendantPhoneNumber') || 'Defendant Phone Number'}</label>
                    <input {...register('defendant_phone')} className="app-input" placeholder={t('phonePlaceholder2') || '+1 234 567 8900'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="app-label flex items-center gap-1">
                      <span>{t('defendantEmailAddress') || 'Defendant Email Address'}</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input {...register('defendant_email')} className="app-input" placeholder={t('emailPlaceholder2') || 'defendant@example.com'} />
                    {errors.defendant_email && <p className="app-error">{errors.defendant_email.message}</p>}
                  </div>
                  <div>
                    <label className="app-label">{t('defendantLawyerName') || 'Defendant Lawyer Name'}</label>
                    <input {...register('defendant_lawyer')} className="app-input" placeholder={t('opposingLegalCounsel') || 'Opposing legal counsel'} />
                  </div>
                </div>

                <div>
                  <label className="app-label">{t('defendantResidenceAddress') || 'Defendant Residence / Address'}</label>
                  <input {...register('defendant_address')} className="app-input" placeholder={t('addressPlaceholder') || 'Street, City, Postal Code'} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Routing, Claims & Filings */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-[var(--app-border)] pb-4">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-[var(--app-accent)]" />
                  {t('judicialAssignmentDocumentUpload') || 'Judicial Assignment & Document Upload'}
                </h2>
                <p className="text-xs text-[var(--app-muted)] mt-1">
                  {t('linkCaseActors') || 'Link case actors, upload petition, and schedule initial hearing.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="app-label">{t('assignedJudge') || 'Assigned Judge'}</label>
                  <select {...register('assigned_judge_id')} className="app-select">
                    <option value="">{t('selectJudge') || '-- Select Judge --'}</option>
                    {judgesList?.map((j) => (
                      <option key={j.user_id} value={String(j.user_id)}>
                        {j.full_name} (@{j.username})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] app-muted mt-1">{t('selectFromRegisteredJudges') || 'Select from registered judiciary users.'}</p>
                </div>

                <div>
                  <label className="app-label flex items-center gap-1">
                    <span>{t('clientPublicPortalUsername') || 'Client Public Portal Username'}</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    {...register('case_user_name')}
                    className="app-input"
                    placeholder={t('usernameSyncPlaceholder') || 'Username from citizen portal'}
                  />
                  {errors.case_user_name && <p className="app-error">{errors.case_user_name.message}</p>}
                </div>
              </div>

              <div>
                <label className="app-label">{t('factualDescription') || 'Factual Description / Claims'}</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="app-textarea"
                  placeholder={t('contextOverviewPlaceholder') || 'Provide a concise overview of the dispute, facts, and legal grounds.'}
                />
              </div>

              <div className="app-card-soft p-6 border border-[var(--app-border)] rounded-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[var(--app-accent-soft)] text-[var(--app-accent)]">
                    <CalendarDaysIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--app-text)]">{t('hearingScheduler') || 'Hearing Scheduler'}</h3>
                    <p className="text-xs text-[var(--app-muted)]">{t('scheduleFirstHearing') || 'Schedule first appearance or preliminary hearing'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="app-label">{t('hearingDate') || 'Hearing Date'}</label>
                    <input type="date" {...register('hearing_date')} className="app-input" />
                    {errors.hearing_date && <p className="app-error">{errors.hearing_date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="app-label">{t('hearingTime') || 'Hearing Time'}</label>
                    <input type="time" {...register('hearing_time')} className="app-input" />
                    {errors.hearing_time && <p className="app-error">{errors.hearing_time.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="app-label">{t('hearingNotes') || 'Hearing Notes'}</label>
                  <textarea
                    {...register('hearing_notes')}
                    rows={3}
                    className="app-textarea"
                    placeholder={t('optionalNotesPlaceholder') || 'Optional: location, virtual link, special instructions...'}
                  />
                </div>
              </div>

              {/* Evidence/Document upload dropzone */}
              <div>
                <label className="app-label mb-2 block">{t('uploadOfficialPetition') || 'Upload Official Petition / Supporting Documents'}</label>
                <div className="app-card-soft p-6 border-dashed border-2 border-[var(--app-border)] hover:border-[var(--app-accent)] transition-colors group cursor-pointer relative rounded-xl">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 rounded-full bg-[var(--app-accent-soft)] mb-3 group-hover:scale-110 transition-transform">
                      {selectedFile && selectedFile.length > 0 ? (
                        selectedFile[0].type.startsWith('image/') ? (
                          <PhotoIcon className="w-8 h-8 text-[var(--app-accent)]" />
                        ) : selectedFile[0].type.includes('pdf') || selectedFile[0].type.includes('document') ? (
                          <DocumentTextIcon className="w-8 h-8 text-[var(--app-accent)]" />
                        ) : (
                          <DocumentIcon className="w-8 h-8 text-[var(--app-accent)]" />
                        )
                      ) : (
                        <ArrowUpTrayIcon className="w-8 h-8 text-[var(--app-accent)]" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-[var(--app-text)]">
                      {selectedFile && selectedFile.length > 0
                        ? selectedFile[0].name
                        : t('clickToUpload') || 'Click to Upload Support Filings & Exhibits'}
                    </p>
                    {selectedFile && selectedFile.length > 0 ? (
                      <p className="text-xs text-[var(--app-accent)] font-bold mt-1 uppercase tracking-wider">
                        {selectedFile[0].name.split('.').pop()} • {(selectedFile[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--app-muted)] mt-1">
                        {t('supportedFormats') || 'Supported: PDF, DOC, DOCX, JPG, PNG (max 20MB)'}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    {...register('document')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--app-border)]">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep((prev) => prev - 1)}
              className="app-btn px-6 py-3 border border-[var(--app-border)] hover:bg-[var(--app-panel-soft)] text-sm font-bold disabled:opacity-30 disabled:pointer-events-none rounded-xl"
            >
              {t('previousTab') || 'Previous Tab'}
            </button>

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => goToStep(activeStep + 1)}
                className="app-btn-primary px-8 py-3 rounded-xl text-sm font-bold active:scale-95"
              >
                {t('continueNext') || 'Continue Next'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={mutation.isPending}
                className="app-btn-primary px-10 py-4 shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2 rounded-xl text-md font-bold"
              >
                {mutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                    {t('finalizeCaseRegistration') || 'Finalize Case Registration'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <CaseQrSuccessModal
        isOpen={isQrModalOpen}
        caseNumber={registeredCaseNumber}
        onClose={() => setIsQrModalOpen(false)}
        onGoToCases={() => {
          setIsQrModalOpen(false);
          navigate('/cases/all');
        }}
      />
    </>
  );
};