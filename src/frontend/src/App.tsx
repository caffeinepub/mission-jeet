import { Toaster } from "@/components/ui/sonner";
import {
  Link,
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import BatchPage from "./pages/BatchPage";
import LandingPage from "./pages/LandingPage";
import SubjectPage from "./pages/SubjectPage";
import VideoPlayerPage from "./pages/VideoPlayerPage";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4 text-center">
      <div className="font-display font-black text-7xl text-primary">404</div>
      <h1 className="font-display font-bold text-2xl">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-2 px-6 py-3 bg-primary text-white font-display font-bold rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="dark" position="top-right" />
    </>
  ),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const batchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/batch/$batchType",
  component: BatchPage,
});

const subjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subject/$subjectId",
  component: SubjectPage,
});

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/video/$videoId",
  component: VideoPlayerPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  batchRoute,
  subjectRoute,
  videoRoute,
  adminLoginRoute,
  adminRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
