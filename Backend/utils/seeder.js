const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const connectDB = require('../config/db');

const sampleUsers = [
  {
    name: 'Alex Rivera',
    email: 'alex@example.com',
    password: 'password123',
    age: 26,
    gender: 'male',
    bio: 'Powerlifter and nutrition enthusiast. Looking for a serious training partner!',
    gymName: 'Iron Paradise Gym',
    fitnessLevel: 'advanced',
    fitnessGoals: ['strength', 'muscle gain'],
    workoutTime: 'morning',
    workoutDays: ['monday', 'wednesday', 'friday', 'saturday'],
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    age: 24,
    gender: 'female',
    bio: 'Into HIIT and yoga. Fat loss journey — 6 months and counting! 💪',
    gymName: 'FitZone Studio',
    fitnessLevel: 'intermediate',
    fitnessGoals: ['fat loss', 'flexibility'],
    workoutTime: 'evening',
    workoutDays: ['tuesday', 'thursday', 'saturday', 'sunday'],
    location: { type: 'Point', coordinates: [77.2167, 28.6350] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    password: 'password123',
    age: 29,
    gender: 'male',
    bio: 'Marathon runner and calisthenics lover. Train smart, not just hard.',
    gymName: 'Gold\'s Gym',
    fitnessLevel: 'advanced',
    fitnessGoals: ['endurance', 'general fitness'],
    workoutTime: 'early morning',
    workoutDays: ['monday', 'tuesday', 'thursday', 'friday', 'sunday'],
    location: { type: 'Point', coordinates: [77.2310, 28.6280] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    name: 'Zara Khan',
    email: 'zara@example.com',
    password: 'password123',
    age: 22,
    gender: 'female',
    bio: 'Beginner trying to build a consistent routine. Accountability partner needed!',
    gymName: 'Anytime Fitness',
    fitnessLevel: 'beginner',
    fitnessGoals: ['fat loss', 'general fitness'],
    workoutTime: 'morning',
    workoutDays: ['monday', 'wednesday', 'friday'],
    location: { type: 'Point', coordinates: [77.1950, 28.6020] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
  {
    name: 'Ravi Patel',
    email: 'ravi@example.com',
    password: 'password123',
    age: 31,
    gender: 'male',
    bio: 'Bodybuilder competing in regional shows. Need a dedicated spotter!',
    gymName: 'Iron Paradise Gym',
    fitnessLevel: 'advanced',
    fitnessGoals: ['muscle gain', 'strength'],
    workoutTime: 'evening',
    workoutDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg',
  },
  {
    name: 'Sofia Chen',
    email: 'sofia@example.com',
    password: 'password123',
    age: 27,
    gender: 'female',
    bio: 'CrossFit junkie turned powerlifter. Always looking for PR partners.',
    gymName: 'CrossFit Arena',
    fitnessLevel: 'intermediate',
    fitnessGoals: ['strength', 'muscle gain', 'endurance'],
    workoutTime: 'morning',
    workoutDays: ['tuesday', 'thursday', 'saturday'],
    location: { type: 'Point', coordinates: [77.2240, 28.6490] },
    locationName: 'New Delhi, India',
    profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg',
  },
];

const seedDB = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users (password hashing via pre-save hook)
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Seeded ${createdUsers.length} users`);

    console.log('\n📧 Login credentials:');
    sampleUsers.forEach(u => console.log(`  ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
