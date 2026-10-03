import express from 'express';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Employer authentication required for all routes
router.use(authenticate, requireRole('EMPLOYER'));

// 1. Get Employer Profile & Overview Stats
router.get('/profile', async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        jobs: {
          include: { jobSkills: { include: { skill: true } } },
          orderBy: { createdAt: 'desc' },
        },
        sharedProfiles: {
          include: {
            candidate: {
              include: {
                user: { select: { name: true, email: true } },
                evidences: true,
                candidateSkills: { include: { skill: true } },
              },
            },
          },
        },
      },
    });

    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found.' });
    }

    const totalJobs = employer.jobs.length;
    const activeJobs = employer.jobs.filter((j) => j.status === 'OPEN').length;
    const sharedCandidatesCount = employer.sharedProfiles.length;
    const shortlistedCount = employer.sharedProfiles.filter((s) => s.status === 'SHORTLISTED' || s.status === 'INTERVIEW_REQUESTED').length;

    return res.json({
      employer,
      stats: {
        totalJobs,
        activeJobs,
        sharedCandidatesCount,
        shortlistedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return res.status(500).json({ error: 'Failed to load employer profile.' });
  }
});

// 2. Update Employer Company Profile
router.put('/profile', async (req, res) => {
  try {
    const { companyName, industry, location, website, companyDescription, name } = req.body;

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    const updated = await prisma.employerProfile.update({
      where: { userId: req.user.id },
      data: {
        companyName: companyName !== undefined ? companyName.trim() : undefined,
        industry: industry !== undefined ? industry.trim() : undefined,
        location: location !== undefined ? location.trim() : undefined,
        website: website !== undefined ? website.trim() : undefined,
        companyDescription: companyDescription !== undefined ? companyDescription.trim() : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ message: 'Company profile updated successfully.', employer: updated });
  } catch (error) {
    console.error('Error updating employer profile:', error);
    return res.status(500).json({ error: 'Failed to update employer profile.' });
  }
});

// 3. Post a New Job with Required/Preferred Skills
router.post('/jobs', async (req, res) => {
  try {
    const { title, description, location, experienceRequired, salaryRange, workMode, requiredSkills, preferredSkills } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });

    const newJob = await prisma.job.create({
      data: {
        employerId: employer.id,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        experienceRequired: experienceRequired || '3+ years prior experience',
        salaryRange: salaryRange || 'Competitive',
        workMode: workMode || 'Hybrid',
        status: 'OPEN',
      },
    });

    // Link required skills
    if (Array.isArray(requiredSkills)) {
      for (const skillName of requiredSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category: 'General' } });
        }
        await prisma.jobSkill.create({
          data: {
            jobId: newJob.id,
            skillId: skill.id,
            required: true,
            preferred: false,
          },
        });
      }
    }

    // Link preferred skills
    if (Array.isArray(preferredSkills)) {
      for (const skillName of preferredSkills) {
        let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName.trim(), category: 'General' } });
        }
        await prisma.jobSkill.create({
          data: {
            jobId: newJob.id,
            skillId: skill.id,
            required: false,
            preferred: true,
          },
        });
      }
    }

    const fullJob = await prisma.job.findUnique({
      where: { id: newJob.id },
      include: { jobSkills: { include: { skill: true } } },
    });

    return res.status(201).json({ message: 'Job created successfully', job: fullJob });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ error: 'Failed to create job posting.' });
  }
});

