import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout.tsx";
import MainPage from "./pages/MainPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/fetch.ts";
import ProductsPage, {
  loader as ProductsPageLoader,
} from "./pages/ProductsPage.tsx";
import { Provider } from "react-redux";
import store from "./store/index.ts";
import ProductPage, {
  loader as productPageLoader,
} from "./pages/ProductPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";

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
      },
      {
        path: "products",
        element: <ProductsPage />,
        loader: ProductsPageLoader,
      },
      {
        path: "products/:productSlug",
        element: <ProductPage />,
        loader: productPageLoader,
      },
      { path: "register", element: <RegisterPage /> },
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
