import { publicAppConfig } from "@not-alone/config";
import type { ExperienceSignupSummary } from "../../lib/experience-signups";
import { hasStaffPageAccess, readExperienceSignupSummaries } from "../../lib/live-ops-repository";
import { StaffNav } from "../staff-nav";
import { SignupStatusControl } from "./signup-status-control";

export const dynamic = "force-dynamic";

export default async function SignupsPage() {
  if (!(await hasStaffPageAccess())) return null;
  const canChangeStatus = await hasStaffPageAccess(["PUBLISHER", "ADMIN"]);

  let result: Awaited<ReturnType<typeof readExperienceSignupSummaries>> | undefined;
  let loadError: string | undefined;
  try {
    result = await readExperienceSignupSummaries();
  } catch {
    loadError = "Activation sign-ups could not be loaded from the configured backend.";
  }

  const experiences = result?.experiences ?? [];
  const totals = experiences.reduce(
    (sum, experience) => ({
      confirmed: sum.confirmed + experience.counts.confirmed,
      waitlisted: sum.waitlisted + experience.counts.waitlisted
    }),
    { confirmed: 0, waitlisted: 0 }
  );

  return (
    <main className="shell">
      <StaffNav active="signups" />
      <section className="content">
        <div className="pageHeader">
          <div>
            <div className="kicker">Activation Sign-ups · {result?.mode ?? "unavailable"}</div>
            <h1>Activation headcounts</h1>
            <p className="headerCopy">
              Names attendees entered in the app for activations. Staff-only: these names are never published
              to the app or website. Use counts as estimates; one name is recorded per app install.
            </p>
          </div>
          <div className="badgeGroup">
            <div className="environmentBadge">{publicAppConfig.environmentName}</div>
            {result ? <div className="environmentBadge backendBadge">Revision {result.publishedRevision}</div> : null}
          </div>
        </div>

        {loadError ? <div className="systemNotice warningNotice">{loadError}</div> : null}

        <div className="metricGrid">
          <div className="metric">
            <div className="label">Activations open</div>
            <div className="value">{experiences.filter((experience) => experience.listed).length}</div>
          </div>
          <div className="metric">
            <div className="label">Confirmed</div>
            <div className="value">{totals.confirmed}</div>
          </div>
          <div className="metric">
            <div className="label">Waitlisted</div>
            <div className="value">{totals.waitlisted}</div>
          </div>
        </div>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <div className="label">Per activation</div>
              <h2>Who signed up</h2>
            </div>
          </div>
          <div className="timeline">
            {experiences.length === 0 ? (
              <div className="row">
                <div className="time">No activations</div>
                <div>
                  <div className="title">No activations are in the published schedule.</div>
                </div>
                <div className="badge">Waiting</div>
              </div>
            ) : (
              experiences.map((experience) => (
                <ExperienceRow canChangeStatus={canChangeStatus} experience={experience} key={experience.scheduleItemId} />
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function ExperienceRow({ experience, canChangeStatus }: { experience: ExperienceSignupSummary; canChangeStatus: boolean }) {
  const active = experience.attendees.filter((attendee) => attendee.status !== "cancelled");
  const cancelled = experience.counts.cancelled;

  return (
    <div className="row">
      <div className="time">{formatStart(experience)}</div>
      <div>
        <div className="title">{experience.title}</div>
        {!experience.listed ? (
          <div className="summary">No longer a published activation; existing sign-ups are kept.</div>
        ) : null}
        {active.length > 0 ? (
          <details className="signupDetails">
            <summary>Show {active.length} name{active.length === 1 ? "" : "s"}</summary>
            <ol className="signupList">
              {active.map((attendee) => (
                <li key={attendee.signupId}>
                  <span>{attendee.name}</span>
                  <span className={attendee.status === "waitlisted" ? "badge mutedBadge" : "badge"}>{attendee.status}</span>
                  <span className="signupMeta">{new Date(attendee.createdAt).toLocaleString()}</span>
                  {canChangeStatus ? (
                    <SignupStatusControl signupId={attendee.signupId} status={attendee.status === "waitlisted" ? "waitlisted" : "confirmed"} />
                  ) : null}
                </li>
              ))}
            </ol>
          </details>
        ) : (
          <div className="summary">No sign-ups yet.</div>
        )}
        {cancelled > 0 ? <div className="summary">{cancelled} cancelled</div> : null}
      </div>
      <div className="badgeGroup">
        <div className="badge">{experience.counts.confirmed} confirmed</div>
        <div className="badge mutedBadge">{experience.counts.waitlisted} waitlisted</div>
      </div>
    </div>
  );
}

function formatStart(experience: ExperienceSignupSummary) {
  if (!experience.startUtc) return "Time TBC";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: experience.eventTimeZone ?? undefined,
    timeZoneName: "short"
  }).format(new Date(experience.startUtc));
}
