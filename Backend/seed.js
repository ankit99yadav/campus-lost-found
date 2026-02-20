require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing items (optional - comment out if you want to keep existing data)
    // await Item.deleteMany({});
    // console.log('Cleared existing items');

    // Find or create a test user
    let user = await User.findOne({ email: 'demo@campus.edu' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@campus.edu',
        password: 'DemoPass123', // Will be hashed by the model
        studentId: 'STU001',
        phone: '9999999999',
        hostel: 'Boys Hostel A',
        role: 'user',
      });
      console.log('✅ Created demo user');
    } else {
      console.log('ℹ️ Demo user already exists');
    }

    // Seed demo items
    const demoItems = [
      {
        type: 'lost',
        title: 'Apple AirPods Pro',
        description: 'Lost my white AirPods Pro in the library. Serial number visible on the case.',
        category: 'Electronics',
        color: 'White',
        brand: 'Apple',
        location: { building: 'Central Library', floor: '2nd Floor', area: 'Study Area' },
        dateLostFound: new Date('2026-02-15'),
        timeLostFound: '14:30',
        reportedBy: user._id,
        status: 'approved',
        tokenReward: 0,
        contactPreference: 'chat',
      },
      {
        type: 'found',
        title: 'Silver Watch',
        description: 'Found a nice silver watch near the cafeteria. Has a leather brown strap.',
        category: 'Jewellery',
        color: 'Silver',
        brand: 'Casio',
        location: { building: 'Main Cafeteria', floor: 'Ground', area: 'Seating Area' },
        dateLostFound: new Date('2026-02-18'),
        timeLostFound: '12:45',
        reportedBy: user._id,
        status: 'approved',
        tokenReward: 50,
        contactPreference: 'chat',
      },
      {
        type: 'lost',
        title: 'Red Backpack',
        description: 'Red Decathlon backpack with my laptop inside. Lost near the computer lab.',
        category: 'Bags & Wallets',
        color: 'Red',
        brand: 'Decathlon',
        location: { building: 'Tech Building', floor: '1st Floor', area: 'Computer Lab' },
        dateLostFound: new Date('2026-02-16'),
        timeLostFound: '16:00',
        reportedBy: user._id,
        status: 'approved',
        tokenReward: 0,
        contactPreference: 'email',
      },
      {
        type: 'found',
        title: 'Student ID Card',
        description: 'Found a student ID card near the main gate. Name visible on it.',
        category: 'ID Cards & Documents',
        location: { building: 'Main Gate', area: 'Entrance' },
        dateLostFound: new Date('2026-02-17'),
        reportedBy: user._id,
        status: 'approved',
        tokenReward: 25,
        contactPreference: 'chat',
      },
    ];

    // Check if items already exist to avoid duplicates
    const existingItems = await Item.countDocuments({
      title: { $in: demoItems.map(item => item.title) },
    });

    if (existingItems === 0) {
      await Item.insertMany(demoItems);
      console.log(`✅ Inserted ${demoItems.length} demo items`);
    } else {
      console.log(`ℹ️ Demo items already exist (${existingItems} found)`);
    }

    // Get and display stats
    const stats = await Promise.all([
      Item.countDocuments({ status: 'approved', isActive: true }),
      Item.countDocuments({ status: 'resolved', isActive: true }),
      Item.distinct('reportedBy', { isActive: true }).then(users => users.length),
    ]);

    console.log('\n📊 Current Stats:');
    console.log(`   Total Items (Approved): ${stats[0]}`);
    console.log(`   Resolved Items: ${stats[1]}`);
    console.log(`   Active Users: ${stats[2]}`);

    console.log('\n✅ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
