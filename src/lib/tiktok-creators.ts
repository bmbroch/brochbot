export interface Creator {
  name: string;
  handle: string | null;       // TikTok handle (without @)
  igHandle: string | null;     // Instagram handle (without @)
}

export const TIKTOK_CREATORS: Creator[] = [
  { name: "Nick",    handle: "sell.with.nick",  igHandle: "sell.with.nick"    },
  { name: "Luke",    handle: "_lukesells",       igHandle: "_lukesells"         },
  { name: "Abby",    handle: "abbysellsss",      igHandle: "abbysellss"         },
  { name: "Jake",    handle: "jake_sells0",      igHandle: "jake.sells0"        },
  { name: "Bobby",   handle: "bobby.salesguy",   igHandle: "bobby.salesecho"    },
  { name: "Sheryl",  handle: "sher_sells",       igHandle: "sher_sells"         },
  { name: "Flo",     handle: "sophiesellss",     igHandle: "sophiesellss"       },
  { name: "Griffin", handle: "griffn.sells",     igHandle: "griffin.sells"      },
];
