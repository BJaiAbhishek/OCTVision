import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadCloud, X, ImageIcon, Loader2, Eye } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png'].includes(f.type)) return toast.error('Only JPG or PNG allowed');
    if (f.size > 10 * 1024 * 1024) return toast.error('Max file size is 10MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
  });

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  }

  async function submit() {
    if (!file || !user) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const data = await api.post('/diagnoses', formData);
      toast.success('OCT classification ready');
      navigate(`/diagnosis/${data.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Upload a retinal <span className="text-gradient">OCT</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Upload a retinal OCT image for AI-assisted CNV, DME, drusen, or normal-pattern classification.</p>
        </div>

        <div className="rounded-3xl bg-card-gradient border border-border shadow-elegant p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!file ? (
              <div key="dz" {...getRootProps()}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                    isDragActive ? 'border-primary bg-accent/40 scale-[1.01]' : 'border-border hover:border-primary/60 hover:bg-accent/20'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-hero text-primary-foreground grid place-items-center shadow-soft mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="font-display text-lg font-semibold">{isDragActive ? 'Drop it here' : 'Drag & drop your retinal OCT image'}</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse — JPG / PNG, up to 10MB</p>
                </motion.div>
              </div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="relative rounded-2xl overflow-hidden bg-black/95 aspect-video grid place-items-center">
                  {preview && <img src={preview} alt="Retinal OCT preview" className="max-h-full max-w-full object-contain" />}
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-3 right-3 rounded-full bg-background/90 p-2 shadow-soft hover:bg-background"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span>{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex justify-end gap-3">
            {file && (
              <Button variant="outline" onClick={clearFile} disabled={submitting}>
                Change image
              </Button>
            )}
            <Button onClick={submit} disabled={!file || submitting} className="bg-hero text-primary-foreground hover:opacity-90 gap-2">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Classify OCT image
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
