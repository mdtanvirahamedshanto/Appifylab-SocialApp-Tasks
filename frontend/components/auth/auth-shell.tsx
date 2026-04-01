"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../providers";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

interface AuthShellProps {
  mode: "login" | "register";
}

export function AuthShell({ mode }: AuthShellProps) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && auth.user) {
      router.replace("/feed");
    }
  }, [auth.isLoading, auth.user, router]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    await auth.login(values);
    router.replace("/feed");
  });

  const handleRegister = registerForm.handleSubmit(async (values) => {
    await auth.register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
    router.replace("/feed");
  });

  const isLogin = mode === "login";

  return (
    <section className={isLogin ? "_social_login_wrapper _layout_main_wrapper" : "_social_registration_wrapper _layout_main_wrapper"}>
      <div className="_shape_one">
        <Image src="/buddy-script/assets/images/shape1.svg" alt="" width={160} height={160} className="_shape_img" />
        <Image src="/buddy-script/assets/images/dark_shape.svg" alt="" width={160} height={160} className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <Image src="/buddy-script/assets/images/shape2.svg" alt="" width={160} height={160} className="_shape_img" />
        <Image src="/buddy-script/assets/images/dark_shape1.svg" alt="" width={160} height={160} className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <Image src="/buddy-script/assets/images/shape3.svg" alt="" width={160} height={160} className="_shape_img" />
        <Image src="/buddy-script/assets/images/dark_shape2.svg" alt="" width={160} height={160} className="_dark_shape _dark_shape_opacity" />
      </div>

      <div className={isLogin ? "_social_login_wrap" : "_social_registration_wrap"}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className={isLogin ? "_social_login_left" : "_social_registration_right"}>
                <div className={isLogin ? "_social_login_left_image" : "_social_registration_right_image"}>
                  <Image
                    src={isLogin ? "/buddy-script/assets/images/login.png" : "/buddy-script/assets/images/registration.png"}
                    alt="Auth illustration"
                    width={900}
                    height={900}
                    className={isLogin ? "_left_img" : ""}
                    priority
                  />
                </div>
                {!isLogin ? (
                  <div className="_social_registration_right_image_dark">
                    <Image src="/buddy-script/assets/images/registration1.png" alt="Auth illustration dark" width={900} height={900} />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className={isLogin ? "_social_login_content" : "_social_registration_content"}>
                <div className={isLogin ? "_social_login_left_logo _mar_b28" : "_social_registration_right_logo _mar_b28"}>
                  <Image src="/buddy-script/assets/images/logo.svg" alt="Buddy Script" width={180} height={52} className={isLogin ? "_left_logo" : "_right_logo"} />
                </div>
                <p className={isLogin ? "_social_login_content_para _mar_b8" : "_social_registration_content_para _mar_b8"}>
                  {isLogin ? "Welcome back" : "Get Started Now"}
                </p>
                <h4 className={isLogin ? "_social_login_content_title _titl4 _mar_b50" : "_social_registration_content_title _titl4 _mar_b50"}>
                  {isLogin ? "Login to your account" : "Registration"}
                </h4>

                <button type="button" className={isLogin ? "_social_login_content_btn _mar_b40" : "_social_registration_content_btn _mar_b40"}>
                  <Image src="/buddy-script/assets/images/google.svg" alt="Google" width={22} height={22} className="_google_img" />
                  <span>{isLogin ? "Or sign-in with google" : "Register with google"}</span>
                </button>

                <div className={isLogin ? "_social_login_content_bottom_txt _mar_b40" : "_social_registration_content_bottom_txt _mar_b40"}>
                  <span>Or</span>
                </div>

                {isLogin ? (
                  <form className="_social_login_form" onSubmit={handleLogin}>
                    <div className="row">
                      <div className="col-12">
                        <div className="_social_login_form_input _mar_b14">
                          <label className="_social_login_label _mar_b8">Email</label>
                          <input type="email" className="form-control _social_login_input" {...loginForm.register("email")} />
                          {loginForm.formState.errors.email ? <p className="mt-2 text-sm text-rose-500">{loginForm.formState.errors.email.message}</p> : null}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="_social_login_form_input _mar_b14">
                          <label className="_social_login_label _mar_b8">Password</label>
                          <input type="password" className="form-control _social_login_input" {...loginForm.register("password")} />
                          {loginForm.formState.errors.password ? <p className="mt-2 text-sm text-rose-500">{loginForm.formState.errors.password.message}</p> : null}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                        <div className="_social_login_form_btn _mar_t40 _mar_b60">
                          <button type="submit" className="_social_login_form_btn_link _btn1" disabled={loginForm.formState.isSubmitting}>
                            {loginForm.formState.isSubmitting ? "Signing in..." : "Login now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form className="_social_registration_form" onSubmit={handleRegister}>
                    <div className="row">
                      <div className="col-12">
                        <div className="_social_registration_form_input _mar_b14">
                          <label className="_social_registration_label _mar_b8">First name</label>
                          <input type="text" className="form-control _social_registration_input" {...registerForm.register("firstName")} />
                          {registerForm.formState.errors.firstName ? <p className="mt-2 text-sm text-rose-500">{registerForm.formState.errors.firstName.message}</p> : null}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="_social_registration_form_input _mar_b14">
                          <label className="_social_registration_label _mar_b8">Last name</label>
                          <input type="text" className="form-control _social_registration_input" {...registerForm.register("lastName")} />
                          {registerForm.formState.errors.lastName ? <p className="mt-2 text-sm text-rose-500">{registerForm.formState.errors.lastName.message}</p> : null}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="_social_registration_form_input _mar_b14">
                          <label className="_social_registration_label _mar_b8">Email</label>
                          <input type="email" className="form-control _social_registration_input" {...registerForm.register("email")} />
                          {registerForm.formState.errors.email ? <p className="mt-2 text-sm text-rose-500">{registerForm.formState.errors.email.message}</p> : null}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="_social_registration_form_input _mar_b14">
                          <label className="_social_registration_label _mar_b8">Password</label>
                          <input type="password" className="form-control _social_registration_input" {...registerForm.register("password")} />
                          {registerForm.formState.errors.password ? <p className="mt-2 text-sm text-rose-500">{registerForm.formState.errors.password.message}</p> : null}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="_social_registration_form_input _mar_b14">
                          <label className="_social_registration_label _mar_b8">Confirm password</label>
                          <input type="password" className="form-control _social_registration_input" {...registerForm.register("confirmPassword")} />
                          {registerForm.formState.errors.confirmPassword ? <p className="mt-2 text-sm text-rose-500">{registerForm.formState.errors.confirmPassword.message}</p> : null}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                        <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                          <button type="submit" className="_social_registration_form_btn_link _btn1" disabled={registerForm.formState.isSubmitting}>
                            {registerForm.formState.isSubmitting ? "Creating account..." : "Create account"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                <div className="row">
                  <div className="col-12">
                    <div className={isLogin ? "_social_login_bottom_txt" : "_social_registration_bottom_txt"}>
                      <p className={isLogin ? "_social_login_bottom_txt_para" : "_social_registration_bottom_txt_para"}>
                        {isLogin ? (
                          <>
                            Dont have an account? <Link href="/register">Create New Account</Link>
                          </>
                        ) : (
                          <>
                            Already have an account? <Link href="/login">Login</Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {auth.user ? <p className="mt-4 text-sm text-emerald-600">Signed in as {auth.user.email}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
