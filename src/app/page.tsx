import { getMatchesByDate } from "@/api";
import Image from "next/image";
import Status from "./components/Status";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedDate = resolvedSearchParams.date || new Date().toLocaleDateString("sv");

  const getDatas = await getMatchesByDate(selectedDate);
  const matchesDatas = getDatas?.matches || [];
  const errorStatus = getDatas?.error;

  // Use midday to prevent timezone off-by-one errors
  const dateConvert = new Date(selectedDate + "T12:00:00").toDateString();

  if (errorStatus === 429) {
    return (
      <section className="px-2 md:px-4 md:w-[600px] w-full space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-md md:text-xl font-bold">MATCHES</h1>
          <div className="px-4 py-1 bg-slate-600 rounded-md text-textPrimary text-sm">
            <p>{dateConvert}</p>
          </div>
        </div>
        <div className="w-full p-6 text-center bg-[rgb(40,46,58)] rounded-2xl border border-amber-500/30 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-amber-400 mb-1">Rate Limit Exceeded (429)</h2>
          <p className="text-slate-300 text-sm">
            The API has rate-limited our requests (free keys are limited to 10 calls per minute).
          </p>
          <p className="text-xs text-slate-500 mt-3">
            Please wait 10-15 seconds and refresh the page to try again.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-2 md:px-4 md:w-[600px] w-full">
      <div className="flex justify-between items-center mb-4 md:mb-2">
        <h1 className="text-md md:text-xl font-bold">MATCHES</h1>
        <div className="px-4 py-1 bg-slate-600 rounded-md text-textPrimary text-sm">
          <p>{dateConvert}</p>
        </div>
      </div>

      <Status matchesList={matchesDatas} matchesListFinished={[]} />
    </section>
  );
}
