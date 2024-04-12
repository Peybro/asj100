"use client";

import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/firebase-config";
import Login from "@/app/lib/components/Login";
import Navbar from "@/app/lib/components/Navbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, loading, error] = useAuthState(auth);

  return (
    <>
      <Navbar user={user} />

      {!user && <Login />}

      {user && children}
    </>
  );
}
