"use server";

import { z } from "zod";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { loginFormSchema, signUpFormSchema } from "../types";

export async function actionLoginUser({
  email,
  password,
}: z.infer<typeof loginFormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { data: null, error: { message: error.message } };
  }
  return { data, error: null };
}

export async function actionSignUpUser({
  email,
  password,
}: z.infer<typeof loginFormSchema>) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (error) {
    return { error: { message: error.message } };
  }
  if (data?.length) return { error: { message: "User already exists", data } };

  const { data: _data, error: _error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    },
  });
  console.log(_data, _error);
  if (_error) {
    return { data: null, error: { message: _error.message } };
  }
  return { data: _data, error: null };
}
