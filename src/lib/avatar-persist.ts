/**
 * Persist an expiring CDN avatar URL to Supabase Storage.
 * Returns the permanent public URL on success, or the original URL as fallback.
 *
 * Requires Supabase Storage bucket "ugc-assets" with public read access.
 * To create: Dashboard → Storage → New bucket → name: ugc-assets → Public: ON
 */
export async function persistAvatar(
  avatarUrl: string,
  fileName: string // e.g. "tiktok_sell.with.nick.jpg" or "instagram_abbysellss.jpg"
): Promise<string> {
  if (!avatarUrl) return avatarUrl;

  const supabaseUrl = process.env.SUPABASE_CLC_URL;
  const supabaseKey = process.env.SUPABASE_CLC_KEY;
  if (!supabaseUrl || !supabaseKey) return avatarUrl;

  try {
    const imgRes = await fetch(avatarUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
    });
    if (!imgRes.ok) return avatarUrl;

    const buffer = await imgRes.arrayBuffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const storagePath = `avatars/${fileName}.${ext}`;

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/ugc-assets/${storagePath}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: buffer,
      }
    );

    if (uploadRes.ok) {
      return `${supabaseUrl}/storage/v1/object/public/ugc-assets/${storagePath}`;
    }
    return avatarUrl;
  } catch {
    return avatarUrl;
  }
}
