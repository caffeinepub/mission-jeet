import { Toaster } from "@/components/ui/sonner";
import {
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

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="dark" position="top-right" />
    </>
  ),
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
