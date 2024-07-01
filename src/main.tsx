import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout.tsx";
import MainPage from "./pages/MainPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import { loader as mainPageLoader } from "./pages/MainPage.tsx";

const router = createBrowserRouter([
  {
    path: "",
    element: <RootLayout />,
    errorElement: (
      <RootLayout>
        <ErrorPage />
      </RootLayout>
    ),
    children: [
      {
        path: "/",
        id: "root",
        element: <MainPage />,
        loader: mainPageLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
