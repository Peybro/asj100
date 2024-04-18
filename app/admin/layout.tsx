"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase-config";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, userLoading, userError] = useAuthState(auth);

  return (
    <>
      <Navbar user={user} />
      {!user && <Login user={user} loading={userLoading} error={userError} />}
      {user && children}
    </>
  );
}
