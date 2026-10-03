import express from 'express';
import prisma from '../config/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply candidate authentication to all routes in this file
router.use(authenticate, requireRole('CANDIDATE'));

// Helper to get candidate profile ID from authenticated request
const getCandidateProfile = async (userId) => {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      careerHistories: { orderBy: { createdAt: 'desc' } },
      candidateSkills: { include: { skill: true } },
      evidences: { orderBy: { verifiedAt: 'desc' } },
      submissions: {
        include: { assessment: true },
        orderBy: { submittedAt: 'desc' },
      },
      sharedProfiles: {
        include: {
          employer: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });
  return profile;
};

// 1. Get Candidate Full Profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Candidate profile not found.' });
    }

    // Calculate dynamic readiness metrics
    const totalSkills = profile.candidateSkills.length;
    const verifiedSkills = profile.candidateSkills.filter((s) => s.status === 'VERIFIED').length;
    const verifiedEvidenceCount = profile.evidences.filter((e) => e.status === 'VERIFIED').length;
    const avgScore = profile.evidences.length > 0
      ? Math.round(profile.evidences.reduce((acc, curr) => acc + curr.score, 0) / profile.evidences.length)
      : 0;

    // Readiness score formula (0 - 100)
    const skillRatio = totalSkills > 0 ? (verifiedSkills / totalSkills) * 40 : 0;
    const evidenceComponent = Math.min(verifiedEvidenceCount * 12, 35);
    const scoreComponent = (avgScore / 100) * 25;
    const readinessScore = Math.min(Math.round(skillRatio + evidenceComponent + scoreComponent), 100);

    return res.json({
      profile,
      metrics: {
        totalSkills,
        verifiedSkills,
        verifiedEvidenceCount,
        averageEvidenceScore: avgScore,
        readinessScore: readinessScore || 45,
      },
    });
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// 2. Update Candidate Profile Details
router.put('/profile', async (req, res) => {
  try {
    const { targetRole, careerBreakYears, location, phone, bio, profilePhoto, name } = req.body;

    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name: name.trim() },
      });
    }

    const updatedProfile = await prisma.candidateProfile.update({
      where: { userId: req.user.id },
      data: {
        targetRole: targetRole !== undefined ? targetRole : undefined,
        careerBreakYears: careerBreakYears !== undefined ? parseFloat(careerBreakYears) : undefined,
        location: location !== undefined ? location : undefined,
        phone: phone !== undefined ? phone : undefined,
        bio: bio !== undefined ? bio : undefined,
        profilePhoto: profilePhoto !== undefined ? profilePhoto : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating candidate profile:', error);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// 3. Career History CRUD (Pipeline Stage: Past Experience)
router.get('/career-history', async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const histories = await prisma.careerHistory.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(histories);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load career history.' });
  }
});

router.post('/career-history', async (req, res) => {
  try {
    const { company, role, startDate, endDate, description } = req.body;
    if (!company || !role || !startDate) {
      return res.status(400).json({ error: 'Company, role, and start date are required.' });
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const history = await prisma.careerHistory.create({
      data: {
        candidateId: profile.id,
        company,
        role,
        startDate,
        endDate: endDate || 'Present',
        description: description || '',
      },
    });

    return res.status(201).json({ message: 'Career history entry added', history });
  } catch (error) {
    console.error('Error adding career history:', error);
    return res.status(500).json({ error: 'Failed to add career history.' });
  }
});

router.delete('/career-history/:id', async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    await prisma.careerHistory.deleteMany({
      where: { id: req.params.id, candidateId: profile.id },
    });
    return res.json({ message: 'Career history entry deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete career history entry.' });
  }
});

