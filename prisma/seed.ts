import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean DB
  await prisma.auditLog.deleteMany();
  await prisma.incidentUpdate.deleteMany();
  await prisma.incidentService.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.service.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Create User
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Demo Admin',
      email: 'demo@demo.com',
      passwordHash,
    },
  });
  console.log('Created user demo@demo.com / demo1234');

  // Create Org
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Inc',
      slug: 'acme',
    },
  });
  console.log('Created organization: Acme Inc');

  // Create Membership (OWNER)
  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: 'owner',
    },
  });

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'API Gateway',
        description: 'External routing gateway for backend microservices APIs.',
        status: 'operational',
        sortOrder: 1,
        orgId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Web Application',
        description: 'User dashboard client application interface portals.',
        status: 'degraded',
        sortOrder: 2,
        orgId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Database Cluster',
        description: 'Highly available PostgreSQL storage clusters.',
        status: 'operational',
        sortOrder: 3,
        orgId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'CDN Portal',
        description: 'Edge static assets content delivery network caching gateways.',
        status: 'maintenance',
        sortOrder: 4,
        orgId: org.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Auth Service',
        description: 'Internal authentication server and session verifiers.',
        status: 'operational',
        sortOrder: 5,
        orgId: org.id,
      },
    }),
  ]);
  console.log('Created 5 services');

  // Create Active Incident
  const incident1 = await prisma.incident.create({
    data: {
      title: 'Web Application Latency Degradation',
      status: 'investigating',
      impact: 'minor',
      orgId: org.id,
      authorId: user.id,
    },
  });

  // Link services to Active Incident
  await prisma.incidentService.create({
    data: {
      incidentId: incident1.id,
      serviceId: services[1].id, // Web Application
    },
  });

  // Create Update for Active Incident
  await prisma.incidentUpdate.create({
    data: {
      body: 'We are investigating reports of slow page loading times and timeouts on the web dashboard client portal.',
      status: 'investigating',
      incidentId: incident1.id,
      authorId: user.id,
    },
  });

  // Create Resolved Incident
  const incident2 = await prisma.incident.create({
    data: {
      title: 'Database Connection Dropouts',
      status: 'resolved',
      impact: 'major',
      orgId: org.id,
      authorId: user.id,
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Resolved 2 hours ago
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // Created 4 hours ago
    },
  });

  // Link services to Resolved Incident
  await prisma.incidentService.create({
    data: {
      incidentId: incident2.id,
      serviceId: services[2].id, // Database Cluster
    },
  });

  // Create Updates for Resolved Incident
  await prisma.incidentUpdate.createMany({
    data: [
      {
        body: 'We are experiencing connection dropouts on the database cluster resulting in 500 errors on API requests.',
        status: 'investigating',
        incidentId: incident2.id,
        authorId: user.id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        body: 'The database primary node has failed over successfully. We are monitoring performance metrics.',
        status: 'monitoring',
        incidentId: incident2.id,
        authorId: user.id,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        body: 'Failover is stable and connection rates have returned to normal baseline values. The incident is resolved.',
        status: 'resolved',
        incidentId: incident2.id,
        authorId: user.id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
  });

  // Create some audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'create',
        entityType: 'service',
        entityId: services[0].id,
        metadata: JSON.stringify({ name: services[0].name }),
        userId: user.id,
        orgId: org.id,
      },
      {
        action: 'create',
        entityType: 'service',
        entityId: services[1].id,
        metadata: JSON.stringify({ name: services[1].name }),
        userId: user.id,
        orgId: org.id,
      },
      {
        action: 'status_change',
        entityType: 'service',
        entityId: services[1].id,
        metadata: JSON.stringify({ name: services[1].name, status: 'degraded' }),
        userId: user.id,
        orgId: org.id,
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
