import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import "./index.css";
import RootLayout from "./pages/RootLayout.tsx";
import MainPage from "./pages/MainPage.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import { queryClient } from "./lib/fetch.ts";
import ProductsPage, {
  loader as ProductsPageLoader,
} from "./pages/ProductsPage.tsx";
import store from "./store/index.ts";
import ProductPage, {
  loader as productPageLoader,
} from "./pages/ProductPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import VerifyEmailPage, {
  loader as VerifyEmailPageLoader,
  action as VerifyEmailPageAction,
} from "./pages/VerifyEmailPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import UserPanelPage from "./pages/UserPanelPage.tsx";
import { loader as userPanelLoader } from "./pages/UserPanelPage.tsx";
import OrderPage, { loader as orderPageLoader } from "./pages/OrderPage.tsx";

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
      {
        path: "verify-email",
        element: <VerifyEmailPage />,
        loader: VerifyEmailPageLoader,
        action: VerifyEmailPageAction,
      },
      { path: "cart", element: <CartPage /> },
      { path: "user", element: <UserPanelPage />, loader: userPanelLoader },
      {
        path: "order",
        element: <OrderPage />,
        loader: orderPageLoader,
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
