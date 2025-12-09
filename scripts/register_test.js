import 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import authService from '../services/authService.js';

const run = async () => {
  try {
    await connectDatabase();

    const testUser = {
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'TestPass!23'
    };

    const created = await authService.registerUser(testUser);
    console.log('Created user:', created);
    process.exit(0);
  } catch (err) {
    console.error('Error creating user:', err.message || err);
    process.exit(1);
  }
};

run();
