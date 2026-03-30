import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import type { AnnouncementConfig } from "@/config/announcements";
import { announcementIcon } from "@/config/announcements";

interface AnnouncementDialogProps {
  announcement: AnnouncementConfig;
  open: boolean;
  onDismiss: () => void;
}

export function AnnouncementDialog({
  announcement,
  open,
  onDismiss,
}: AnnouncementDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onDismiss, open]);

  if (!open) {
    return null;
  }

  const HeaderIcon = announcementIcon;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-md">
      <div
        aria-labelledby="announcement-title"
        aria-modal="true"
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/70 bg-stone-50 shadow-[0_40px_120px_rgba(15,23,42,0.28)]"
        role="dialog"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_top_left,rgba(15,23,42,0.16),transparent_28%)]" />

        <div className="relative p-4 sm:p-6">
          <div className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-sm sm:p-6">
            <div className="relative overflow-hidden rounded-[1.5rem] bg-linear-to-br from-slate-900 via-slate-800 to-sky-600 p-6 text-white sm:p-8">
              <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/95 backdrop-blur-sm">
                      <HeaderIcon className="h-4 w-4" />
                      {announcement.badge}
                    </div>
                  </div>

                  <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-white/60">
                    {announcement.title}
                  </p>
                  <h2
                    id="announcement-title"
                    className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                  >
                    {announcement.headline}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                    {announcement.description}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={onDismiss}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close announcement</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.75fr_0.95fr]">
              <div className="grid gap-4 sm:grid-cols-2">
                {announcement.features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="group rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition-colors hover:border-sky-200"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700 transition-colors group-hover:bg-sky-50 group-hover:text-sky-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-semibold tracking-tight text-slate-950">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-7 text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {announcement.comingSoon ? (
                <aside className="rounded-[1.5rem] border border-slate-200 bg-linear-to-b from-slate-50 to-slate-100/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                    Preview
                  </p>
                  <h3 className="mb-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {announcement.comingSoon.title}
                  </h3>
                  <p className="mb-5 text-sm leading-6 text-slate-600">
                    The next major update will add request tracking and
                    lifecycle actions.
                  </p>
                  <ul className="space-y-3">
                    {announcement.comingSoon.items.map((item) => {
                      const ItemIcon = item.icon;

                      return (
                        <li
                          key={item.label}
                          className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/90 px-4 py-3.5 text-sm leading-6 text-slate-700 shadow-sm"
                        >
                          <span className="inline-flex shrink-0 rounded-xl bg-slate-100 p-2 text-slate-600">
                            <ItemIcon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </aside>
              ) : null}
            </div>
            <div className="mt-6 flex items-center justify-end">
              <Button
                className="min-w-36 bg-slate-900 px-6 text-white hover:bg-slate-800"
                onClick={onDismiss}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
