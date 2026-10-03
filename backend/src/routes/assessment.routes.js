import express from 'express';
import prisma from '../config/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 1. List all available assessments (Public/Authenticated)
router.get('/', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = assessments.map((a) => {
      let questionsCount = 0;
      try {
        const parsed = JSON.parse(a.questions);
        questionsCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch (e) {
        questionsCount = 4;
      }
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        skill: a.skill,
        difficulty: a.difficulty,
        timeLimitMinutes: a.timeLimitMinutes,
        passingScore: a.passingScore,
        questionsCount,
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json({ error: 'Failed to load assessments.' });
  }
});

// 2. Get specific assessment with questions (Protected)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    let questions = [];
    try {
      questions = JSON.parse(assessment.questions);
    } catch (e) {
      questions = [];
    }

    // Strip out correctIndex for the test-taking client
    const clientQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return res.json({
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      skill: assessment.skill,
      difficulty: assessment.difficulty,
      timeLimitMinutes: assessment.timeLimitMinutes,
      passingScore: assessment.passingScore,
      questions: clientQuestions,
    });
  } catch (error) {
    console.error('Error fetching assessment details:', error);
    return res.status(500).json({ error: 'Failed to load assessment details.' });
  }
});

// 3. Submit Assessment Answers & Auto-Grade (Protected Candidate)
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'CANDIDATE') {
      return res.status(403).json({ error: 'Only candidates can submit assessments.' });
    }

    const { answers } = req.body; // e.g. { "q1": 0, "q2": 1, ... }
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Valid answers object is required.' });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: req.params.id },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    let questions = [];
    try {
      questions = JSON.parse(assessment.questions);
    } catch (e) {
      questions = [];
    }

    let correctCount = 0;
    const totalQuestions = questions.length;
    const questionReview = [];

    questions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount += 1;

      questionReview.push({
        id: q.id,
        question: q.question,
        userAnswer: selected !== undefined ? q.options[selected] : 'Not Answered',
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || 'Verified industry standard methodology.',
      });
    });

    const calculatedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = calculatedScore >= assessment.passingScore;
    const status = passed ? 'PASSED' : 'FAILED';

    const feedback = passed
      ? `Congratulations! You scored ${calculatedScore}% and demonstrated current verified fluency in ${assessment.skill}.`
      : `You scored ${calculatedScore}%. The passing threshold is ${assessment.passingScore}%. We recommend reviewing modern documentation and re-attempting.`;

    // 1. Record Submission
    const submission = await prisma.submission.create({
      data: {
        assessmentId: assessment.id,
        candidateId: candidateProfile.id,
        score: calculatedScore,
        status,
        answers: JSON.stringify(answers),
        feedback,
      },
    });

    // 2. If Passed, automatically generate verified Evidence and update CandidateSkill!
    let createdEvidence = null;
    if (passed) {
      createdEvidence = await prisma.evidence.create({
        data: {
          candidateId: candidateProfile.id,
          skill: assessment.skill,
          evidenceType: 'ASSESSMENT_VERIFIED',
          description: `Passed SkilBridge Practical Assessment: ${assessment.title} with a verified score of ${calculatedScore}%.`,
          score: calculatedScore,
          status: 'VERIFIED',
          verificationUrl: `https://skilbridge.verify/eval/${submission.id}`,
        },
      });

      // Update skill status to VERIFIED
      const skillRecord = await prisma.skill.findUnique({ where: { name: assessment.skill } });
      if (skillRecord) {
        await prisma.candidateSkill.upsert({
          where: {
            candidateId_skillId: {
              candidateId: candidateProfile.id,
              skillId: skillRecord.id,
            },
          },
          update: { status: 'VERIFIED' },
          create: {
            candidateId: candidateProfile.id,
            skillId: skillRecord.id,
            yearsExperience: 2,
            status: 'VERIFIED',
            selfRating: 4,
          },
        });
      }
    }

    return res.json({
      message: passed ? 'Assessment Passed! Verified evidence badge generated.' : 'Assessment Completed.',
      passed,
      score: calculatedScore,
      totalQuestions,
      correctCount,
      feedback,
      submissionId: submission.id,
      evidence: createdEvidence,
      review: questionReview,
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return res.status(500).json({ error: 'Assessment submission failed.' });
  }
});

export default router;
