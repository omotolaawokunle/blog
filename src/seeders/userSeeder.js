const User = require("../models/User");

const firstNames = [
  "John",
  "Jane",
  "Bob",
  "Alice",
  "Charlie",
  "Emma",
  "Michael",
  "Sarah",
  "David",
  "Lisa",
  "James",
  "Emily",
  "Robert",
  "Maria",
  "William",
  "Jennifer",
  "Richard",
  "Linda",
  "Thomas",
  "Patricia",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
];

const generateUsers = (count = 10) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 19 ? i : ""}@example.com`;

    users.push({
      first_name: firstName,
      last_name: lastName,
      email: email,
      password: "password123",
    });
  }
  return users;
};

const seedUsers = async (count = 10) => {
  try {
    await User.deleteMany({});
    const users = generateUsers(count);
    const createdUsers = await User.create(users);
    console.log(`✓ ${createdUsers.length} users seeded successfully`);
    return createdUsers;
  } catch (error) {
    console.error("Error seeding users:", error.message);
    throw error;
  }
};

module.exports = { seedUsers };
