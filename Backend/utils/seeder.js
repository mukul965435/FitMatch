const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const connectDB = require('../config/db');

const names = [
  'Alex Rivera', 'Priya Sharma', 'Marcus Johnson', 'Zara Khan', 'Ravi Patel', 'Sofia Chen',
  'Liam Smith', 'Emma Wilson', 'Noah Brown', 'Olivia Davis', 'Hassan Ali', 'Mei Ling',
  'Carlos Garcia', 'Sarah Miller', 'Ryan Cooper', 'Anaya Gupta', 'Lucas White', 'Chloe Martin',
  'Ethan Hunt', 'Mia Wallace', 'Arjun Varma', 'Elena Petrova', 'Kabir Singh', 'Isabella Root',
  'Daniel Kim', 'Amara Okafor'
];

const fitnessGoals = ['strength', 'muscle gain', 'fat loss', 'flexibility', 'endurance', 'general fitness'];
const fitnessLevels = ['beginner', 'intermediate', 'advanced'];
const workoutTimes = ['morning', 'afternoon', 'evening', 'night', 'flexible'];
const workoutDaysOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const sampleUsers = names.map((name, i) => {
  const level = fitnessLevels[i % 3];
  const goals = [fitnessGoals[i % 6], fitnessGoals[(i + 2) % 6]];
  const time = workoutTimes[i % 5];
  const days = workoutDaysOptions.slice(0, (i % 4) + 3);
  const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
  
  // Spread users around New Delhi slightly
  const lat = 28.6139 + (Math.random() - 0.5) * 0.1;
  const lng = 77.2090 + (Math.random() - 0.5) * 0.1;

  // Generate some sample activities
  const activities = [
    {
      type: 'workout',
      description: i % 2 === 0 ? `Hit a new PR on ${level === 'advanced' ? 'squats' : 'pushups'}! 🏋️‍♂️` : `Finished a great ${goals[0]} session. Feeling energized! 🔥`,
      createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7) // random time in last 7 days
    },
    {
      type: 'nutrition',
      description: `Meal prep Sunday! Ready for a week of ${goals[1]} focus. 🍱`,
      createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7)
    }
  ];

  return {
    name,
    email,
    password: 'password123',
    age: 20 + (i % 15),
    gender: i % 2 === 0 ? 'male' : 'female',
    bio: `Passion for ${goals[0]} and ${goals[1]}. Let's crush our goals together!`,
    gymName: i % 3 === 0 ? 'Iron Paradise' : i % 3 === 1 ? 'Gold\'s Gym' : 'FitZone',
    fitnessLevel: level,
    fitnessGoals: goals,
    workoutTime: time,
    workoutDays: days,
    location: { type: 'Point', coordinates: [lng, lat] },
    locationName: 'New Delhi NCR',
    profilePicture: `https://i.pravatar.cc/150?u=${email}`,
    activities
  }
});

const seedDB = async () => {
  await connectDB();

  try {
    // We clear because discovery query depends on index consistency
    // To keep the current user, we could find it then restore it, but for seeding 
    // it's usually better to just wipe it to avoid duplicates.
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users (password hashing via pre-save hook)
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Seeded ${createdUsers.length} users with activities!`);

    console.log('\n📧 Sample Login (Password: password123):');
    console.log(`  ${sampleUsers[0].email}`);
    console.log(`  ${sampleUsers[5].email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
