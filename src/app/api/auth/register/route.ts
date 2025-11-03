import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface User {
  username: string;
  password: string;
  role: string;
  anon_id: string;
  dept: string;
  year?: number;
}

interface UsersData {
  users: User[];
}

function generateAnonId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ANON-${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, dept, year } = await request.json();

    if (!username || !password || !dept) {
      return NextResponse.json(
        { error: 'Username, password, and department are required' },
        { status: 400 }
      );
    }

    // Read sample accounts
    const dataPath = path.join(process.cwd(), 'data', 'sample_accounts.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const usersData: UsersData = JSON.parse(fileContents);

    // Check if username already exists
    const existingUser = usersData.users.find(u => u.username === username);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Create new user (default role: student)
    const newUser: User = {
      username,
      password, // In production, hash this with bcrypt
      role: 'student',
      anon_id: generateAnonId(),
      dept,
      year: year || 1
    };

    // Add to users array
    usersData.users.push(newUser);

    // Write back to file (in production, use a database)
    fs.writeFileSync(dataPath, JSON.stringify(usersData, null, 2));

    // Create JWT token
    const token = jwt.sign(
      {
        username: newUser.username,
        role: newUser.role,
        anon_id: newUser.anon_id,
        dept: newUser.dept,
        year: newUser.year
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username: newUser.username,
        role: newUser.role,
        anon_id: newUser.anon_id,
        dept: newUser.dept,
        year: newUser.year
      }
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}