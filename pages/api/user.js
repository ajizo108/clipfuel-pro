import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token || !token.email) {
      return res.status(401).json({ isPro: false });
    }

    // TEMP: no database yet
    return res.status(200).json({
      isPro: false,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ isPro: false });
  }
}