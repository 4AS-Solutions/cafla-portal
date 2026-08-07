"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Loader2,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/alert-dialog";
import { Button } from "../../ui/button";

type AssessmentStatus =
  | "draft"
  | "published"
  | "closed"
  | "archived";

type LifecycleAction = "close" | "archive";

type AssessmentLifecycleControlsProps = {
  assessmentId: string;
  status: AssessmentStatus;
};

type LifecycleResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export function AssessmentLifecycleControls({
  assessmentId,
  status,
}: AssessmentLifecycleControlsProps) {
  const router = useRouter();

  const [pendingAction, setPendingAction] =
    useState<LifecycleAction | null>(null);

  const runLifecycleAction = async (
    action: LifecycleAction
  ) => {
    setPendingAction(action);

    try {
      const response = await fetch(
        `/api/admin/quizzes/${assessmentId}/lifecycle`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const result =
        (await response.json()) as LifecycleResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            `Unable to ${action} the assessment.`
        );
      }

      toast.success(
        result.message ??
          (action === "close"
            ? "Assessment closed successfully."
            : "Assessment archived successfully.")
      );

      router.refresh();
    } catch (error) {
      console.error(
        "[ASSESSMENT LIFECYCLE] Request failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the assessment lifecycle."
      );
    } finally {
      setPendingAction(null);
    }
  };

  if (status === "published") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={pendingAction !== null}
            className="
              border-amber-500/20
              bg-amber-500/[0.06]
              text-amber-300
              hover:border-amber-500/30
              hover:bg-amber-500/[0.1]
              hover:text-amber-200
            "
          >
            <LockKeyhole className="mr-2 size-4" />
            Close Assessment
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent
          className="
            max-w-lg
            overflow-hidden
            border-white/10
            bg-[#07110e]
            p-0
            text-white
            shadow-2xl
          "
        >
          {/* HEADER */}
          <div
            className="
              border-b border-amber-500/15
              bg-amber-500/[0.035]
              px-6 py-5
            "
          >
            <AlertDialogHeader className="text-left">
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex size-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-amber-500/20
                    bg-amber-500/10
                  "
                >
                  <LockKeyhole className="size-5 text-amber-400" />
                </div>

                <div>
                  <p
                    className="
                      mb-1 text-[11px]
                      font-semibold uppercase
                      tracking-[0.18em]
                      text-amber-400
                    "
                  >
                    Assessment Lifecycle
                  </p>

                  <AlertDialogTitle className="text-base font-semibold text-white">
                    Close this assessment?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="mt-1 text-sm leading-6 text-gray-400">
                    Members will no longer be able to begin
                    new attempts.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          {/* BODY */}
          <div className="px-6 py-5">
            <div
              className="
                flex gap-3 rounded-xl
                border border-white/10
                bg-white/[0.025]
                p-4
              "
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />

              <div>
                <p className="text-sm font-medium text-gray-200">
                  What happens when you close it?
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  New attempts will be disabled. Existing
                  attempts, submissions, scores, and historical
                  results will remain preserved.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <AlertDialogFooter
            className="
              border-t border-white/10
              bg-black/10
              px-6 py-4
            "
          >
            <AlertDialogCancel
              disabled={pendingAction !== null}
              className="
                border-white/10
                bg-white/[0.04]
                text-gray-300
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={pendingAction !== null}
              onClick={() =>
                runLifecycleAction("close")
              }
              className="
                bg-amber-500
                text-black
                hover:bg-amber-400
              "
            >
              {pendingAction === "close" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 size-4" />
                  Close Assessment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "closed") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={pendingAction !== null}
            className="
              border-white/10
              bg-white/[0.03]
              text-gray-300
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            <Archive className="mr-2 size-4" />
            Archive Assessment
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent
          className="
            max-w-lg
            overflow-hidden
            border-white/10
            bg-[#07110e]
            p-0
            text-white
            shadow-2xl
          "
        >
          <div
            className="
              border-b border-emerald-500/15
              bg-emerald-500/[0.035]
              px-6 py-5
            "
          >
            <AlertDialogHeader className="text-left">
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex size-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-emerald-500/20
                    bg-emerald-500/10
                  "
                >
                  <Archive className="size-5 text-emerald-400" />
                </div>

                <div>
                  <p
                    className="
                      mb-1 text-[11px]
                      font-semibold uppercase
                      tracking-[0.18em]
                      text-emerald-400
                    "
                  >
                    Assessment Lifecycle
                  </p>

                  <AlertDialogTitle className="text-base font-semibold text-white">
                    Archive this assessment?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="mt-1 text-sm leading-6 text-gray-400">
                    The assessment will leave normal active
                    management views.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>
          </div>

          <div className="px-6 py-5">
            <div
              className="
                flex gap-3 rounded-xl
                border border-white/10
                bg-white/[0.025]
                p-4
              "
            >
              <ArchiveRestore className="mt-0.5 size-4 shrink-0 text-emerald-400" />

              <div>
                <p className="text-sm font-medium text-gray-200">
                  Your data will not be deleted
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Questions, attempts, submissions, scores, and
                  historical information will remain stored for
                  administrative records.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter
            className="
              border-t border-white/10
              bg-black/10
              px-6 py-4
            "
          >
            <AlertDialogCancel
              disabled={pendingAction !== null}
              className="
                border-white/10
                bg-white/[0.04]
                text-gray-300
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={pendingAction !== null}
              onClick={() =>
                runLifecycleAction("archive")
              }
              className="
                bg-emerald-500
                text-black
                hover:bg-emerald-400
              "
            >
              {pendingAction === "archive" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                <>
                  <Archive className="mr-2 size-4" />
                  Archive Assessment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === "archived") {
    return (
      <div
        className="
          flex items-start gap-3 rounded-xl
          border border-white/10
          bg-white/[0.025]
          p-4
        "
      >
        <Archive className="mt-0.5 size-4 shrink-0 text-gray-500" />

        <div>
          <p className="text-sm font-medium text-gray-300">
            Assessment archived
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Historical data remains available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-gray-400">
      Publish this assessment before lifecycle controls become
      available.
    </p>
  );
}