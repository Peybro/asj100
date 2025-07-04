import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { ReactNode } from "react";

import "./globals.scss";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "10 Jahre Abi",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="yel">
      <body className={`${inter.className} container mb-10`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
