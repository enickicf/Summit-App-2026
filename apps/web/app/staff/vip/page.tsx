import { redirect } from "next/navigation";

// Owner (Oct 1, 2026): VIP RSVPs are back in the one staff portal (stronger password), listed first.
export default function VipPage() {
  redirect("/staff#vip");
}
