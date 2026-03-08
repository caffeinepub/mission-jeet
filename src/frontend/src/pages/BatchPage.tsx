import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjectsByBatch } from "@/hooks/useQueries";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Play,
} from "lucide-react";
import { motion } from "motion/react";

const batchConfig = {
  JEE: {
    label: "JEE",
    fullName: "Joint Entrance Examination",
    icon: BookOpen,
    description: "Physics, Chemistry & Mathematics for IIT/NIT/IIIT aspirants",
    gradient: "from-primary/20 to-transparent",
    borderColor: "border-primary/30",
    hoverBorder: "hover:border-primary/60",
    tagColor: "bg-primary/10 text-primary",
  },
  NEET: {
    label: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    icon: FlaskConical,
    description: "Physics, Chemistry & Biology for MBBS/BDS aspirants",
    gradient: "from-[oklch(0.38_0.18_27)]/20 to-transparent",
    borderColor: "border-[oklch(0.40_0.18_27)]/30",
    hoverBorder: "hover:border-[oklch(0.40_0.18_27)]/60",
    tagColor: "bg-[oklch(0.30_0.15_27)] text-[oklch(0.85_0.12_27)]",
  },
};

export default function BatchPage() {
  const { batchType } = useParams({ from: "/batch/$batchType" });
  const batch =
    batchType && batchType in batchConfig
      ? batchConfig[batchType as keyof typeof batchConfig]
      : null;

  const {
    data: subjects,
    isLoading,
    isError,
  } = useSubjectsByBatch(batchType || "");

  const Icon = batch?.icon || BookOpen;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Batch Header */}
        <section className="relative border-b border-border overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${batch?.gradient}`}
          />
          <div className="absolute inset-0 grid-pattern opacity-20" />
          <div className="relative container mx-auto px-4 py-12 md:py-16">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              data-ocid="nav.link"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${batch?.tagColor}`}
                >
                  {batchType} Batch
                </div>
                <h1 className="font-display font-black text-3xl md:text-4xl mb-2">
                  {batch?.fullName || batchType}
                </h1>
                <p className="text-muted-foreground">{batch?.description}</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-7">
            <h2 className="font-display font-bold text-xl">
              Subjects{" "}
              {subjects && (
                <span className="text-muted-foreground font-normal text-base ml-1">
                  ({subjects.length})
                </span>
              )}
            </h2>
          </div>

          {isLoading && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-ocid="batch.loading_state"
            >
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
                <Skeleton key={key} className="h-36 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-16" data-ocid="batch.error_state">
              <p className="text-destructive">
                Failed to load subjects. Please try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && subjects?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-border rounded-xl"
              data-ocid="batch.empty_state"
            >
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-display font-bold text-lg mb-2">
                No Subjects Yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Content for {batchType} will be available soon.
              </p>
            </motion.div>
          )}

          {!isLoading && !isError && subjects && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects
                .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder))
                .map((subject, i) => (
                  <motion.div
                    key={subject.id.toString()}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    data-ocid={`batch.item.${i + 1}`}
                  >
                    <Link
                      to="/subject/$subjectId"
                      params={{ subjectId: subject.id.toString() }}
                    >
                      <motion.div
                        whileHover={{ y: -3 }}
                        className={`group relative bg-card rounded-xl border ${batch?.borderColor} ${batch?.hoverBorder} p-6 transition-all duration-300 hover:shadow-red-sm`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-display font-bold text-lg mb-1 truncate">
                              {subject.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {batchType} Subject
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors mt-1">
                            <Play className="h-5 w-5 fill-current opacity-70" />
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
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
