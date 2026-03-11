import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  type Subject,
  type Video as VideoType,
  useAddSubject,
  useAddVideo,
  useDeleteSubject,
  useDeleteVideo,
  useEditSubject,
  useEditVideo,
  useLogoUrl,
  useSetLogoUrl,
  useSubjectsByBatch,
  useVideosBySubject,
} from "@/hooks/useQueries";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Image,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

// ── Token Guard ───────────────────────────────────────────────────────────────

function useAdminToken() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("mj_admin_token"),
  );
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("mj_admin_token");
    if (!stored) {
      navigate({ to: "/admin/login" });
      return;
    }

    // If actor not ready yet, wait
    if (isFetching) return;

    if (!actor) {
      // Actor unavailable but token exists — allow access with stored token
      setIsVerifying(false);
      return;
    }

    actor
      .verifyToken(stored)
      .then((valid) => {
        if (valid) {
          setToken(stored);
        } else {
          localStorage.removeItem("mj_admin_token");
          setToken(null);
          toast.error("Session expired. Please log in again.");
          navigate({ to: "/admin/login" });
        }
      })
      .catch(() => {
        // If verify fails, still allow with stored token (offline tolerance)
        setToken(stored);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [actor, isFetching, navigate]);

  return { token, isVerifying: isVerifying && isFetching };
}

// ── Logo Manager ──────────────────────────────────────────────────────────────

