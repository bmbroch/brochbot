"use client";

export default function SlideV() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10 gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full tracking-wider"
            style={{ background: "#fdf0ec", color: "#e78468", border: "1px solid #f5c8b8" }}
          >
            LIVE DATA
          </span>
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          Viralytics
        </h2>
        <p className="mt-3 text-xl text-gray-500 font-medium">
          UGC analytics SaaS — built and launched in the last 30 days
        </p>
      </div>

      {/* Datafast widget */}
      <div
        className="w-full rounded-2xl overflow-hidden shadow-sm"
        style={{
          maxWidth: 860,
          border: "1.5px solid #f1f5f9",
          background: "#ffffff",
        }}
      >
        <iframe
          src="https://datafa.st/widgets/69a60fd63f5608460df2e1eb/recent?mainTextSize=16&primaryColor=%23e78468&theme=light"
          style={{
            background: "transparent",
            border: "none",
            width: "100%",
            height: 400,
          }}
          frameBorder={0}
          allowTransparency={true}
          title="Viralytics — Live Analytics"
          loading="lazy"
        />
      </div>

      <p className="text-sm text-gray-400 font-medium">
        Powered by Datafast · updates in real time
      </p>
    </div>
  );
}
