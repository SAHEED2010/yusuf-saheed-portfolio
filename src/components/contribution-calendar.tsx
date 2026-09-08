import type { ContributionCalendar } from "@/integrations/github";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// One label per month, positioned on the first week that month appears in.
// Weeks are 7-day columns, so a month boundary rarely lands on a column edge;
// anchoring to the first occurrence keeps the labels aligned with the grid.
function monthLabels(calendar: ContributionCalendar) {
  const labels: { column: number; label: string }[] = [];
  let previousMonth = -1;
  calendar.weeks.forEach((week, index) => {
    const first = week.days[0];
    if (!first) return;
    const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    if (month !== previousMonth) {
      previousMonth = month;
      // Skip a label that would collide with the previous one.
      if (labels.length === 0 || index - labels[labels.length - 1].column >= 3) {
        labels.push({ column: index, label: monthNames[month] });
      }
    }
  });
  return labels;
}

function describe(day: { date: string; count: number }) {
  const readable = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${day.count} contribution${day.count === 1 ? "" : "s"} on ${readable}`;
}

export function ContributionCalendarGrid({ calendar }: { calendar: ContributionCalendar }) {
  const labels = monthLabels(calendar);
  const columns = calendar.weeks.length;

  return (
    <figure className="cal">
      <figcaption className="cal-caption">
        <strong>{calendar.total.toLocaleString("en-GB")}</strong> contributions in the last year
      </figcaption>

      <div className="cal-scroll">
        <div className="cal-inner" style={{ "--cal-columns": columns } as React.CSSProperties}>
          <div className="cal-months" aria-hidden="true">
            {labels.map((label) => (
              <span key={`${label.label}-${label.column}`} style={{ gridColumnStart: label.column + 1 }}>
                {label.label}
              </span>
            ))}
          </div>

          <div className="cal-body">
            <div className="cal-days" aria-hidden="true">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            <div
              className="cal-grid"
              role="img"
              aria-label={`GitHub contribution calendar: ${calendar.total} contributions in the last year`}
            >
              {calendar.weeks.map((week, weekIndex) => (
                <div className="cal-week" key={weekIndex}>
                  {week.days.map((day) => (
                    <span key={day.date} data-level={day.level} title={describe(day)} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cal-legend">
        <span>Less</span>
        <i data-level={0} />
        <i data-level={1} />
        <i data-level={2} />
        <i data-level={3} />
        <i data-level={4} />
        <span>More</span>
      </div>
    </figure>
  );
}
