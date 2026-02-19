// /calendar is superseded by /automations (which includes daily timeline + weekly grid + all job cards)
// Redirect to /automations so old links don't 404.
import { redirect } from "next/navigation";

export default function CalendarRedirect() {
  redirect("/automations");
}
