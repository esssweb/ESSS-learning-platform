// auth layout
"use client";

import "../globals.css"; 
import { Provider } from "react-redux";
import { store } from "@/store/store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-Tertiary">
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
