import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, handle any duplicate emails in Client table
  const clientRecords = await prisma.client.findMany({
    select: {
      id: true,
      email: true,
    },
  });

  // Group by email to find duplicates
  const emailGroups = clientRecords.reduce(
    (acc, client) => {
      if (!acc[client.email]) {
        acc[client.email] = [];
      }
      acc[client.email].push(client);
      return acc;
    },
    {} as Record<string, typeof clientRecords>
  );

  // Keep only the first client for each email
  for (const [, clients] of Object.entries(emailGroups)) {
    if (clients.length > 1) {
      const [keep, ...remove] = clients;
      await prisma.client.deleteMany({
        where: {
          id: {
            in: remove.map((c) => c.id),
          },
        },
      });
    }
  }

  // Handle duplicate refCodes
  const users = await prisma.user.findMany({
    select: {
      id: true,
      refCode: true,
    },
    where: {
      refCode: {
        not: null,
      },
    },
  });

  // Group by refCode to find duplicates
  const refCodeGroups = users.reduce(
    (acc, user) => {
      if (!user.refCode) return acc;
      if (!acc[user.refCode]) {
        acc[user.refCode] = [];
      }
      acc[user.refCode].push(user);
      return acc;
    },
    {} as Record<string, typeof users>
  );

  // Keep only the first user for each refCode
  for (const [, users] of Object.entries(refCodeGroups)) {
    if (users.length > 1) {
      const [keep, ...remove] = users;
      await prisma.user.updateMany({
        where: {
          id: {
            in: remove.map((u) => u.id),
          },
        },
        data: {
          refCode: null,
        },
      });
    }
  }

  // Set roles based on existing data
  // If user has clients, they are a trainer
  const trainers = await prisma.user.findMany({
    where: {
      clients: {
        some: {},
      },
    },
  });

  await prisma.user.updateMany({
    where: {
      id: {
        in: trainers.map((t) => t.id),
      },
    },
    data: {
      role: 'trainer',
    },
  });

  // If user is linked to a trainer as a client, they are a client
  const clientUsers = await prisma.client.findMany({
    select: {
      userId: true,
    },
  });

  await prisma.user.updateMany({
    where: {
      id: {
        in: clientUsers.map((c) => c.userId),
      },
    },
    data: {
      role: 'client',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
