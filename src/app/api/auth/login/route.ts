import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Read sample accounts
    const dataPath = path.join(process.cwd(), 'data', 'sample_accounts.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const usersData: UsersData = JSON.parse(fileContents);

    // Find user
    const user = usersData.users.find(u => u.username === username);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For demo purposes, we're using plain text passwords
    // In production, you should hash passwords and use bcrypt.compare
    const isValidPassword = password === user.password;
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
        anon_id: user.anon_id,
        dept: user.dept,
        year: user.year
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        anon_id: user.anon_id,
        dept: user.dept,
        year: user.year
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}