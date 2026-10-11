import { useId } from "react";
import { RoleLines } from "./role-lines";
import type { DirectoryGroup } from "../lib/content";
import styles from "./people-directory.module.css";

export function PeopleDirectory({ groups, tone = "light" }: { groups: DirectoryGroup[]; tone?: "light" | "dark" }) {
  const id = useId();
  return (
    <div className={`archive-directory archive-directory-${tone} ${styles.directory}${tone === "dark" ? ` ${styles.dark}` : ""}`}>
      {groups.map((group, groupIndex) => (
        <section className="directory-group" key={`${group.title}-${groupIndex}`} aria-labelledby={`${id}-${groupIndex}`}>
          <header>
            {group.people.length > 0 ? <span aria-label={`${group.people.length} entries`}>{String(group.people.length).padStart(2, "0")}</span> : null}
            <h2 id={`${id}-${groupIndex}`}>{group.title}</h2>
          </header>
          {group.people.length > 0 ? (
            <div className="directory-grid">
              {group.people.map((person, index) => (
                <article key={`${group.title}-${person.name}-${index}`}>
                  <h3>{person.name}</h3>
                  {person.role.trim() && <p><RoleLines text={person.role} /></p>}
                </article>
              ))}
            </div>
          ) : <p>No entries in this archived section.</p>}
        </section>
      ))}
    </div>
  );
}
