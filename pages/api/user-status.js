import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();
if (!global.prisma) global.prisma = prisma;

export default async function handler(req, res) {
  try {
    const token = await getToken({ req });

    if (!token?.email) {
      return res.status(401).json({ isPro: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email },
    });

    console.log("DB USER:", user);

    return res.status(200).json({
      isPro: user?.isPro ?? false,
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ isPro: false });
  }
}