// 4. Skills Management
router.get('/skills', async (req, res) => {
  try {
    const allSkills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        candidateSkills: { include: { skill: true } },
      },
    });
    return res.json({
      allSkills,
      candidateSkills: profile?.candidateSkills || [],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const { skillId, skillName, category, yearsExperience, selfRating } = req.body;
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });

    let targetSkillId = skillId;
    if (!targetSkillId && skillName) {
      // Find or create skill
      let skill = await prisma.skill.findUnique({ where: { name: skillName.trim() } });
      if (!skill) {
        skill = await prisma.skill.create({
          data: { name: skillName.trim(), category: category || 'General' },
        });
      }
      targetSkillId = skill.id;
    }

    if (!targetSkillId) {
      return res.status(400).json({ error: 'Skill ID or Skill Name is required.' });
    }

    const existingCandidateSkill = await prisma.candidateSkill.findUnique({
      where: {
        candidateId_skillId: {
          candidateId: profile.id,
          skillId: targetSkillId,
        },
      },
    });

    let result;
    if (existingCandidateSkill) {
      result = await prisma.candidateSkill.update({
        where: { id: existingCandidateSkill.id },
        data: {
          yearsExperience: yearsExperience !== undefined ? parseFloat(yearsExperience) : existingCandidateSkill.yearsExperience,
          selfRating: selfRating !== undefined ? parseInt(selfRating) : existingCandidateSkill.selfRating,
        },
        include: { skill: true },
      });
    } else {
      result = await prisma.candidateSkill.create({
        data: {
          candidateId: profile.id,
          skillId: targetSkillId,
          yearsExperience: parseFloat(yearsExperience) || 1,
          selfRating: parseInt(selfRating) || 3,
          status: 'NEEDS_REFRESH',
        },
        include: { skill: true },
      });
    }

    return res.status(201).json({ message: 'Skill saved successfully', candidateSkill: result });
  } catch (error) {
    console.error('Error saving skill:', error);
    return res.status(500).json({ error: 'Failed to save skill.' });
  }
});

router.delete('/skills/:id', async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    await prisma.candidateSkill.deleteMany({
      where: { id: req.params.id, candidateId: profile.id },
    });
    return res.json({ message: 'Skill removed.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove skill.' });
  }
});

// 5. Intelligent Skill Gap Analysis (Pipeline Stage: Skill Gap Analysis)
router.get('/skill-gap-analysis', async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    // Target role expectations mapping (realistic industry benchmarks for career re-entry)
    const targetRole = profile.targetRole || 'Senior Full Stack Engineer';
    const breakYears = profile.careerBreakYears || 0;

    // Fetch active jobs matching role or general requirements
    const allJobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: { jobSkills: { include: { skill: true } } },
    });

    // Compile market skill demands from jobs
    const marketSkillDemands = {};
    allJobs.forEach((job) => {
      job.jobSkills.forEach((js) => {
        const sName = js.skill.name;
        if (!marketSkillDemands[sName]) {
          marketSkillDemands[sName] = {
            name: sName,
            category: js.skill.category,
            demandCount: 0,
            requiredInJobs: 0,
          };
        }
        marketSkillDemands[sName].demandCount += 1;
        if (js.required) marketSkillDemands[sName].requiredInJobs += 1;
      });
    });

    // Evaluate candidate skills against break and evidence
    const candidateSkillMap = {};
    profile.candidateSkills.forEach((cs) => {
      candidateSkillMap[cs.skill.name] = cs;
    });

    const candidateEvidenceMap = {};
    profile.evidences.forEach((ev) => {
      if (!candidateEvidenceMap[ev.skill]) candidateEvidenceMap[ev.skill] = [];
      candidateEvidenceMap[ev.skill].push(ev);
    });

    const analysisItems = [];

    // Analyze all skills known in market
    Object.keys(marketSkillDemands).forEach((skillName) => {
      const marketDemand = marketSkillDemands[skillName];
      const candidateSkill = candidateSkillMap[skillName];
      const evidences = candidateEvidenceMap[skillName] || [];
      const hasVerifiedEvidence = evidences.some((e) => e.status === 'VERIFIED' && e.score >= 70);

      let gapStatus = 'MISSING_GAP';
      let gapSeverity = 'HIGH';
      let recommendation = '';
      let refreshPriority = 'Urgent Refresh';

      if (hasVerifiedEvidence) {
        gapStatus = 'VERIFIED_CURRENT';
        gapSeverity = 'NONE';
        recommendation = 'Strong current evidence established. Ready for employer review.';
        refreshPriority = 'Completed';
      } else if (candidateSkill) {
        if (breakYears >= 2) {
          gapStatus = 'NEEDS_REFRESH';
          gapSeverity = 'MEDIUM';
          recommendation = `Past foundation exists (${candidateSkill.yearsExperience} yrs). Take a practical assessment or submit project evidence to prove current 2026 fluency.`;
          refreshPriority = 'High Priority Refresh';
        } else {
          gapStatus = 'NEEDS_ASSESSMENT';
          gapSeverity = 'LOW';
          recommendation = 'Recent experience on file. Complete quick skills assessment to secure verified badge.';
          refreshPriority = 'Recommended Assessment';
        }
      } else {
        gapStatus = 'MISSING_GAP';
        gapSeverity = marketDemand.requiredInJobs > 0 ? 'HIGH' : 'MEDIUM';
        recommendation = `High employer demand for ${targetRole}. Recommended to take guided assessment and build evidence artifact.`;
        refreshPriority = 'New Acquisition';
      }

      analysisItems.push({
        skill: skillName,
        category: marketDemand.category,
        marketDemandCount: marketDemand.demandCount,
        requiredInJobs: marketDemand.requiredInJobs,
        candidateYears: candidateSkill ? candidateSkill.yearsExperience : 0,
        candidateSelfRating: candidateSkill ? candidateSkill.selfRating : 0,
        gapStatus,
        gapSeverity,
        recommendation,
        refreshPriority,
        evidencesCount: evidences.length,
        hasVerifiedEvidence,
      });
    });

    // Calculate overall gap metrics
    const totalRequired = analysisItems.filter((i) => i.requiredInJobs > 0).length;
    const verifiedRequired = analysisItems.filter((i) => i.requiredInJobs > 0 && i.gapStatus === 'VERIFIED_CURRENT').length;
    const refreshNeeded = analysisItems.filter((i) => i.gapStatus === 'NEEDS_REFRESH').length;
    const missingCount = analysisItems.filter((i) => i.gapStatus === 'MISSING_GAP').length;

    const gapReadinessScore = totalRequired > 0 ? Math.round((verifiedRequired / totalRequired) * 100) : 60;

    return res.json({
      targetRole,
      careerBreakYears: breakYears,
      readinessScore: gapReadinessScore,
      summary: {
        totalEvaluatedSkills: analysisItems.length,
        verifiedCurrent: analysisItems.filter((i) => i.gapStatus === 'VERIFIED_CURRENT').length,
        needsRefresh: refreshNeeded,
        missingGaps: missingCount,
      },
      skillsBreakdown: analysisItems,
      suggestedRoadmap: [
        {
          step: 1,
          title: 'Address High Priority Refreshes',
          description: `Refresh ${refreshNeeded} skills with significant past tenure affected by the ${breakYears}-year career pause.`,
          action: 'TAKE_ASSESSMENT',
        },
        {
          step: 2,
          title: 'Submit Tangible Code / Case Study Evidence',
          description: 'Attach modern GitHub projects or case studies to demonstrate practical execution in production workflows.',
          action: 'ADD_EVIDENCE',
        },
        {
          step: 3,
          title: 'Publish Evidence Profile to Partner Employers',
          description: 'Share your verified dossier directly with tech companies hiring returning talent.',
          action: 'SHARE_PROFILE',
        },
      ],
    });
  } catch (error) {
    console.error('Error computing skill gap analysis:', error);
    return res.status(500).json({ error: 'Failed to compute skill gap analysis.' });
  }
});

