import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma.js";

const passwordHash = async (password: string) => bcrypt.hash(password, 12);

async function main() {
  await prisma.like.deleteMany();
  await prisma.reply.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const [alice, ben, cara] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Alice",
        lastName: "Morgan",
        email: "alice@example.com",
        passwordHash: await passwordHash("Password123!"),
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Ben",
        lastName: "Stone",
        email: "ben@example.com",
        passwordHash: await passwordHash("Password123!"),
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Cara",
        lastName: "Lopez",
        email: "cara@example.com",
        passwordHash: await passwordHash("Password123!"),
      },
    }),
  ]);

  const publicPost = await prisma.post.create({
    data: {
      authorId: alice.id,
      content: "Welcome to Buddy Script. This is a public post with a seeded comment thread.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      visibility: "PUBLIC",
    },
  });

  const privatePost = await prisma.post.create({
    data: {
      authorId: alice.id,
      content: "This is a private note visible only to Alice.",
      visibility: "PRIVATE",
    },
  });

  const comment = await prisma.comment.create({
    data: {
      postId: publicPost.id,
      authorId: ben.id,
      content: "Looks good. Nice starting point for the app.",
    },
  });

  const reply = await prisma.reply.create({
    data: {
      commentId: comment.id,
      authorId: cara.id,
      content: "Agreed. The protected feed and nested interactions are in place.",
    },
  });

  await prisma.like.createMany({
    data: [
      { userId: ben.id, type: "POST", postId: publicPost.id },
      { userId: cara.id, type: "POST", postId: publicPost.id },
      { userId: alice.id, type: "COMMENT", commentId: comment.id },
      { userId: alice.id, type: "REPLY", replyId: reply.id },
    ],
  });

  await prisma.post.update({
    where: { id: publicPost.id },
    data: { likeCount: 2, commentCount: 1 },
  });

  await prisma.comment.update({
    where: { id: comment.id },
    data: { likeCount: 1, replyCount: 1 },
  });

  await prisma.reply.update({
    where: { id: reply.id },
    data: { likeCount: 1 },
  });

  console.log("Seed complete", {
    users: [alice.email, ben.email, cara.email],
    publicPost: publicPost.id,
    privatePost: privatePost.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });