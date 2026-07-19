import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle2, FileWarning, Loader2, Eye } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function severityStyle(severity) {
  switch (severity) {
    case 'high':
      return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critical' };
    case 'moderate':
      return { icon: FileWarning, color: 'text-warning', bg: 'bg-warning/15', label: 'Moderate' };
    case 'low':
      return { icon: FileWarning, color: 'text-primary', bg: 'bg-accent', label: 'Low' };
    default:
      return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Normal' };
  }
}

export default function DiagnosisPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['diagnosis', id],
    queryFn: async () => api.get(`/diagnoses/${id}`),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-3 text-muted-foreground">Loading diagnosis…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-destructive">Could not load this diagnosis.</p>
        <Link to="/home" className="mt-4 inline-block text-primary hover:underline">Back to upload</Link>
      </main>
    );
  }

  const findings = data.findings || [];
  const scores = data.scores || [];
  const confidence = data.confidence || 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/home">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-black overflow-hidden shadow-elegant border border-border">
          {data.imagePath ? (
            <img src={`${API_BASE}${data.imagePath}`} alt="Uploaded retinal OCT" className="w-full h-full object-contain max-h-[520px]" />
          ) : (
            <div className="aspect-square grid place-items-center text-muted-foreground">No preview</div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl bg-card-gradient border border-border shadow-elegant p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <h1 className="font-display text-2xl font-bold">Retinal OCT Report</h1>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Top-class confidence</div>
                <div className="font-display text-2xl font-bold text-gradient">{Math.round(confidence * 100)}%</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(data.createdAt).toLocaleString()}
            </div>
            <p className="mt-4 text-foreground leading-relaxed font-medium">{data.result}</p>
          </div>

          <div className="rounded-3xl bg-card-gradient border border-border shadow-soft p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Findings</h2>
            <ul className="space-y-3">
              {findings.map((finding, index) => {
                const style = severityStyle(finding.severity);
                const Icon = style.icon;
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 rounded-xl p-4 ${style.bg}`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 ${style.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{finding.label}</p>
                        <span className={`text-xs font-semibold ${style.color}`}>{style.label}</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-background/60 overflow-hidden">
                        <div className="h-full bg-hero" style={{ width: `${Math.round(finding.confidence * 100)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{Math.round(finding.confidence * 100)}% confidence</p>
                      {finding.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{finding.description}</p>}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground mt-5 italic">
              Research and educational classification only. This model is not a clinical diagnosis and should not be used as a substitute for an ophthalmologist.
            </p>
          </div>

          {scores.length > 0 && (
            <div className="rounded-3xl bg-card-gradient border border-border shadow-soft p-6">
              <h2 className="font-display text-lg font-semibold mb-4">All model probabilities</h2>
              <div className="space-y-3">
                {scores.map((score) => (
                  <div key={score.label}>
                    <div className="flex justify-between gap-3 text-sm mb-1">
                      <span className="font-medium">{score.label}</span>
                      <span className="text-muted-foreground">{Math.round(score.confidence * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-accent overflow-hidden">
                      <div className="h-full bg-hero" style={{ width: `${Math.max(score.confidence * 100, 0.5)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/home" className="block">
            <Button className="w-full bg-hero text-primary-foreground hover:opacity-90 gap-2">
              <Eye className="h-4 w-4" /> Classify another image
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
