import { useState } from 'react';
import { LifeBuoy, Send, ShieldCheck } from 'lucide-react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SupportPage() {
  const [category, setCategory] = useState('website');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [diagnosisId, setDiagnosisId] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (subject.trim().length < 4 || description.trim().length < 20) {
      return toast.error('Add a subject and at least 20 characters describing the issue.');
    }
    setSending(true);
    try {
      await api.post('/support', { category, subject: subject.trim(), description: description.trim(), diagnosisId: diagnosisId.trim() || undefined });
      setSubject('');
      setDescription('');
      setDiagnosisId('');
      toast.success('Support request submitted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit support request');
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl bg-card-gradient border border-border shadow-elegant p-6 sm:p-8">
        <div className="flex gap-4 items-start">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/15 text-primary grid place-items-center"><LifeBuoy className="h-6 w-6" /></div>
          <div>
            <h1 className="font-display text-3xl font-bold">Support</h1>
            <p className="mt-1 text-muted-foreground">Tell us about a website problem or an OCT result you want reviewed.</p>
          </div>
        </div>

        <div className="mt-7 grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-accent/50 border border-border p-4 text-sm">
            <p className="font-semibold">Website issue</p>
            <p className="mt-1 text-muted-foreground">Include the page, what you clicked, what you expected, what happened, plus browser/device details.</p>
          </div>
          <div className="rounded-2xl bg-accent/50 border border-border p-4 text-sm">
            <p className="font-semibold">Result issue</p>
            <p className="mt-1 text-muted-foreground">Include the OCT report ID, predicted class, confidence, and why you think the result needs review.</p>
          </div>
        </div>

        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="category">Issue type</Label>
            <select id="category" value={category} onChange={(event) => setCategory(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm">
              <option value="website">Website or account issue</option>
              <option value="result">OCT result or classification issue</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Short summary</Label>
            <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} placeholder="Example: Report page did not load after upload" />
          </div>
          {category === 'result' && (
            <div className="space-y-2">
              <Label htmlFor="diagnosisId">OCT report ID (optional but helpful)</Label>
              <Input id="diagnosisId" value={diagnosisId} onChange={(event) => setDiagnosisId(event.target.value)} placeholder="Copy it from the report URL" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="description">What happened?</Label>
            <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={4000} className="min-h-36" placeholder="Describe the steps, expected result, actual result, and any useful context." />
          </div>
          <div className="flex gap-2 rounded-xl border border-border p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Do not include names, contact details, or other patient-identifying information. This app is for research and education only.
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-hero text-primary-foreground gap-2"><Send className="h-4 w-4" />{sending ? 'Submitting...' : 'Submit support request'}</Button>
        </form>
      </div>
    </main>
  );
}
