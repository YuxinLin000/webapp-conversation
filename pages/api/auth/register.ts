import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        console.log('Starting to process registration request');
        console.log('Request body:', req.body);

        const { db } = await connectToDatabase();
        console.log('Database connection successful');

        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await db.collection('users').findOne({ $or: [{ username }, { email }] });
        console.log('Checking existing user:', existingUser);

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashing completed');

        const result = await db.collection('users').insertOne({
            username,
            password: hashedPassword,
            email,
            createdAt: new Date(),
        });
        console.log('User created successfully:', result.insertedId);

        res.status(201).json({ message: 'User registration successful', userId: result.insertedId });
    } catch (error) {
        console.error('Error occurred during registration:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Server error, please try again later', error: error.message });
        } else {
            res.status(500).json({ message: 'Server error, please try again later' });
        }
    }
}
