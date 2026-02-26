"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "org" | "creators";

interface ParsedCreator {
  name: string;
  tiktokHandle: string | null;
  igHandle: string | null;
}

function parseCreatorUrls(text: string): ParsedCreator[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const ttMatch = line.match(/tiktok\.com\/@([\w.]+)/i);
      const igMatch = line.match(/instagram\.com\/([\w.]+)/i);
      if (ttMatch)
        return [{ name: ttMatch[1], tiktokHandle: ttMatch[1], igHandle: null }];
      if (igMatch)
        return [{ name: igMatch[1], tiktokHandle: null, igHandle: igMatch[1] }];
      return [] as ParsedCreator[];
    });
}

const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="9" width="3" height="6" rx="1" fill="white" />
        <rect x="6" y="5" width="3" height="10" rx="1" fill="white" />
        <rect x="11" y="1" width="3" height="14" rx="1" fill="white" />
      </svg>
    </div>
    <span className="font-semibold text-gray-900">UGC Analytics</span>
  </div>
);

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default function OnboardingPage() {
  const router = useRouter();

  // State machine
  const [step, setStep] = useState<Step>("org");
  const [orgName, setOrgName] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [creatorsText, setCreatorsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parsedCreators = parseCreatorUrls(creatorsText);
  const creatorCount = parsedCreators.length;

  // Step 1: save org, advance to step 2
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError("Please enter an organization name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ugc/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setOrgId(data.id ?? null);
      setLoading(false);
      setStep("creators");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Step 2: save creators, redirect to /ugc
  const handleCreatorsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatorCount === 0) return;
    setError("");
    setLoading(true);

    try {
      await Promise.all(
        parsedCreators.map((c) =>
          fetch("/api/ugc/creators", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: c.name,
              tiktok_handle: c.tiktokHandle,
              ig_handle: c.igHandle,
              status: "active",
              sync_hour: 8,
              org_id: orgId,
            }),
          })
        )
      );

      router.push("/ugc");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const stepNumber = step === "org" ? 1 : 2;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Logo />

      {/* Step indicator */}
      <p className="text-xs text-gray-400 mb-4 tracking-wide uppercase font-medium">
        Step {stepNumber} of 2
      </p>

      {/* ── STEP 1: Create Org ── */}
      {step === "org" && (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Create Your Organization
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Set up your workspace to start tracking UGC creators across TikTok
              and Instagram.
            </p>
          </div>

          <form onSubmit={handleOrgSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="org-name"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. SalesEcho"
                disabled={loading}
                className="w-full text-lg px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white text-gray-900 placeholder-gray-400 disabled:opacity-60"
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-base transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                "Continue →"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── STEP 2: Add Creators ── */}
      {step === "creators" && (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Add Your Creators
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Paste TikTok or Instagram profile URLs, one per line.
            </p>
          </div>

          <form onSubmit={handleCreatorsSubmit} className="space-y-4">
            <textarea
              value={creatorsText}
              onChange={(e) => {
                setCreatorsText(e.target.value);
                if (error) setError("");
              }}
              placeholder={"Paste profile URLs here, one per line...\ne.g. https://www.tiktok.com/@nick\n     https://www.instagram.com/abbysells"}
              disabled={loading}
              className="w-full h-48 sm:h-64 font-mono text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white text-gray-900 placeholder-gray-400 disabled:opacity-60 resize-none"
            />

            {/* Parsed pill preview */}
            {parsedCreators.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-400 font-medium">Parsed:</span>
                {parsedCreators.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 font-medium"
                  >
                    @{c.name}{" "}
                    <span className="text-gray-400">
                      {c.tiktokHandle ? "TikTok" : "Instagram"}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || creatorCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl text-base transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  `Track ${creatorCount} Creator${creatorCount !== 1 ? "s" : ""} →`
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
