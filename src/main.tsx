import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout.tsx";
import MainPage, { loader as mainPageLoader } from "./pages/MainPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/fetch.ts";
import ProductsPage from "./pages/ProductsPage.tsx";
import { Provider } from "react-redux";
import store from "./store/index.ts";

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
      {
        path: "/products",
        element: <ProductsPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
