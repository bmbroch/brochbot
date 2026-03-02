"use client";

import { useEffect, useState } from "react";

const BEN_MSG =
  "hey sam im making a 10 minute ppt presentation on openclaw and how im using it. should be super basic and i can include screenshots from brochbot.com and other places. I want to emphasize what it is and how its different from chatgpt. how to get setup with some easy directions like hostinger etc and also how you power it...based on a claude subscription or with a chinese model thats much cheaper but a little stupider. Any chance you can create a webpage for a slide deck?";

const SAM_MSG = "Yeah — let me take a look and I'll build it out. Give me a few minutes.";

export default function Slide1() {
  const [show, setShow] = useState(0);

  useEffect(() => {
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
    <div className="flex flex-col items-center justify-center h-full px-8 py-6 gap-5">
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
        {/* Mr. Brightside cheeky homage */}
        <p className="mt-2 text-sm italic text-gray-400 tracking-wide">
          how did it end up like this
        </p>
      </div>

      {/* Telegram chat bubble UI */}
      <div
        style={{
          opacity: show >= 1 ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
          width: "100%",
          maxWidth: 740,
        }}
        className="rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        role="presentation"
      >
        {/* Chat header */}
        <div
          style={{ background: "#17212b", borderBottom: "1px solid #2b3a4a" }}
          className="flex items-center gap-3 px-5 py-3"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "#FF5A5F", color: "#fff" }}
          >
            S
          </div>
          <div>
            <div className="text-white font-semibold text-base leading-tight">Sam 🤝</div>
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
          style={{ background: "#0e1621" }}
          className="flex flex-col gap-4 px-5 py-5"
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
            <div className="max-w-[80%] flex flex-col items-end gap-1">
              <div
                className="text-base px-5 py-4 rounded-2xl rounded-tr-sm leading-relaxed"
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
            className="flex justify-start items-start pb-1"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-1 flex-shrink-0"
              style={{ background: "#FF5A5F", color: "#fff" }}
            >
              S
            </div>
            <div className="max-w-[75%] flex flex-col items-start gap-1">
              <div
                className="text-base px-5 py-4 rounded-2xl rounded-tl-sm leading-relaxed"
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
