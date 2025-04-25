import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Suspense
        fallback={
          <p className="w-screen h-screen flex items-center justify-center text-2xl font-semibold text-center">
            Loading...
          </p>
        }
      >
        <Router>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route path="" element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </Suspense>
    </>
  );
}
