import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { authenticate, signToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// 1. CANDIDATE AUTHENTICATION
// ==========================================

// Candidate Registration
router.post('/register/candidate', async (req, res) => {
  try {
    const { name, email, password, targetRole, careerBreakYears, location, phone, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'CANDIDATE',
        candidateProfile: {
          create: {
            targetRole: targetRole || 'Software Engineer',
            careerBreakYears: parseFloat(careerBreakYears) || 0,
            location: location || '',
            phone: phone || '',
            bio: bio || '',
          },
        },
      },
      include: {
        candidateProfile: true,
      },
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Candidate registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.candidateProfile,
      },
    });
  } catch (error) {
    console.error('Candidate registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please check inputs.' });
  }
});

// Candidate Login
router.post('/login/candidate', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        candidateProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid candidate credentials.' });
    }

    if (user.role !== 'CANDIDATE') {
      return res.status(403).json({
        error: 'This account is registered as an Employer. Please use Employer Login.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid candidate credentials.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Candidate login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.candidateProfile,
      },
    });
  } catch (error) {
    console.error('Candidate login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ==========================================
// 2. EMPLOYER AUTHENTICATION
// ==========================================

// Employer Registration
router.post('/register/employer', async (req, res) => {
  try {
    const { name, email, password, companyName, industry, location, website, companyDescription } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ error: 'Name, email, password, and company name are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'EMPLOYER',
        employerProfile: {
          create: {
            companyName: companyName.trim(),
            industry: industry || 'Technology',
            location: location || '',
            website: website || '',
            companyDescription: companyDescription || '',
          },
        },
      },
      include: {
        employerProfile: true,
      },
    });

    const token = signToken(user);

    return res.status(201).json({
      message: 'Employer registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.employerProfile,
      },
    });
  } catch (error) {
    console.error('Employer registration error:', error);
    return res.status(500).json({ error: 'Employer registration failed.' });
  }
});

// Employer Login
router.post('/login/employer', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        employerProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid employer credentials.' });
    }

    if (user.role !== 'EMPLOYER') {
      return res.status(403).json({
        error: 'This account is registered as a Candidate. Please use Candidate Login.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid employer credentials.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Employer login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.employerProfile,
      },
    });
  } catch (error) {
    console.error('Employer login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get Current User Profile (Protected)
router.get('/me', authenticate, async (req, res) => {
  const profile = req.user.role === 'CANDIDATE' ? req.user.candidateProfile : req.user.employerProfile;
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profile,
    },
  });
});

export default router;
