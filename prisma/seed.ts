import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a couple user
  const coupleUser = await prisma.user.create({
    data: {
      email: 'couple@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'COUPLE',
      isVerified: true,
      coupleProfile: {
        create: {
          partnerName: 'Jane Smith',
          weddingDate: new Date('2025-06-15'),
          budget: 50000,
          guestCount: 150,
          location: 'Los Angeles, CA',
        },
      },
    },
  });

  // Create a planner user
  const plannerUser = await prisma.user.create({
    data: {
      email: 'planner@example.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Parker',
      role: 'PLANNER',
      isVerified: true,
      plannerProfile: {
        create: {
          company: 'Dream Weddings Planning',
          bio: 'Professional wedding planner with 10+ years of experience',
          yearsExperience: 10,
          rating: 4.8,
          reviewCount: 45,
          priceRange: '$2,000 - $5,000',
        },
      },
    },
  });

  // Create vendor users
  const photographerUser = await prisma.user.create({
    data: {
      email: 'photographer@example.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'VENDOR',
      isVerified: true,
      vendorProfile: {
        create: {
          businessName: 'Perfect Moments Photography',
          category: 'PHOTOGRAPHER',
          description: 'Capturing your special moments with artistic vision',
          serviceArea: ['Los Angeles', 'Orange County', 'San Diego'],
          priceRange: '$2,500 - $5,000',
          rating: 4.9,
          reviewCount: 78,
          website: 'https://perfectmoments.com',
        },
      },
    },
  });

  const venueUser = await prisma.user.create({
    data: {
      email: 'venue@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'VENDOR',
      isVerified: true,
      vendorProfile: {
        create: {
          businessName: 'Sunset Garden Estate',
          category: 'VENUE',
          description: 'Beautiful garden estate perfect for outdoor weddings',
          serviceArea: ['Los Angeles', 'Beverly Hills'],
          priceRange: '$8,000 - $15,000',
          rating: 4.7,
          reviewCount: 92,
        },
      },
    },
  });

  // Create a sample event
  const event = await prisma.event.create({
    data: {
      userId: coupleUser.id,
      name: 'John & Jane\'s Wedding',
      type: 'Wedding',
      date: new Date('2025-06-15'),
      time: '4:00 PM',
      venue: 'Sunset Garden Estate',
      venueAddress: '123 Garden Lane, Los Angeles, CA 90210',
      budget: 50000,
      guestCount: 150,
      description: 'A beautiful outdoor wedding celebration',
      websiteSlug: 'john-and-jane-2025',
      websiteEnabled: true,
      partner1Name: 'John Doe',
      partner2Name: 'Jane Smith',
      coupleStory: 'We met in college and have been together for 5 wonderful years...',
      isPublic: false,
    },
  });

  // Create sample guests
  const guests = await prisma.guest.createMany({
    data: [
      {
        eventId: event.id,
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        category: 'Family',
        rsvpStatus: 'ATTENDING',
        plusOne: true,
        plusOneName: 'Alice Smith',
      },
      {
        eventId: event.id,
        firstName: 'Carol',
        lastName: 'Johnson',
        email: 'carol@example.com',
        category: 'Friends',
        rsvpStatus: 'PENDING',
      },
    ],
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        eventId: event.id,
        title: 'Book wedding venue',
        description: 'Reserve the Sunset Garden Estate',
        dueDate: new Date('2025-01-15'),
        priority: 'HIGH',
        status: 'COMPLETED',
        category: 'Venue',
      },
      {
        eventId: event.id,
        title: 'Send invitations',
        description: 'Mail wedding invitations to all guests',
        dueDate: new Date('2025-04-01'),
        priority: 'HIGH',
        status: 'TODO',
        category: 'Invitations',
      },
      {
        eventId: event.id,
        title: 'Book photographer',
        description: 'Confirm photographer for the big day',
        dueDate: new Date('2025-02-01'),
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        category: 'Photography',
      },
    ],
  });

  // Create sample expenses
  await prisma.expense.createMany({
    data: [
      {
        eventId: event.id,
        name: 'Venue rental',
        category: 'Venue',
        estimatedCost: 12000,
        actualCost: 12000,
        paidAmount: 6000,
        status: 'PENDING',
        vendor: 'Sunset Garden Estate',
      },
      {
        eventId: event.id,
        name: 'Photography package',
        category: 'Photography',
        estimatedCost: 3500,
        status: 'PLANNED',
        vendor: 'Perfect Moments Photography',
      },
      {
        eventId: event.id,
        name: 'Catering',
        category: 'Food & Beverage',
        estimatedCost: 8500,
        status: 'PLANNED',
      },
    ],
  });

  // Create sample checklist items
  await prisma.checklistItem.createMany({
    data: [
      {
        eventId: event.id,
        title: 'Set wedding date',
        category: '12+ months before',
        isCompleted: true,
        order: 1,
      },
      {
        eventId: event.id,
        title: 'Create budget',
        category: '12+ months before',
        isCompleted: true,
        order: 2,
      },
      {
        eventId: event.id,
        title: 'Book venue',
        category: '9-11 months before',
        isCompleted: true,
        order: 3,
      },
      {
        eventId: event.id,
        title: 'Hire photographer',
        category: '9-11 months before',
        isCompleted: false,
        order: 4,
      },
      {
        eventId: event.id,
        title: 'Choose wedding party',
        category: '6-8 months before',
        isCompleted: false,
        order: 5,
      },
    ],
  });

  // Create sample timeline
  await prisma.timelineItem.createMany({
    data: [
      {
        eventId: event.id,
        title: 'Guest arrival',
        time: '3:30 PM',
        duration: 30,
        order: 1,
      },
      {
        eventId: event.id,
        title: 'Ceremony',
        description: 'Wedding ceremony in the garden',
        time: '4:00 PM',
        duration: 30,
        order: 2,
      },
      {
        eventId: event.id,
        title: 'Cocktail hour',
        time: '4:30 PM',
        duration: 60,
        order: 3,
      },
      {
        eventId: event.id,
        title: 'Reception',
        description: 'Dinner and dancing',
        time: '5:30 PM',
        duration: 240,
        order: 4,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('\nSample login credentials:');
  console.log('Couple: couple@example.com / password123');
  console.log('Planner: planner@example.com / password123');
  console.log('Photographer: photographer@example.com / password123');
  console.log('Venue: venue@example.com / password123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