// 6. Evidence CRUD (Pipeline Stage: Current Evidence)
router.get('/evidence', async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const evidences = await prisma.evidence.findMany({
      where: { candidateId: profile.id },
      orderBy: { verifiedAt: 'desc' },
    });
    return res.json(evidences);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load evidence.' });
  }
});

router.post('/evidence', async (req, res) => {
  try {
    const { skill, evidenceType, description, score, verificationUrl } = req.body;
    if (!skill || !description) {
      return res.status(400).json({ error: 'Skill and description are required.' });
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    const evidence = await prisma.evidence.create({
      data: {
        candidateId: profile.id,
        skill: skill.trim(),
        evidenceType: evidenceType || 'PORTFOLIO_CASE_STUDY',
        description,
        score: score ? parseFloat(score) : 85,
        status: 'VERIFIED',
        verificationUrl: verificationUrl || '',
      },
    });

    // Also update or mark the candidateSkill as VERIFIED if score >= 70
    const matchedSkill = await prisma.skill.findUnique({ where: { name: skill.trim() } });
    if (matchedSkill) {
      await prisma.candidateSkill.upsert({
        where: {
          candidateId_skillId: {
            candidateId: profile.id,
            skillId: matchedSkill.id,
          },
        },
        update: { status: 'VERIFIED' },
        create: {
          candidateId: profile.id,
          skillId: matchedSkill.id,
          yearsExperience: 2,
          status: 'VERIFIED',
          selfRating: 4,
        },
      });
    }

    return res.status(201).json({ message: 'Evidence added and verified.', evidence });
  } catch (error) {
    console.error('Error adding evidence:', error);
    return res.status(500).json({ error: 'Failed to add evidence.' });
  }
});

router.delete('/evidence/:id', async (req, res) => {
  try {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });
    await prisma.evidence.deleteMany({
      where: { id: req.params.id, candidateId: profile.id },
    });
    return res.json({ message: 'Evidence item removed.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete evidence item.' });
  }
});

