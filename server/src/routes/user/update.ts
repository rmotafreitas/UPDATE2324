import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../lib/prisma";

export const updateUser = async (app: FastifyInstance) => {
  app.post("/user/wishlist", async (request, reply) => {
    // @ts-expect-error
    const userId = request.userID;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const bodySchema = z.object({
      wishList: z.string().optional(),
      email: z.string().email().optional(),
      subscribedToNewsletter: z.boolean().optional(),
    });

    const { wishList, email, subscribedToNewsletter } = bodySchema.parse(
      request.body
    );

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      if (!email) {
        throw new Error("Email is required");
      }
      const newUser = await prisma.user.create({
        data: {
          id: userId as string,
          wishList: wishList ?? "",
          email: email,
          subscribedToNewsletter: subscribedToNewsletter ?? false,
        },
      });
      return newUser;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        wishList: wishList ?? user.wishList,
        email: email ?? user.email,
        subscribedToNewsletter:
          subscribedToNewsletter ?? user.subscribedToNewsletter,
      },
    });

    return updatedUser;
  });
};
