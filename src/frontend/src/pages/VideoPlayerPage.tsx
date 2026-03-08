import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmbedUrl, useSubjectById, useVideoById } from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { motion } from "motion/react";

export default function VideoPlayerPage() {
  const { videoId } = useParams({ from: "/video/$videoId" });
  const id = videoId ? BigInt(videoId) : null;

  const { data: video, isLoading: videoLoading } = useVideoById(id);
  const { data: subject } = useSubjectById(video?.subjectId ?? null);

  const embedUrl = video ? getEmbedUrl(video.videoUrl) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 pt-6 pb-2">
          <Link
            to={subject ? "/subject/$subjectId" : "/"}
            params={subject ? { subjectId: subject.id.toString() } : {}}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.link"
          >
            <ArrowLeft className="h-4 w-4" />
            {subject ? `Back to ${subject.name}` : "Back"}
          </Link>
        </div>

        {videoLoading ? (
          <div
            className="container mx-auto px-4 py-6 space-y-4"
            data-ocid="video.loading_state"
          >
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : !video ? (
          <div
            className="container mx-auto px-4 py-20 text-center"
            data-ocid="video.error_state"
          >
            <h2 className="font-display font-bold text-2xl mb-3">
              Video Not Found
            </h2>
            <p className="text-muted-foreground">
              This video doesn't exist or has been removed.
            </p>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-5xl mx-auto">
              {/* Video Player */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-xl overflow-hidden border border-border bg-black shadow-[0_0_40px_oklch(0.46_0.22_27/0.15)] mb-6"
                data-ocid="video.canvas_target"
              >
                <div className="aspect-video w-full">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={video.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      frameBorder="0"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-full"
                      title={video.title}
                    >
                      <track kind="captions" />
                      <p className="text-center text-muted-foreground p-8">
                        Your browser does not support this video format.{" "}
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Open directly
                        </a>
                      </p>
                    </video>
                  )}
                </div>
              </motion.div>

              {/* Video Info */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Breadcrumb */}
                {subject && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Link
                      to="/batch/$batchType"
                      params={{ batchType: subject.batchType }}
                      className="hover:text-primary transition-colors"
                      data-ocid="nav.link"
                    >
                      {subject.batchType}
                    </Link>
                    <span>/</span>
                    <Link
                      to="/subject/$subjectId"
                      params={{ subjectId: subject.id.toString() }}
                      className="hover:text-primary transition-colors"
                      data-ocid="nav.link"
                    >
                      {subject.name}
                    </Link>
                  </div>
                )}

                <h1 className="font-display font-black text-2xl md:text-3xl mb-3">
                  {video.title}
                </h1>

                {video.description && (
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    {video.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-3">
                  {subject && (
                    <Link
                      to="/subject/$subjectId"
                      params={{ subjectId: subject.id.toString() }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      data-ocid="nav.link"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {subject.name}
                    </Link>
                  )}
                  {!embedUrl && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Original
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
