import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, FileImage, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function HistoryPage() {
  const [q, setQ] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const { data: items = [], isLoading, refetch } = useQuery({ queryKey: ['history'], queryFn: () => api.get('/diagnoses') });
  const filtered = useMemo(() => items.filter((item) => (item.result || '').toLowerCase().includes(q.toLowerCase())), [items, q]);
  const allVisibleSelected = filtered.length > 0 && filtered.every((item) => selectedIds.includes(item._id));

  function toggleSelection(id, checked) {
    setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((selectedId) => selectedId !== id));
  }

  function toggleAll(checked) {
    setSelectedIds(checked ? [...new Set([...selectedIds, ...filtered.map((item) => item._id)])] : selectedIds.filter((id) => !filtered.some((item) => item._id === id)));
  }

  async function deleteSelected() {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected OCT report${selectedIds.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    try {
      const result = await api.delete('/diagnoses', { body: JSON.stringify({ ids: selectedIds }) });
      setSelectedIds([]);
      await refetch();
      toast.success(`${result.deleted} OCT report${result.deleted === 1 ? '' : 's'} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete OCT reports');
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div><h1 className="font-display text-3xl font-bold">OCT History</h1><p className="text-sm text-muted-foreground">Your previous retinal OCT uploads and model classifications.</p></div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && <Button variant="destructive" size="sm" onClick={deleteSelected} className="gap-2"><Trash2 className="h-4 w-4" />Delete ({selectedIds.length})</Button>}
          <div className="relative flex-1 sm:w-72"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search findings..." value={q} onChange={(event) => setQ(event.target.value)} /></div>
        </div>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center"><FileImage className="h-10 w-10 text-muted-foreground mx-auto" /><p className="mt-3 font-medium">No OCT classifications yet</p><p className="text-sm text-muted-foreground">Upload your first retinal OCT image from the scan page.</p><Link to="/home" className="mt-4 inline-block text-primary hover:underline">Go to upload</Link></div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"><Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} aria-label="Select all visible OCT reports" />Select all visible reports</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((item, index) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="relative">
                <div className="absolute top-6 left-6 z-10"><Checkbox checked={selectedIds.includes(item._id)} onCheckedChange={(checked) => toggleSelection(item._id, checked === true)} aria-label={`Select ${item.result || 'OCT report'}`} /></div>
                <Link to={`/diagnosis/${item._id}`} className="group flex gap-4 p-4 pl-12 rounded-2xl bg-card-gradient border border-border shadow-soft hover:shadow-elegant transition-all">
                  <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-black grid place-items-center">{item.imagePath ? <img src={`${API_BASE}${item.imagePath}`} alt="Retinal OCT thumbnail" className="h-full w-full object-cover" /> : <FileImage className="h-6 w-6 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm line-clamp-2">{item.result || 'Pending'}</p><p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}</p>{item.confidence != null && <p className="text-xs text-primary font-semibold mt-1">{Math.round(item.confidence * 100)}% confidence</p>}</div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground self-center group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
