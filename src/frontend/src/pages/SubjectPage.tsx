import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjectById, useVideosBySubject } from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Clock, Play, Video } from "lucide-react";
import { motion } from "motion/react";

function formatTimeAgo(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000; // nanoseconds to ms
  const diff = Date.now() - ms;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

export default function SubjectPage() {
  const { subjectId } = useParams({ from: "/subject/$subjectId" });
  const id = subjectId ? BigInt(subjectId) : null;

  const { data: subject, isLoading: subjectLoading } = useSubjectById(id);
  const {
    data: videos,
    isLoading: videosLoading,
    isError,
  } = useVideosBySubject(id);

  const isLoading = subjectLoading || videosLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Subject Header */}
        <section className="relative border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative container mx-auto px-4 py-10 md:py-14">
            <Link
              to={subject ? "/batch/$batchType" : "/"}
              params={subject ? { batchType: subject.batchType } : {}}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-ocid="nav.link"
            >
              <ArrowLeft className="h-4 w-4" />
              {subject ? `Back to ${subject.batchType}` : "Back"}
            </Link>

            {subjectLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-64" />
              </div>
            ) : subject ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-primary/10 text-primary">
                    {subject.batchType}
                  </div>
                  <h1 className="font-display font-black text-3xl md:text-4xl">
                    {subject.name}
                  </h1>
                </div>
              </motion.div>
            ) : (
              <h1 className="font-display font-black text-3xl text-muted-foreground">
                Subject Not Found
              </h1>
            )}
          </div>
        </section>

        {/* Videos List */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-display font-bold text-xl">
              Video Lectures{" "}
              {videos && (
                <span className="text-muted-foreground font-normal text-base ml-1">
                  ({videos.length})
                </span>
              )}
            </h2>
          </div>

          {isLoading && (
            <div className="space-y-4" data-ocid="subject.loading_state">
              {["v1", "v2", "v3", "v4", "v5"].map((key) => (
                <Skeleton key={key} className="h-24 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-16" data-ocid="subject.error_state">
              <p className="text-destructive">
                Failed to load videos. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && videos?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border rounded-xl"
              data-ocid="subject.empty_state"
            >
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-display font-bold text-lg mb-2">
                No Videos Yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Videos for this subject will be available soon.
              </p>
            </motion.div>
          )}

          {!isLoading && !isError && videos && videos.length > 0 && (
            <div className="space-y-3">
              {videos
                .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
                .map((video, i) => (
                  <motion.div
                    key={video.id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    data-ocid={`subject.item.${i + 1}`}
                  >
                    <Link
                      to="/video/$videoId"
                      params={{ videoId: video.id.toString() }}
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="group flex items-center gap-4 bg-card rounded-xl border border-border hover:border-primary/40 p-4 transition-all duration-200"
                      >
                        {/* Index */}
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="font-display font-black text-primary text-lg">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(video.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:shadow-red-sm transition-all duration-200">
                            <Play className="h-4 w-4 text-primary fill-current group-hover:text-white transition-colors ml-0.5" />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
