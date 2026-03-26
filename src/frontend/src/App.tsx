import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CartSidebar } from "@/components/CartSidebar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { AdminPage } from "@/pages/AdminPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { HomePage } from "@/pages/HomePage";
import { OrderPage } from "@/pages/OrderPage";
import { TrackOrderPage } from "@/pages/TrackOrderPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <CartProvider>
      <AnnouncementBar />
      <Header />
      <CartSidebar />
      <Outlet />
      <Footer />
      <Toaster />
    </CartProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode as string | undefined,
  }),
  component: HomePage,
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order",
  component: OrderPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation",
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: search.orderId as string | undefined,
    trackingId: search.trackingId as string | undefined,
  }),
  component: ConfirmationPage,
});

const trackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/track",
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: search.orderId as string | undefined,
  }),
  component: TrackOrderPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  orderRoute,
  confirmationRoute,
  trackRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
