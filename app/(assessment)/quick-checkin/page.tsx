import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";

// The ~3-minute path: WHO-5 + PERMA-Profiler only, no Saati Insights. See
// components/assessment/AssessmentFlow.tsx for why this drops the Insight
// modules specifically rather than shortening either Validated Measure.
export default function QuickCheckinPage() {
  return <AssessmentFlow variant="quick" />;
}
