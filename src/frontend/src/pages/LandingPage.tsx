import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useLogoUrl } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { label: "Students Enrolled", value: "50,000+" },
  { label: "Video Lectures", value: "2,000+" },
  { label: "Success Rate", value: "94%" },
  { label: "Expert Faculty", value: "120+" },
];

const features = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description:
      "Meticulously crafted syllabus aligned with JEE & NEET patterns",
  },
  {
    icon: FlaskConical,
    title: "Expert Faculty",
    description:
      "Learn from IIT/AIIMS alumni with decades of teaching experience",
  },
  {
    icon: Target,
    title: "Topic-wise Videos",
    description:
      "Deep-dive lectures organized by subject and topic for focused learning",
  },
  {
    icon: Zap,
    title: "On-Demand Access",
    description: "Watch lectures anytime, anywhere — no schedule constraints",
  },
];

export default function LandingPage() {
  const { data: logoUrl } = useLogoUrl();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex-1 overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/generated/hero-bg.dim_1920x1080.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-background/85" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo & Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              {logoUrl && logoUrl.trim() !== "" ? (
                <img
                  src={logoUrl}
                  alt="Mission Jeet"
                  className="h-24 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src="/assets/generated/mission-jeet-logo-transparent.dim_200x200.png"
                    alt="Mission Jeet Logo"
                    className="h-20 w-20 object-contain"
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-4">
                <span className="text-foreground">MISSION</span>
                <br />
                <span
                  className="text-primary"
                  style={{ textShadow: "0 0 40px oklch(0.46 0.22 27 / 0.5)" }}
                >
                  JEET
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2 font-body">
                India's Premier Video Lecture Platform for JEE & NEET Aspirants
              </p>
              <p className="text-sm text-accent font-semibold tracking-wider uppercase mb-10">
                जीत की ओर एक कदम
              </p>
            </motion.div>

            {/* Batch Selector Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              {/* JEE Button */}
              <Link
                to="/batch/$batchType"
                params={{ batchType: "JEE" }}
                data-ocid="landing.jee_button"
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-72 sm:w-64"
                >
                  <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg group-hover:bg-primary/30 transition-all duration-300" />
                  <div className="relative flex items-center justify-between bg-primary rounded-xl px-6 py-5 border border-primary/50 shadow-[0_0_25px_oklch(0.46_0.22_27/0.3)]">
                    <div className="text-left">
                      <div className="font-display font-black text-3xl text-white tracking-tight">
                        JEE
                      </div>
                      <div className="text-white/80 text-sm font-medium">
                        Engineering Entrance
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BookOpen className="h-8 w-8 text-white/80" />
                      <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* NEET Button */}
              <Link
                to="/batch/$batchType"
                params={{ batchType: "NEET" }}
                data-ocid="landing.neet_button"
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative w-72 sm:w-64"
                >
                  <div className="absolute inset-0 rounded-xl bg-[oklch(0.38_0.18_27)]/20 blur-lg group-hover:bg-[oklch(0.38_0.18_27)]/30 transition-all duration-300" />
                  <div className="relative flex items-center justify-between bg-[oklch(0.30_0.15_27)] rounded-xl px-6 py-5 border border-[oklch(0.40_0.18_27)/50] shadow-[0_0_25px_oklch(0.38_0.18_27/0.3)]">
                    <div className="text-left">
                      <div className="font-display font-black text-3xl text-white tracking-tight">
                        NEET
                      </div>
                      <div className="text-white/80 text-sm font-medium">
                        Medical Entrance
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <FlaskConical className="h-8 w-8 text-white/80" />
                      <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display font-black text-3xl md:text-4xl text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-black text-3xl md:text-4xl mb-3">
              Why <span className="text-primary">Mission Jeet?</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to crack JEE & NEET in one place
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-card rounded-xl border border-border p-6 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/3 transition-all duration-300" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 stripe-pattern" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="h-12 w-12 text-accent mx-auto mb-4" />
            <h2 className="font-display font-black text-3xl md:text-4xl mb-4">
              Ready to <span className="text-primary">Achieve</span> Your Goal?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of students who turned their dream into reality
              with Mission Jeet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/batch/$batchType"
                params={{ batchType: "JEE" }}
                data-ocid="landing.jee_button"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-primary text-white font-display font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-red-sm flex items-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Start JEE Prep
                </motion.button>
              </Link>
              <Link
                to="/batch/$batchType"
                params={{ batchType: "NEET" }}
                data-ocid="landing.neet_button"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-[oklch(0.30_0.15_27)] text-white font-display font-bold rounded-lg hover:bg-[oklch(0.35_0.17_27)] transition-colors flex items-center gap-2 border border-[oklch(0.40_0.18_27)/50]"
                >
                  <FlaskConical className="h-5 w-5" />
                  Start NEET Prep
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
