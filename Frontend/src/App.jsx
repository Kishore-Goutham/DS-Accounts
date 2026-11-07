import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { AppLayout } from "./components/layout/AppLayout.jsx";

// Lazy-load pages so each ships as its own chunk. The Dashboard's chart
// libraries (recharts / @mantine/charts) only download when you open it.
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx"));
const RecordsPage = lazy(() => import("./pages/RecordsPage.jsx"));

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<Center py="xl"><Loader /></Center>}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