function LogoManager({ token }: { token: string }) {
  const { data: logoUrl, isLoading } = useLogoUrl();
  const setLogo = useSetLogoUrl();
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    if (logoUrl !== undefined) setNewUrl(logoUrl);
  }, [logoUrl]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await setLogo.mutateAsync({ token, url: newUrl });
      toast.success("Logo URL updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update logo");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Image className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">Platform Logo</h3>
          <p className="text-sm text-muted-foreground">
            Set the logo URL displayed in the header
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-5 p-4 rounded-lg border border-dashed border-border bg-secondary/30 flex items-center gap-4">
        {logoUrl && logoUrl.trim() !== "" ? (
          <img
            src={logoUrl}
            alt="Current logo"
            className="h-14 w-auto max-w-[200px] object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/mission-jeet-logo-transparent.dim_200x200.png"
              alt="Default logo"
              className="h-12 w-12 object-contain"
            />
            <span className="font-display font-extrabold text-lg">
              <span className="text-primary">Mission</span> Jeet
            </span>
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          Current logo preview
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="logo-url">Logo URL</Label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input
              id="logo-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="bg-secondary/50"
              data-ocid="admin.logo_input"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Enter a direct image URL. Leave empty to use the default Mission
            Jeet logo.
          </p>
        </div>
        <Button
          type="submit"
          disabled={setLogo.isPending}
          className="bg-primary hover:bg-primary/90 text-white"
          data-ocid="admin.logo_save_button"
        >
          {setLogo.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Logo
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ── Subject Dialog ────────────────────────────────────────────────────────────

interface SubjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, displayOrder: number) => Promise<void>;
  initial?: Subject;
  batchType: string;
  isSaving: boolean;
}

function SubjectDialog({
  open,
  onClose,
  onSave,
  initial,
  batchType,
  isSaving,
}: SubjectDialogProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [order, setOrder] = useState(String(initial?.displayOrder ?? 1));

  // biome-ignore lint/correctness/useExhaustiveDependencies: open prop is intentional to reset form on dialog reopen
  useEffect(() => {
    setName(initial?.name ?? "");
    setOrder(String(initial?.displayOrder ?? 1));
  }, [initial, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave(name.trim(), Number(order));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border"
        data-ocid="admin.subject.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            {initial ? "Edit Subject" : `Add Subject to ${batchType}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {initial
              ? "Update subject details"
              : `Create a new subject for the ${batchType} batch`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Physics, Chemistry, Mathematics"
              required
              className="bg-secondary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject-order">Display Order</Label>
            <Input
              id="subject-order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="bg-secondary/50 w-24"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              data-ocid="admin.subject.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
              data-ocid="admin.subject.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {initial ? "Update" : "Add Subject"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Video Dialog ──────────────────────────────────────────────────────────────

interface VideoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    videoUrl: string,
    displayOrder: number,
  ) => Promise<void>;
  initial?: VideoType;
  subjectName: string;
  isSaving: boolean;
}

function VideoDialog({
  open,
  onClose,
  onSave,
  initial,
  subjectName,
  isSaving,
}: VideoDialogProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [order, setOrder] = useState(String(initial?.displayOrder ?? 1));

  // biome-ignore lint/correctness/useExhaustiveDependencies: open prop is intentional to reset form on dialog reopen
  useEffect(() => {
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setVideoUrl(initial?.videoUrl ?? "");
    setOrder(String(initial?.displayOrder ?? 1));
  }, [initial, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave(
      title.trim(),
      description.trim(),
      videoUrl.trim(),
      Number(order),
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="admin.video.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold">
            {initial ? "Edit Video" : `Add Video to ${subjectName}`}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {initial ? "Update video details" : "Add a new video lecture"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Newton's Laws of Motion - Part 1"
              required
              className="bg-secondary/50"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or direct URL"
              required
              className="bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              YouTube URLs are automatically embedded. Other URLs play directly.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-desc">Description (optional)</Label>
            <Textarea
              id="video-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this lecture covers..."
              rows={3}
              className="bg-secondary/50 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="video-order">Display Order</Label>
            <Input
              id="video-order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              required
              className="bg-secondary/50 w-24"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              data-ocid="admin.video.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title.trim() || !videoUrl.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
              data-ocid="admin.video.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {initial ? "Update" : "Add Video"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Subject Row with Video Management ────────────────────────────────────────

interface SubjectRowProps {
  subject: Subject;
  index: number;
  token: string;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}

function SubjectRow({
  subject,
  index,
  token,
  onEditSubject,
  onDeleteSubject,
}: SubjectRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { data: videos, isLoading: videosLoading } = useVideosBySubject(
    expanded ? subject.id : null,
  );

  const addVideo = useAddVideo();
  const editVideo = useEditVideo();
  const deleteVideo = useDeleteVideo();

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | undefined>(
    undefined,
  );
  const [deletingVideo, setDeletingVideo] = useState<VideoType | null>(null);

  const handleAddVideo = async (
    title: string,
    description: string,
    videoUrl: string,
    displayOrder: number,
  ) => {
    try {
      await addVideo.mutateAsync({
        token,
        title,
        description,
        videoUrl,
        subjectId: subject.id,
        displayOrder: BigInt(displayOrder),
      });
      toast.success("Video added successfully");
      setVideoDialogOpen(false);
      setExpanded(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add video");
    }
  };

  const handleEditVideo = async (
    title: string,
    description: string,
    videoUrl: string,
    displayOrder: number,
  ) => {
    if (!editingVideo) return;
    try {
      await editVideo.mutateAsync({
        token,
        id: editingVideo.id,
        title,
        description,
        videoUrl,
        subjectId: subject.id,
        displayOrder: BigInt(displayOrder),
      });
      toast.success("Video updated successfully");
      setVideoDialogOpen(false);
      setEditingVideo(undefined);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update video",
      );
    }
  };

  const handleDeleteVideo = async () => {
    if (!deletingVideo) return;
    try {
      await deleteVideo.mutateAsync({ token, id: deletingVideo.id });
      toast.success("Video deleted");
      setDeletingVideo(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete video",
      );
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="border border-border rounded-xl overflow-hidden"
        data-ocid={`admin.subject.item.${index + 1}`}
      >
        {/* Subject Header */}
        <div className="flex items-center gap-3 p-4 bg-card">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-mono font-bold text-primary">
              #{String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <span className="font-semibold">{subject.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                Order: {String(subject.displayOrder)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingVideo(undefined);
                setVideoDialogOpen(true);
              }}
              className="text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
              data-ocid="admin.add_video_button"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Video
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditSubject(subject)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              data-ocid={`admin.subject.edit_button.${index + 1}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteSubject(subject)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.subject.delete_button.${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Videos Expand */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="p-4 bg-background/50 space-y-2">
                {videosLoading && (
                  <div
                    className="space-y-2"
                    data-ocid="admin.videos.loading_state"
                  >
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                )}

                {!videosLoading && (!videos || videos.length === 0) && (
                  <div
                    className="text-center py-6 text-sm text-muted-foreground"
                    data-ocid="admin.videos.empty_state"
                  >
                    No videos yet. Click "Add Video" to get started.
                  </div>
                )}

                {!videosLoading &&
                  videos &&
                  videos.length > 0 &&
                  videos
                    .sort(
                      (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
                    )
                    .map((video, vi) => (
                      <div
                        key={video.id.toString()}
                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-border/80"
                        data-ocid={`admin.video.item.${vi + 1}`}
                      >
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-xs font-mono font-bold text-primary flex-shrink-0">
                          {vi + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {video.title}
                          </p>
                          {video.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {video.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingVideo(video);
                              setVideoDialogOpen(true);
                            }}
                            data-ocid={`admin.video.edit_button.${vi + 1}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingVideo(video)}
                            data-ocid={`admin.video.delete_button.${vi + 1}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add/Edit Video Dialog */}
      <VideoDialog
        open={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false);
          setEditingVideo(undefined);
        }}
        onSave={editingVideo ? handleEditVideo : handleAddVideo}
        initial={editingVideo}
        subjectName={subject.name}
        isSaving={addVideo.isPending || editVideo.isPending}
      />

      {/* Delete Video Confirm */}
      <AlertDialog
        open={!!deletingVideo}
        onOpenChange={(o) => !o && setDeletingVideo(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Video?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingVideo?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.video.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="admin.video.delete_button"
            >
              {deleteVideo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Batch Content Manager ─────────────────────────────────────────────────────

function BatchManager({
  batchType,
  token,
}: { batchType: string; token: string }) {
  const { data: subjects, isLoading } = useSubjectsByBatch(batchType);
  const addSubject = useAddSubject();
  const editSubject = useEditSubject();
  const deleteSubject = useDeleteSubject();

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(
    undefined,
  );
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const handleAddSubject = async (name: string, displayOrder: number) => {
    try {
      await addSubject.mutateAsync({
        token,
        name,
        batchType,
        displayOrder: BigInt(displayOrder),
      });
      toast.success("Subject added successfully");
      setSubjectDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add subject");
    }
  };

  const handleEditSubject = async (name: string, displayOrder: number) => {
    if (!editingSubject) return;
    try {
      await editSubject.mutateAsync({
        token,
        id: editingSubject.id,
        name,
        batchType,
        displayOrder: BigInt(displayOrder),
      });
      toast.success("Subject updated");
      setSubjectDialogOpen(false);
      setEditingSubject(undefined);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update subject",
      );
    }
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    try {
      await deleteSubject.mutateAsync({ token, id: deletingSubject.id });
      toast.success("Subject deleted");
      setDeletingSubject(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete subject",
      );
    }
  };

  const Icon = batchType === "JEE" ? BookOpen : FlaskConical;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-display font-bold text-lg">
            {batchType} Subjects
          </h3>
          {subjects && (
            <span className="text-sm text-muted-foreground">
              ({subjects.length})
            </span>
          )}
        </div>
        <Button
          onClick={() => {
            setEditingSubject(undefined);
            setSubjectDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white gap-2"
          size="sm"
          data-ocid="admin.add_subject_button"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Subjects */}
      {isLoading && (
        <div className="space-y-3" data-ocid="admin.subjects.loading_state">
          {["a1", "a2", "a3", "a4"].map((key) => (
            <Skeleton key={key} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (!subjects || subjects.length === 0) && (
        <div
          className="text-center py-14 border border-dashed border-border rounded-xl"
          data-ocid="admin.subjects.empty_state"
        >
          <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-semibold mb-1">No subjects yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first {batchType} subject to get started.
          </p>
        </div>
      )}

      {!isLoading && subjects && subjects.length > 0 && (
        <div className="space-y-3">
          {subjects
            .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
            .map((subject, i) => (
              <SubjectRow
                key={subject.id.toString()}
                subject={subject}
                index={i}
                token={token}
                onEditSubject={(s) => {
                  setEditingSubject(s);
                  setSubjectDialogOpen(true);
                }}
                onDeleteSubject={setDeletingSubject}
              />
            ))}
        </div>
      )}

      {/* Add/Edit Subject Dialog */}
      <SubjectDialog
        open={subjectDialogOpen}
        onClose={() => {
          setSubjectDialogOpen(false);
          setEditingSubject(undefined);
        }}
        onSave={editingSubject ? handleEditSubject : handleAddSubject}
        initial={editingSubject}
        batchType={batchType}
        isSaving={addSubject.isPending || editSubject.isPending}
      />

      {/* Delete Subject Confirm */}
      <AlertDialog
        open={!!deletingSubject}
        onOpenChange={(o) => !o && setDeletingSubject(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Subject?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingSubject?.name}"? All
              associated videos will also be removed. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.subject.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubject}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              data-ocid="admin.subject.delete_button"
            >
              {deleteSubject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete Subject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { token, isVerifying } = useAdminToken();

  if (isVerifying || !token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">
            {isVerifying ? "Verifying admin access..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAdminLogout />

      <main className="flex-1">
        {/* Dashboard Header */}
        <section className="border-b border-border bg-card/50 py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-display font-black text-2xl">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage content for JEE & NEET batches
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dashboard Tabs */}
        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="logo" className="w-full">
            <TabsList className="bg-card border border-border mb-8 h-auto p-1 flex-wrap gap-1">
              <TabsTrigger
                value="logo"
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                data-ocid="admin.logo.tab"
              >
                <Image className="h-4 w-4" />
                Logo
              </TabsTrigger>
              <TabsTrigger
                value="jee"
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                data-ocid="admin.jee.tab"
              >
                <BookOpen className="h-4 w-4" />
                JEE Content
              </TabsTrigger>
              <TabsTrigger
                value="neet"
                className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                data-ocid="admin.neet.tab"
              >
                <FlaskConical className="h-4 w-4" />
                NEET Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logo">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-lg"
              >
                <LogoManager token={token} />
              </motion.div>
            </TabsContent>

            <TabsContent value="jee">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BatchManager batchType="JEE" token={token} />
              </motion.div>
            </TabsContent>

            <TabsContent value="neet">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BatchManager batchType="NEET" token={token} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
}
