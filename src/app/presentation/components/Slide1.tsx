"use client";

import { useEffect, useState } from "react";

const BEN_MSG =
  "hey sam im making a 10 minute ppt presentation on openclaw and how im using it. should be super basic and i can include screenshots from brochbot.com and other places. I want to emphasize what it is and how its different from chatgpt. how to get setup with some easy directions like hostinger etc and also how you power it...based on a claude subscription or with a chinese model thats much cheaper but a little stupider. Any chance you'd be able to edit a google slide if i gave you access?";

const SAM_MSG = "Yeah — let me take a look and I'll build it out. Give me a few minutes.";

export default function Slide1() {
  const [show, setShow] = useState(0);

  useEffect(() => {
    // Step 0 = nothing, 1 = header, 2 = Ben msg, 3 = Sam msg
    setShow(0);
    const t1 = setTimeout(() => setShow(1), 300);
    const t2 = setTimeout(() => setShow(2), 800);
    const t3 = setTimeout(() => setShow(3), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-12 gap-10">
      {/* Heading */}
      <div
        style={{
          opacity: show >= 1 ? 1 : 0,
          transform: show >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          It started out with a text
        </h1>
      </div>

      {/* Telegram chat bubble UI */}
      <div
        style={{
          opacity: show >= 1 ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
          width: "100%",
          maxWidth: 600,
        }}
        className="rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        role="presentation"
      >
        {/* Chat header */}
        <div
          style={{ background: "#17212b", borderBottom: "1px solid #2b3a4a" }}
          className="flex items-center gap-3 px-4 py-3"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ background: "#FF5A5F", color: "#fff" }}
          >
            S
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Sam 🤝</div>
            <div className="text-xs" style={{ color: "#6b8a9e" }}>
              Chief of Staff
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 opacity-70" />
          </div>
        </div>

        {/* Messages area */}
        <div
          style={{ background: "#0e1621", minHeight: 220 }}
          className="flex flex-col gap-3 px-4 py-4"
        >
          {/* Ben message (right) */}
          <div
            style={{
              opacity: show >= 2 ? 1 : 0,
              transform: show >= 2 ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
            className="flex justify-end"
          >
            <div className="max-w-[78%] flex flex-col items-end gap-1">
              <div
                className="text-sm px-4 py-3 rounded-2xl rounded-tr-sm leading-relaxed"
                style={{ background: "#2b5278", color: "#e8f1f8" }}
              >
                {BEN_MSG}
              </div>
              <div className="text-xs pr-1" style={{ color: "#6b8a9e" }}>
                5:45 PM&nbsp;
                <span style={{ color: "#4da6d9" }}>✓✓</span>
              </div>
            </div>
          </div>

          {/* Sam message (left) */}
          <div
            style={{
              opacity: show >= 3 ? 1 : 0,
              transform: show >= 3 ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
            className="flex justify-start"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0" style={{ background: "#FF5A5F", color: "#fff" }}>
              S
            </div>
            <div className="max-w-[72%] flex flex-col items-start gap-1">
              <div
                className="text-sm px-4 py-3 rounded-2xl rounded-tl-sm leading-relaxed"
                style={{ background: "#182533", color: "#e8f1f8" }}
              >
                {SAM_MSG}
              </div>
              <div className="text-xs pl-1" style={{ color: "#6b8a9e" }}>
                5:46 PM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
