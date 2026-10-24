import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { loginErrorMessage } from "@/lib/site-gate/messages";
import { LOGIN_NEXT_FIELD, LOGIN_PASSWORD_FIELD, safeNextPath } from "@/lib/site-gate/paths";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap";

/** Arabic copy for the login screen. Fixed sentences only; never interpolate input. */
const AR_ERRORS: Record<string, string> = {
  wrong: "كلمة المرور غير صحيحة",
  rate: "محاولات كثيرة، انتظر دقيقة وحاول مرة ثانية",
  config: "الموقع غير مهيأ بعد",
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    e: typeof search.e === "string" ? search.e : undefined,
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [{ title: "بريد صُحبة · الدخول" }],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONT_HREF },
    ],
  }),
  component: LoginPage,
});

const LOGIN_CSS = `
.gbm-login{
  --l-bg:#f6f1e8; --l-bg-2:#efe7da; --l-card:rgba(255,253,249,.86); --l-ink:#2b2f2c;
  --l-muted:#727a72; --l-line:#e3dccf; --l-field:#fbf8f3; --l-accent:#5f8a7e; --l-accent-2:#4d776c;
  --l-accent-soft:rgba(95,138,126,.14); --l-danger:#a65a4e; --l-danger-bg:rgba(166,90,78,.08);
  --l-blob-a:rgba(143,175,160,.32); --l-blob-b:rgba(222,196,160,.38);
  --l-shadow:0 1px 2px rgba(60,52,40,.04),0 12px 40px -12px rgba(60,52,40,.16);
  font-family:"IBM Plex Sans Arabic",-apple-system,"SF Arabic","Geeza Pro","Segoe UI","Noto Sans Arabic",Tahoma,sans-serif;
  color:var(--l-ink);
  background:radial-gradient(120% 80% at 100% 0%,var(--l-bg-2),transparent 60%),var(--l-bg);
}
@media (prefers-color-scheme: dark){
  .gbm-login{
    --l-bg:#151a19; --l-bg-2:#1b2422; --l-card:rgba(30,37,35,.82); --l-ink:#e8e6df;
    --l-muted:#9aa49e; --l-line:#2e3835; --l-field:#18201e; --l-accent:#86b3a5; --l-accent-2:#9cc4b7;
    --l-accent-soft:rgba(134,179,165,.16); --l-danger:#e0a195; --l-danger-bg:rgba(224,161,149,.1);
    --l-blob-a:rgba(98,140,126,.22); --l-blob-b:rgba(160,132,96,.14);
    --l-shadow:0 1px 2px rgba(0,0,0,.2),0 16px 48px -16px rgba(0,0,0,.6);
  }
}
:where(.dark,.dim) .gbm-login{
  --l-bg:#151a19; --l-bg-2:#1b2422; --l-card:rgba(30,37,35,.82); --l-ink:#e8e6df;
  --l-muted:#9aa49e; --l-line:#2e3835; --l-field:#18201e; --l-accent:#86b3a5; --l-accent-2:#9cc4b7;
  --l-accent-soft:rgba(134,179,165,.16); --l-danger:#e0a195; --l-danger-bg:rgba(224,161,149,.1);
  --l-blob-a:rgba(98,140,126,.22); --l-blob-b:rgba(160,132,96,.14);
  --l-shadow:0 1px 2px rgba(0,0,0,.2),0 16px 48px -16px rgba(0,0,0,.6);
}
.gbm-login .gbm-blob{position:absolute;border-radius:9999px;filter:blur(48px);pointer-events:none}
.gbm-login .gbm-card{background:var(--l-card);box-shadow:var(--l-shadow);border:1px solid var(--l-line);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.gbm-login .gbm-field{background:var(--l-field);border:1px solid var(--l-line);color:var(--l-ink);
  transition:border-color .2s,box-shadow .2s}
.gbm-login .gbm-field::placeholder{color:var(--l-muted);opacity:.8}
.gbm-login .gbm-field:focus{border-color:var(--l-accent);box-shadow:0 0 0 4px var(--l-accent-soft);outline:none}
.gbm-login .gbm-btn{background:var(--l-accent);color:#fff;transition:background .2s,transform .1s}
.gbm-login .gbm-btn:hover{background:var(--l-accent-2)}
.gbm-login .gbm-btn:active{transform:scale(.985)}
:where(.dark,.dim) .gbm-login .gbm-btn{color:#10201b}
@media (prefers-color-scheme: dark){.gbm-login .gbm-btn{color:#10201b}}
.gbm-login .gbm-btn:focus-visible,.gbm-login .gbm-eye:focus-visible{outline:2px solid var(--l-accent);outline-offset:2px}
`;

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7.5 8 5.5 8-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      {open ? null : <path d="M4 20 20 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

function LoginPage() {
  const { e, next } = Route.useSearch();
  // loginErrorMessage keeps the set of known codes; we only show Arabic for those.
  const error = loginErrorMessage(e) && e ? (AR_ERRORS[e] ?? null) : null;
  const back = safeNextPath(next);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const prev = { lang: root.lang, dir: root.dir };
    root.lang = "ar";
    root.dir = "rtl";
    return () => {
      root.lang = prev.lang;
      root.dir = prev.dir;
    };
  }, []);

  return (
    <main
      dir="rtl"
      lang="ar"
      className="gbm-login relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5"
      style={{
        paddingTop: "max(2.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: LOGIN_CSS }} />
      <div
        className="gbm-blob -z-10 h-72 w-72"
        style={{ background: "var(--l-blob-a)", top: "-4rem", insetInlineStart: "-5rem" }}
      />
      <div
        className="gbm-blob -z-10 h-80 w-80"
        style={{ background: "var(--l-blob-b)", bottom: "-6rem", insetInlineEnd: "-6rem" }}
      />

      <div className="w-full max-w-[400px]">
        <div className="gbm-card rounded-[28px] px-6 pb-7 pt-9 sm:px-8">
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ background: "var(--l-accent-soft)", color: "var(--l-accent)" }}
            >
              <MailIcon />
            </div>
            <h1 className="mt-5 text-[28px] font-bold leading-[1.3]">بريد صُحبة</h1>
            <p className="mt-2 text-[16px] leading-7" style={{ color: "var(--l-muted)" }}>
              أدخل كلمة المرور للدخول إلى بريدك
            </p>
          </div>

          <form className="mt-8" method="post" action="/login">
            {back ? <input type="hidden" name={LOGIN_NEXT_FIELD} value={back} /> : null}
            <label htmlFor="gbm-password" className="sr-only">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="gbm-password"
                name={LOGIN_PASSWORD_FIELD}
                type={show ? "text" : "password"}
                autoComplete="current-password"
                autoFocus
                required
                placeholder="كلمة المرور"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "gbm-error" : undefined}
                className="gbm-field h-14 w-full rounded-2xl pe-14 ps-4 text-[17px]"
                style={error ? { borderColor: "var(--l-danger)" } : undefined}
              />
              <button
                type="button"
                className="gbm-eye absolute inset-y-0 end-1 my-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ color: "var(--l-muted)" }}
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                aria-pressed={show}
              >
                <EyeIcon open={show} />
              </button>
            </div>

            {error ? (
              <p
                id="gbm-error"
                role="alert"
                className="mt-3 rounded-xl px-4 py-3 text-[15px] leading-6"
                style={{ color: "var(--l-danger)", background: "var(--l-danger-bg)" }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="gbm-btn mt-5 h-14 w-full rounded-2xl text-[17px] font-semibold"
            >
              دخول
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[13px] leading-5" style={{ color: "var(--l-muted)" }}>
          <span dir="ltr">sohba@mail.grokbot.com</span>
        </p>
      </div>
    </main>
  );
}