// 7. Full Evidence Profile Dossier (Pipeline Stage: Evidence Profile)
router.get('/evidence-profile', async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });

    const totalYearsPrior = profile.careerHistories.length * 2.5; // Estimated or calculated
    const verifiedBadges = profile.evidences.filter((e) => e.status === 'VERIFIED');
    const averageScore = verifiedBadges.length > 0
      ? Math.round(verifiedBadges.reduce((sum, item) => sum + item.score, 0) / verifiedBadges.length)
      : 85;

    const evidenceProfileDossier = {
      profileId: profile.id,
      candidateName: profile.user.name,
      email: profile.user.email,
      phone: profile.phone,
      location: profile.location,
      targetRole: profile.targetRole,
      careerBreakYears: profile.careerBreakYears,
      bio: profile.bio,
      profilePhoto: profile.profilePhoto,
      gapNarrative: `Reframing the Career Pause: Re-entering after a structured ${profile.careerBreakYears}-year break with renewed focus, validated modern technical fluency, and verified hands-on evidence.`,
      priorExperienceTotalYears: totalYearsPrior,
      overallReadinessScore: Math.min(Math.round((verifiedBadges.length * 15) + (averageScore * 0.4)), 100),
      averageEvidenceScore: averageScore,
      careerHistories: profile.careerHistories,
      verifiedSkills: profile.candidateSkills.filter((s) => s.status === 'VERIFIED'),
      allSkills: profile.candidateSkills,
      evidenceBadges: profile.evidences,
      assessmentSubmissions: profile.submissions,
      sharedWithEmployersCount: profile.sharedProfiles.length,
      shareableUrl: `/evidence/${profile.id}`,
    };

    return res.json(evidenceProfileDossier);
  } catch (error) {
    console.error('Error generating evidence profile:', error);
    return res.status(500).json({ error: 'Failed to load evidence profile.' });
  }
});

// 8. Share Profile with Employer (Pipeline Stage: Employer Review)
router.post('/share-profile', async (req, res) => {
  try {
    const { employerId, note } = req.body;
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: req.user.id } });

    if (!employerId) {
      return res.status(400).json({ error: 'Employer ID is required.' });
    }

    const shared = await prisma.sharedProfile.upsert({
      where: {
        candidateId_employerId: {
          candidateId: profile.id,
          employerId,
        },
      },
      update: {
        note: note || 'Candidate shared updated evidence profile.',
        sharedAt: new Date(),
        status: 'ACTIVE',
      },
      create: {
        candidateId: profile.id,
        employerId,
        permissions: 'FULL_EVIDENCE_ACCESS',
        status: 'ACTIVE',
        note: note || 'Candidate initiated evidence profile review.',
      },
      include: {
        employer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    return res.status(201).json({
      message: 'Evidence profile successfully shared with employer!',
      sharedProfile: shared,
    });
  } catch (error) {
    console.error('Error sharing profile:', error);
    return res.status(500).json({ error: 'Failed to share profile.' });
  }
});

// 9. Matched Jobs for Candidate
router.get('/matched-jobs', async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user.id);
    const jobs = await prisma.job.findMany({
      where: { status: 'OPEN' },
      include: {
        employer: {
          include: { user: { select: { name: true, email: true } } },
        },
        jobSkills: { include: { skill: true } },
      },
    });

    const candidateSkillNames = new Set(
      profile.candidateSkills.filter((s) => s.status === 'VERIFIED').map((s) => s.skill.name)
    );

    const jobsWithMatchScore = jobs.map((job) => {
      const requiredSkills = job.jobSkills.filter((js) => js.required);
      let matchedCount = 0;

      requiredSkills.forEach((js) => {
        if (candidateSkillNames.has(js.skill.name)) {
          matchedCount += 1;
        }
      });

      const matchPercentage = requiredSkills.length > 0
        ? Math.round((matchedCount / requiredSkills.length) * 100)
        : 75;

      const isShared = profile.sharedProfiles.some((sp) => sp.employerId === job.employerId);

      return {
        ...job,
        matchPercentage,
        matchedCount,
        totalRequired: requiredSkills.length,
        isShared,
      };
    });

    jobsWithMatchScore.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.json(jobsWithMatchScore);
  } catch (error) {
    console.error('Error loading matched jobs:', error);
    return res.status(500).json({ error: 'Failed to load jobs.' });
  }
});

export default router;
