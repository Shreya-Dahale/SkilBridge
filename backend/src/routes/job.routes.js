import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

// 1. Browse All Active Jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        employer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        jobSkills: {
          include: { skill: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// 2. Get Single Job Details
router.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        jobSkills: {
          include: { skill: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load job details.' });
  }
});

// 3. Public Verified Evidence Profile View (Accessible by link)
router.get('/public/evidence/:id', async (req, res) => {
  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { name: true, email: true } },
        careerHistories: { orderBy: { createdAt: 'desc' } },
        candidateSkills: { include: { skill: true } },
        evidences: { orderBy: { verifiedAt: 'desc' } },
        submissions: {
          include: { assessment: true },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Verified evidence profile not found.' });
    }

    const verifiedEvidences = candidate.evidences.filter((e) => e.status === 'VERIFIED');
    const avgScore = verifiedEvidences.length > 0
      ? Math.round(verifiedEvidences.reduce((sum, item) => sum + item.score, 0) / verifiedEvidences.length)
      : 80;

    return res.json({
      id: candidate.id,
      name: candidate.user.name,
      location: candidate.location,
      targetRole: candidate.targetRole,
      careerBreakYears: candidate.careerBreakYears,
      bio: candidate.bio,
      profilePhoto: candidate.profilePhoto,
      evidenceScore: avgScore,
      careerHistories: candidate.careerHistories,
      verifiedSkills: candidate.candidateSkills.filter((s) => s.status === 'VERIFIED'),
      evidences: candidate.evidences,
      submissions: candidate.submissions,
      verifiedAt: new Date(),
    });
  } catch (error) {
    console.error('Error fetching public evidence profile:', error);
    return res.status(500).json({ error: 'Failed to load public profile.' });
  }
});

export default router;
