"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "./session";

export async function logOut(): Promise<void> {
  await deleteSession();
  redirect("/");
}
