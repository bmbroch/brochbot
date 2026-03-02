"use client";

const CORAL = "#FF5A5F";

const CARDS = [
  {
    icon: "🖥️",
    title: "VPS Server",
    subtitle: "Hostinger or DigitalOcean",
    price: "$6/mo",
  },
  {
    icon: "🤖",
    title: "Claude Max",
    subtitle: "Best AI reasoning",
    price: "$20/mo",
  },
  {
    icon: "🐾",
    title: "OpenClaw",
    subtitle: "The glue layer",
    price: "Free",
  },
];

export default function Slide3() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 gap-10">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-5xl font-bold tracking-tight text-gray-900">
          How I set it up
        </h2>
      </div>

      {/* Cards */}
      <div className="flex gap-6 w-full max-w-3xl">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-start gap-3 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl">{card.icon}</div>
            <div>
              <div className="font-bold text-gray-900 text-xl">{card.title}</div>
              <div className="text-gray-500 text-sm mt-1">{card.subtitle}</div>
            </div>
            <div
              className="mt-auto text-2xl font-bold"
              style={{ color: CORAL }}
            >
              {card.price}
            </div>
          </div>
        ))}
      </div>

      {/* Total line */}
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-xl"
          style={{ background: CORAL, color: "#fff" }}
        >
          <span>=</span>
          <span>$26/month. 10 agents. Always on.</span>
        </div>
        <p className="text-sm text-gray-400 text-center max-w-sm mt-2">
          Or swap Claude for DeepSeek → ~$5/mo. 80% of the performance.
        </p>
        <a
          href="https://openclawai.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm mt-1 hover:underline"
          style={{ color: CORAL }}
          onClick={(e) => e.stopPropagation()}
        >
          openclawai.com →
        </a>
      </div>
    </div>
  );
}
