import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import SubmitButton from "../../components/Button/SubmitButton";
import Spinner from "../../components/Spinner/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import type { AxiosError } from "axios";

const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ?? "Login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="login-blob login-blob-1 absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="login-blob login-blob-2 absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="login-blob login-blob-3 absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Brand panel — desktop */}
      <aside className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-12 xl:p-16 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">
              FilSched
            </span>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Schedule smarter,
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              together.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage events, venues, and teams from one collaborative workspace
            built for your organization.
          </p>
          <ul className="space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Event & venue management
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Role-based access for admins & staff
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              Secure, token-based sign-in
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} FilSched · RNL Collaboration
        </p>
      </aside>

      {/* Form panel */}
      {/* Form panel */}
<main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">

  {/* Mobile brand */}
  <div className="lg:hidden mb-10 flex flex-col items-center text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-4">
      {/* icon unchanged */}
    </div>
    <h1 className="text-2xl font-bold tracking-tight text-white">FilSched</h1>
    <p className="mt-1 text-slate-400 text-sm">Sign in to continue</p>
  </div>

  <div className="w-full max-w-[420px]">

    {/* Header */}
    <div className="hidden lg:block mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Welcome back
      </h1>
      <p className="mt-2 text-slate-400 text-sm">
        Enter your credentials to access your workspace.
      </p>
    </div>

    {/* CARD (ENHANCED DARK GLASS) */}
    <div className="
      relative
      rounded-2xl
      border border-white/5
      bg-gradient-to-b from-slate-900/80 to-slate-950/80
      shadow-2xl shadow-black/60
      backdrop-blur-2xl
      p-8
    ">

      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

      <form onSubmit={handleSubmit} className="space-y-5 relative">

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* USERNAME */}
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Username</label>

          <div className="relative">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full
                rounded-xl
                border border-white/5
                bg-slate-950/60
                px-4 py-3 pl-11
                text-white
                placeholder:text-slate-600
                outline-none
                transition
                focus:border-blue-500/50
                focus:ring-2 focus:ring-blue-500/10
              "
              placeholder="Enter your username"
            />

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              👤
            </span>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <label className="text-sm text-slate-300">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                rounded-xl
                border border-white/5
                bg-slate-950/60
                px-4 py-3 pl-11 pr-12
                text-white
                placeholder:text-slate-600
                outline-none
                transition
                focus:border-blue-500/50
                focus:ring-2 focus:ring-blue-500/10
              "
              placeholder="Enter your password"
            />

            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              🔒
            </span>

            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* BUTTON */}
        <SubmitButton
          label="Sign in"
          loading={isSubmitting}
          loadingLabel="Signing in..."
          newClassName="
            w-full
            rounded-xl
            bg-gradient-to-r from-blue-600 to-indigo-600
            px-4 py-3.5
            text-sm font-semibold text-white
            shadow-lg shadow-blue-600/20
            transition
            hover:from-blue-500 hover:to-indigo-500
            hover:shadow-blue-500/30
          "
        />
      </form>
    </div>
  </div>
</main>
    </div>
  );
};

export default LoginPage;
