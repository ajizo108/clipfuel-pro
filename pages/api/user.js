import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token || !token.email) {
      return res.status(401).json({ isPro: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
    });

    return res.status(200).json({
      isPro: user?.isPro || false,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ isPro: false });
  }
}