// 4. Delete Job Posting
router.delete('/jobs/:id', async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    await prisma.job.deleteMany({
      where: { id: req.params.id, employerId: employer.id },
    });
    return res.json({ message: 'Job posting deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// 5. Browse Returning Talent Pool with Verification Filters
router.get('/talent-pool', async (req, res) => {
  try {
    const { targetRole, minBreak, maxBreak, skill, minScore } = req.query;

    const candidates = await prisma.candidateProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        careerHistories: { orderBy: { createdAt: 'desc' } },
        candidateSkills: { include: { skill: true } },
        evidences: { orderBy: { verifiedAt: 'desc' } },
        submissions: { include: { assessment: true } },
      },
    });

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    const sharedRecords = await prisma.sharedProfile.findMany({
      where: { employerId: employer.id },
    });
    const sharedMap = {};
    sharedRecords.forEach((s) => {
      sharedMap[s.candidateId] = s.status;
    });

    let filtered = candidates.map((cand) => {
      const verifiedEvidences = cand.evidences.filter((e) => e.status === 'VERIFIED');
      const avgScore = verifiedEvidences.length > 0
        ? Math.round(verifiedEvidences.reduce((sum, item) => sum + item.score, 0) / verifiedEvidences.length)
        : 75;

      const verifiedSkillsList = cand.candidateSkills
        .filter((cs) => cs.status === 'VERIFIED')
        .map((cs) => cs.skill.name);

      return {
        id: cand.id,
        userId: cand.userId,
        name: cand.user.name,
        email: cand.user.email,
        phone: cand.phone,
        location: cand.location,
        targetRole: cand.targetRole,
        careerBreakYears: cand.careerBreakYears,
        bio: cand.bio,
        profilePhoto: cand.profilePhoto,
        evidenceScore: avgScore,
        verifiedSkills: verifiedSkillsList,
        totalEvidences: cand.evidences.length,
        careerHistories: cand.careerHistories,
        submissionsCount: cand.submissions.length,
        pipelineStatus: sharedMap[cand.id] || 'NEW',
      };
    });

    // Apply filtering query params
    if (targetRole) {
      filtered = filtered.filter((c) =>
        c.targetRole?.toLowerCase().includes(targetRole.toString().toLowerCase())
      );
    }
    if (minBreak) {
      filtered = filtered.filter((c) => c.careerBreakYears >= parseFloat(minBreak.toString()));
    }
    if (maxBreak) {
      filtered = filtered.filter((c) => c.careerBreakYears <= parseFloat(maxBreak.toString()));
    }
    if (skill) {
      filtered = filtered.filter((c) =>
        c.verifiedSkills.some((s) => s.toLowerCase().includes(skill.toString().toLowerCase()))
      );
    }
    if (minScore) {
      filtered = filtered.filter((c) => c.evidenceScore >= parseFloat(minScore.toString()));
    }

    return res.json(filtered);
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    return res.status(500).json({ error: 'Failed to fetch talent pool.' });
  }
});

// 6. Review Candidate Full Evidence Profile
router.get('/candidate/:id/evidence-profile', async (req, res) => {
  try {
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
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
      return res.status(404).json({ error: 'Candidate profile not found.' });
    }

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    const sharedStatus = await prisma.sharedProfile.findUnique({
      where: {
        candidateId_employerId: {
          candidateId: candidate.id,
          employerId: employer.id,
        },
      },
    });

    const verifiedEvidences = candidate.evidences.filter((e) => e.status === 'VERIFIED');
    const avgScore = verifiedEvidences.length > 0
      ? Math.round(verifiedEvidences.reduce((sum, item) => sum + item.score, 0) / verifiedEvidences.length)
      : 80;

    return res.json({
      candidate: {
        id: candidate.id,
        name: candidate.user.name,
        email: candidate.user.email,
        phone: candidate.phone,
        location: candidate.location,
        targetRole: candidate.targetRole,
        careerBreakYears: candidate.careerBreakYears,
        bio: candidate.bio,
        profilePhoto: candidate.profilePhoto,
        evidenceScore: avgScore,
        careerHistories: candidate.careerHistories,
        candidateSkills: candidate.candidateSkills,
        evidences: candidate.evidences,
        submissions: candidate.submissions,
      },
      pipelineStatus: sharedStatus?.status || 'NEW',
      sharedNote: sharedStatus?.note || null,
    });
  } catch (error) {
    console.error('Error loading candidate evidence dossier:', error);
    return res.status(500).json({ error: 'Failed to load candidate evidence profile.' });
  }
});

// 7. Update Candidate Pipeline Status (Shortlist, Interview, Reviewed)
router.post('/candidate/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });

    const shared = await prisma.sharedProfile.upsert({
      where: {
        candidateId_employerId: {
          candidateId: req.params.id,
          employerId: employer.id,
        },
      },
      update: {
        status: status || 'SHORTLISTED',
        note: note || undefined,
        sharedAt: new Date(),
      },
      create: {
        candidateId: req.params.id,
        employerId: employer.id,
        permissions: 'FULL_EVIDENCE_ACCESS',
        status: status || 'SHORTLISTED',
        note: note || 'Employer updated pipeline status.',
      },
    });

    return res.json({ message: `Candidate status updated to ${status}`, sharedProfile: shared });
  } catch (error) {
    console.error('Error updating candidate status:', error);
    return res.status(500).json({ error: 'Failed to update candidate status.' });
  }
});

// 8. Get Shared Profiles
router.get('/shared-profiles', async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    const shared = await prisma.sharedProfile.findMany({
      where: { employerId: employer.id },
      include: {
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
            evidences: true,
            candidateSkills: { include: { skill: true } },
          },
        },
      },
      orderBy: { sharedAt: 'desc' },
    });
    return res.json(shared);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load shared profiles.' });
  }
});

export default router;
