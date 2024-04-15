"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/firebase-config";
import Login from "@/app/lib/components/Login";
import Navbar from "@/app/lib/components/Navbar";
import { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, userLoading, userError] = useAuthState(auth);

  return (
    <>
      <Navbar user={user} />
      {!user && <Login user={user} loading={userLoading} error={userError} />}
      {user && children}
    </>
  );
}
