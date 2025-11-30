import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isTokenExpired } from "@/lib/jwt";

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("vecna_token")?.value;

  if (token && !isTokenExpired(token)) {
    redirect("/home");
  }

  redirect("/login");
}

