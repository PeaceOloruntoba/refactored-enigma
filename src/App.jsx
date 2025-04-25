import React, { Suspense } from "react";
import { Route, Router, Routes } from "react-router";
import { Toaster } from "sonner";

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
            <Route></Route>
          </Routes>
        </Router>
      </Suspense>
    </>
  );
}
