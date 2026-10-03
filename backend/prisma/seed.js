import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SkilBridge database seeding...');

  // Clean existing data
  await prisma.submission.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.sharedProfile.deleteMany({});
  await prisma.jobSkill.deleteMany({});
  await prisma.candidateSkill.deleteMany({});
  await prisma.careerHistory.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.candidateProfile.deleteMany({});
  await prisma.employerProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const candidateHashedPassword = await bcrypt.hash('Candidate123!', 10);
  const employerHashedPassword = await bcrypt.hash('Employer123!', 10);

  // 1. Create Core Skills
  const skillsData = [
    { name: 'React', category: 'Frontend' },
    { name: 'TypeScript', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'Cloud & AWS', category: 'Cloud & DevOps' },
    { name: 'System Design', category: 'Architecture' },
    { name: 'REST APIs', category: 'Backend' },
    { name: 'Docker & CI/CD', category: 'Cloud & DevOps' },
  ];

  const createdSkills = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.create({ data: s });
    createdSkills[s.name] = skill;
  }
  console.log(`✓ Seeded ${skillsData.length} core skills`);

  // 2. Create Candidate Demo User (Priya Sharma)
  const candidateUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'candidate@skilbridge.com',
      password: candidateHashedPassword,
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          phone: '+91 98765 43210',
          location: 'Bangalore, India (Open to Remote / Hybrid)',
          targetRole: 'Senior Full Stack Engineer',
          careerBreakYears: 3.5,
          bio: 'Full-stack software engineer with 6 years of solid industry experience prior to a 3.5-year career break for family caregiving. Re-energized and actively refreshed in modern React 19, TypeScript, cloud microservices, and system design. Proven through verified practical assessments and real-world evidence projects.',
          profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          careerHistories: {
            create: [
              {
                company: 'Infosys Ltd',
                role: 'Senior Software Engineer',
                startDate: 'Jan 2017',
                endDate: 'Jun 2021',
                description: 'Architected scalable customer portal modules using React and Node.js. Led an agile sub-team of 5 engineers, improving API response times by 35% and establishing automated test coverage.',
              },
              {
                company: 'TechTree Labs',
                role: 'Full Stack Web Developer',
                startDate: 'Jul 2015',
                endDate: 'Dec 2016',
                description: 'Built customer dashboards and high-volume billing integrations with React, Express, and PostgreSQL. Reduced query latency by 40% through index optimization.',
              },
            ],
          },
          candidateSkills: {
            create: [
              {
                skillId: createdSkills['React'].id,
                yearsExperience: 5.5,
                status: 'VERIFIED',
                selfRating: 5,
              },
              {
                skillId: createdSkills['TypeScript'].id,
                yearsExperience: 4.0,
                status: 'VERIFIED',
                selfRating: 4,
              },
              {
                skillId: createdSkills['Node.js'].id,
                yearsExperience: 5.0,
                status: 'VERIFIED',
                selfRating: 4,
              },
              {
                skillId: createdSkills['PostgreSQL'].id,
                yearsExperience: 4.5,
                status: 'ASSESSED',
                selfRating: 4,
              },
              {
                skillId: createdSkills['Cloud & AWS'].id,
                yearsExperience: 2.5,
                status: 'NEEDS_REFRESH',
                selfRating: 3,
              },
              {
                skillId: createdSkills['System Design'].id,
                yearsExperience: 4.0,
                status: 'ASSESSED',
                selfRating: 4,
              },
              {
                skillId: createdSkills['REST APIs'].id,
                yearsExperience: 6.0,
                status: 'VERIFIED',
                selfRating: 5,
              },
              {
                skillId: createdSkills['Docker & CI/CD'].id,
                yearsExperience: 2.0,
                status: 'NEEDS_REFRESH',
                selfRating: 3,
              },
            ],
          },
          evidences: {
            create: [
              {
                skill: 'React',
                evidenceType: 'ASSESSMENT_VERIFIED',
                description: 'Completed SkilBridge React 19 Architecture & State Management practical assessment with top tier score.',
                score: 94,
                status: 'VERIFIED',
                verificationUrl: 'https://skilbridge.verify/eval/react-priya-94',
              },
              {
                skill: 'TypeScript',
                evidenceType: 'GITHUB_PROJECT',
                description: 'Engineered a modern open-source SaaS Kanban with strict TypeScript, React Query, and Tailwind. 100% type safety.',
                score: 92,
                status: 'VERIFIED',
                verificationUrl: 'https://github.com/skilbridge-demo/react-typescript-kanban-saas',
              },
              {
                skill: 'Node.js',
                evidenceType: 'ASSESSMENT_VERIFIED',
                description: 'Completed Node.js REST API & Microservice Performance challenge, demonstrating error handling, JWT auth, and concurrency.',
                score: 88,
                status: 'VERIFIED',
                verificationUrl: 'https://skilbridge.verify/eval/node-priya-88',
              },
              {
                skill: 'PostgreSQL',
                evidenceType: 'PORTFOLIO_CASE_STUDY',
                description: 'Comprehensive database redesign case study with connection pooling, index optimization, and transaction handling.',
                score: 86,
                status: 'VERIFIED',
                verificationUrl: 'https://github.com/skilbridge-demo/postgres-query-tuning-case-study',
              },
            ],
          },
        },
      },
    },
    include: { candidateProfile: true },
  });
  console.log('✓ Seeded Demo Candidate: candidate@skilbridge.com');

  // 3. Create Additional Diverse Returning Candidates for Talent Pool
  const candidate2 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul.v@example.com',
      password: candidateHashedPassword,
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          phone: '+91 91234 56789',
          location: 'Pune / Remote',
          targetRole: 'Backend & Data Engineer',
          careerBreakYears: 4.0,
          bio: 'Backend specialist with 7 years of prior distributed systems experience before taking a 4-year break for family business transition. Refreshed in modern Node.js, PostgreSQL, and AWS.',
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          careerHistories: {
            create: [
              {
                company: 'Cognizant',
                role: 'Backend Tech Specialist',
                startDate: '2016',
                endDate: '2020',
                description: 'Maintained microservices in Node.js and SQL handling 2M+ daily requests.',
              },
            ],
          },
          candidateSkills: {
            create: [
              { skillId: createdSkills['Node.js'].id, yearsExperience: 6, status: 'VERIFIED', selfRating: 5 },
              { skillId: createdSkills['PostgreSQL'].id, yearsExperience: 5.5, status: 'VERIFIED', selfRating: 5 },
              { skillId: createdSkills['REST APIs'].id, yearsExperience: 6, status: 'VERIFIED', selfRating: 5 },
            ],
          },
          evidences: {
            create: [
              {
                skill: 'Node.js',
                evidenceType: 'ASSESSMENT_VERIFIED',
                description: 'Passed Node.js Enterprise Microservices Assessment with distinction.',
                score: 91,
                status: 'VERIFIED',
              },
              {
                skill: 'PostgreSQL',
                evidenceType: 'ASSESSMENT_VERIFIED',
                description: 'SQL Optimization & Indexing Assessment verified.',
                score: 95,
                status: 'VERIFIED',
              },
            ],
          },
        },
      },
    },
    include: { candidateProfile: true },
  });

  const candidate3 = await prisma.user.create({
    data: {
      name: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      password: candidateHashedPassword,
      role: 'CANDIDATE',
      candidateProfile: {
        create: {
          phone: '+91 98111 22334',
          location: 'Hyderabad, India (Hybrid)',
          targetRole: 'Lead Frontend Developer',
          careerBreakYears: 2.0,
          bio: 'Former Frontend Lead with 5 years experience returning after a 2-year maternity hiatus. Extensive React, TypeScript, and modern component design system mastery.',
          profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          candidateSkills: {
            create: [
              { skillId: createdSkills['React'].id, yearsExperience: 5, status: 'VERIFIED', selfRating: 5 },
              { skillId: createdSkills['TypeScript'].id, yearsExperience: 4.5, status: 'VERIFIED', selfRating: 5 },
              { skillId: createdSkills['System Design'].id, yearsExperience: 3.5, status: 'VERIFIED', selfRating: 4 },
            ],
          },
          evidences: {
            create: [
              {
                skill: 'React',
                evidenceType: 'ASSESSMENT_VERIFIED',
                description: 'React Modern Hooks & State Management verified test.',
                score: 96,
                status: 'VERIFIED',
              },
              {
                skill: 'TypeScript',
                evidenceType: 'GITHUB_PROJECT',
                description: 'Design System component library with automated Storybook and Tailwind CSS.',
                score: 93,
                status: 'VERIFIED',
              },
            ],
          },
        },
      },
    },
    include: { candidateProfile: true },
  });
  console.log('✓ Seeded additional returning candidates');

  // 4. Create Employer Demo User (TechCorp Solutions)
  const employerUser = await prisma.user.create({
    data: {
      name: 'Arun Mehta',
      email: 'employer@techcorp.com',
      password: employerHashedPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'TechCorp Solutions',
          industry: 'Enterprise Cloud & FinTech',
          location: 'Bangalore / Hybrid & Remote',
          companyDescription: 'Leading digital transformation firm passionate about skills-first hiring and dedicated returnships. We evaluate professionals based on current verified capability rather than career gap duration.',
          website: 'https://techcorp.example.com',
          jobs: {
            create: [
              {
                title: 'Senior Frontend Engineer (Return-to-Work Program)',
                description: 'We are seeking an experienced Frontend Engineer re-entering the workforce. You will build customer-facing web apps with modern React, TypeScript, and Tailwind CSS. We offer flexible onboarding and structured mentorship.',
                location: 'Bangalore (Hybrid / Remote)',
                experienceRequired: '4+ years prior experience',
                status: 'OPEN',
                salaryRange: '₹22,00,000 - ₹30,00,000 / $85k - $110k',
                workMode: 'Hybrid',
                jobSkills: {
                  create: [
                    { skillId: createdSkills['React'].id, required: true, preferred: false },
                    { skillId: createdSkills['TypeScript'].id, required: true, preferred: false },
                    { skillId: createdSkills['REST APIs'].id, required: true, preferred: false },
                    { skillId: createdSkills['System Design'].id, required: false, preferred: true },
                  ],
                },
              },
              {
                title: 'Full Stack Cloud Developer',
                description: 'Join our Cloud Services team to architect reliable microservices and responsive dashboards. Great opportunity for returning engineers with solid Node.js and database foundations.',
                location: 'Remote (Pan India)',
                experienceRequired: '3-6 years prior experience',
                status: 'OPEN',
                salaryRange: '₹20,00,000 - ₹28,00,000 / $80k - $105k',
                workMode: 'Remote',
                jobSkills: {
                  create: [
                    { skillId: createdSkills['Node.js'].id, required: true, preferred: false },
                    { skillId: createdSkills['PostgreSQL'].id, required: true, preferred: false },
                    { skillId: createdSkills['TypeScript'].id, required: true, preferred: false },
                    { skillId: createdSkills['Cloud & AWS'].id, required: false, preferred: true },
                  ],
                },
              },
              {
                title: 'Technical Lead - Platform Architecture',
                description: 'Lead engineering decisions and architecture for our enterprise products. Ideal for senior returners with deep past technical depth and passion for mentoring.',
                location: 'Bangalore (On-site / Flexible)',
                experienceRequired: '6+ years prior experience',
                status: 'OPEN',
                salaryRange: '₹32,00,000 - ₹45,00,000 / $120k - $150k',
                workMode: 'Hybrid',
                jobSkills: {
                  create: [
                    { skillId: createdSkills['System Design'].id, required: true, preferred: false },
                    { skillId: createdSkills['React'].id, required: true, preferred: false },
                    { skillId: createdSkills['Node.js'].id, required: true, preferred: false },
                    { skillId: createdSkills['Docker & CI/CD'].id, required: false, preferred: true },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    include: { employerProfile: true },
  });
  console.log('✓ Seeded Demo Employer: employer@techcorp.com with 3 active jobs');

  // 5. Create SharedProfile connection between Candidate (Priya) and Employer (TechCorp)
  await prisma.sharedProfile.create({
    data: {
      candidateId: candidateUser.candidateProfile.id,
      employerId: employerUser.employerProfile.id,
      permissions: 'FULL_EVIDENCE_ACCESS',
      status: 'SHORTLISTED',
      note: 'Priya demonstrated strong practical assessment scores in React (94%) and Node.js (88%). Shortlisted for technical discussion.',
    },
  });

  // 6. Create Realistic Interactive Assessments
  const assessmentsData = [
    {
      title: 'Modern React Architecture & State Management',
      skill: 'React',
      difficulty: 'Intermediate',
      timeLimitMinutes: 20,
      passingScore: 70,
      description: 'Practical scenario assessment evaluating React 18/19 features, custom hooks, memory leak prevention, and state optimization.',
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'In React 18+, which hook is specifically designed to defer updating a non-urgent part of the UI to keep input responsive?',
          options: [
            'useDeferredValue',
            'useCallback',
            'useMemo',
            'useLayoutEffect',
          ],
          correctIndex: 0,
          explanation: 'useDeferredValue accepts a value and returns a new copy of that value that will defer updating to keep user interactions snappy.',
        },
        {
          id: 'q2',
          question: 'Consider this code: `useEffect(() => { const sub = api.subscribe(); return () => sub.unsubscribe(); }, [])`. What is the purpose of the returned function?',
          options: [
            'It handles initial component mounting errors',
            'It is the cleanup function that prevents memory leaks when the component unmounts',
            'It triggers a re-render when dependencies change',
            'It caches the subscription result in the browser session',
          ],
          correctIndex: 1,
          explanation: 'The returned function in useEffect serves as the cleanup phase, ensuring subscriptions and listeners are cancelled on unmount.',
        },
        {
          id: 'q3',
          question: 'When should you choose `useReducer` over `useState` in a React application?',
          options: [
            'Only when you need asynchronous operations inside components',
            'When the state logic is complex, involves multiple sub-values, or when next state depends on previous state',
            'Whenever you want to completely avoid component re-renders',
            'When you are fetching data from an external REST API only',
          ],
          correctIndex: 1,
          explanation: 'useReducer is preferred for managing complex state transitions and maintaining clean predictable actions across multi-step flows.',
        },
        {
          id: 'q4',
          question: 'What is the primary advantage of React Server Components (RSC) compared to traditional client-side rendering?',
          options: [
            'They eliminate the need for any CSS styling',
            'They run exclusively on the server, zeroing out client bundle size for those components and reducing waterfall data requests',
            'They disable browser security headers automatically',
            'They convert all state into LocalStorage automatically',
          ],
          correctIndex: 1,
          explanation: 'RSC allows components to execute on the server without shipping extra JavaScript to the client bundle.',
        },
      ]),
    },
    {
      title: 'Node.js REST API & Architecture Challenge',
      skill: 'Node.js',
      difficulty: 'Intermediate',
      timeLimitMinutes: 20,
      passingScore: 70,
      description: 'Evaluates asynchronous patterns, Express middleware chaining, error propagation, and JWT authentication security.',
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'In Express.js, what is the mandatory signature for an error-handling middleware?',
          options: [
            '(req, res, next)',
            '(err, req, res, next)',
            '(err, req, res)',
            '(req, res, err)',
          ],
          correctIndex: 1,
          explanation: 'Express recognizes error middleware specifically when it accepts exactly four arguments: (err, req, res, next).',
        },
        {
          id: 'q2',
          question: 'Which method should be used to protect JWT authentication cookies against Cross-Site Scripting (XSS)?',
          options: [
            'Storing tokens in localStorage',
            'Setting the cookie with `HttpOnly` and `SameSite=Strict` flags',
            'Encoding the token in Base64',
            'Sending the token in the URL query string',
          ],
          correctIndex: 1,
          explanation: 'HttpOnly cookies cannot be accessed by client-side JavaScript, effectively safeguarding against token theft via XSS.',
        },
        {
          id: 'q3',
          question: 'What happens if an asynchronous error is thrown inside an Express route handler without a try-catch block or express-async-errors wrapper?',
          options: [
            'Express immediately retries the request 3 times',
            'The response hangs or the Node.js process triggers an unhandledRejection',
            'The client receives a 200 OK with null body',
            'Express defaults to a 404 Not Found response',
          ],
          correctIndex: 1,
          explanation: 'In standard Express 4, unhandled promise rejections are not automatically forwarded to next(err) unless caught or properly handled.',
        },
        {
          id: 'q4',
          question: 'Why should CPU-intensive operations (e.g. heavy image processing) be avoided on the main Node.js event loop thread?',
          options: [
            'Because Node.js does not support functions longer than 100 lines',
            'Because blocking the event loop stalls all incoming concurrent I/O requests for other users',
            'Because it forces Node.js to switch from 64-bit to 32-bit mode',
            'Because the operating system will instantly terminate Node.js',
          ],
          correctIndex: 1,
          explanation: 'Node.js runs single-threaded for JavaScript execution; blocking the event loop blocks all other concurrent requests.',
        },
      ]),
    },
    {
      title: 'TypeScript Type Safety & Modern Patterns',
      skill: 'TypeScript',
      difficulty: 'Advanced',
      timeLimitMinutes: 25,
      passingScore: 70,
      description: 'Tests utility types, Discriminated Unions, Generics, and strict null check compliance.',
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'What is the purpose of TypeScript Discriminated Unions?',
          options: [
            'To combine multiple CSS classes dynamically',
            'To model variants with a common literal tag property, allowing TypeScript to narrow types precisely in switch/if blocks',
            'To disable strict type checking in legacy code',
            'To speed up compiler execution by omitting interface validation',
          ],
          correctIndex: 1,
          explanation: 'A discriminated union uses a common literal discriminant property to give complete type safety across multiple variant shapes.',
        },
        {
          id: 'q2',
          question: 'Which TypeScript built-in utility type constructs a type with all properties of T set to optional?',
          options: [
            'Partial<T>',
            'Pick<T, K>',
            'Omit<T, K>',
            'Record<K, T>',
          ],
          correctIndex: 0,
          explanation: 'Partial<T> transforms all properties of T into optional properties.',
        },
        {
          id: 'q3',
          question: 'What is the key difference between `unknown` and `any` in TypeScript?',
          options: [
            'There is no difference; they are aliases',
            '`unknown` enforces type checking or narrowing before you can perform operations on it, whereas `any` disables type checking entirely',
            '`any` is safer than `unknown`',
            '`unknown` can only hold primitive numbers',
          ],
          correctIndex: 1,
          explanation: '`unknown` is the type-safe counterpart of `any`. You cannot call methods or access properties on an unknown value without first narrowing it.',
        },
        {
          id: 'q4',
          question: 'What does the `keyof` operator return in TypeScript?',
          options: [
            'The runtime keys of an object in an array',
            'A union type of string or numeric literal representation of an object type\'s keys',
            'A cryptographic hash of the type declaration',
            'The total count of properties in an interface',
          ],
          correctIndex: 1,
          explanation: '`keyof T` produces a union of string or numeric literals representing the property names of type T.',
        },
      ]),
    },
    {
      title: 'SQL & Relational Schema Optimization',
      skill: 'PostgreSQL',
      difficulty: 'Intermediate',
      timeLimitMinutes: 20,
      passingScore: 70,
      description: 'Covers indexing strategies, query execution analysis (EXPLAIN ANALYZE), normalization, and connection pooling.',
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'When analyzing slow PostgreSQL queries, which command displays the actual execution plan along with real execution times and row counts?',
          options: [
            'EXPLAIN ANALYZE SELECT ...',
            'OPTIMIZE TABLE ...',
            'SHOW PROFILE ...',
            'CHECK STATS ...',
          ],
          correctIndex: 0,
          explanation: 'EXPLAIN ANALYZE actually executes the query and returns the detailed cost, time, and row count metrics for each node in the plan.',
        },
        {
          id: 'q2',
          question: 'What is the primary risk of adding too many secondary B-Tree indexes on a high-write table?',
          options: [
            'The table becomes read-only',
            'INSERT, UPDATE, and DELETE operations become slower because every index must be maintained on each write',
            'Foreign keys become disabled',
            'PostgreSQL restricts transaction isolation to READ UNCOMMITTED',
          ],
          correctIndex: 1,
          explanation: 'While indexes speed up lookups, each write requires the DBMS to update index structures, increasing write overhead and disk usage.',
        },
        {
          id: 'q3',
          question: 'What problem does connection pooling (such as PgBouncer) solve in high-concurrency Node.js + PostgreSQL architectures?',
          options: [
            'It auto-encrypts all database columns',
            'It reuses existing database connections, preventing the overhead of creating new heavy OS-level backend processes per request',
            'It replaces SQL with GraphQL automatically',
            'It eliminates the need for database backups',
          ],
          correctIndex: 1,
          explanation: 'PostgreSQL forks a process per connection. Connection poolers manage a warm pool of connections, avoiding thread/process exhaustion.',
        },
      ]),
    },
    {
      title: 'System Design & Distributed Scalability',
      skill: 'System Design',
      difficulty: 'Intermediate',
      timeLimitMinutes: 25,
      passingScore: 70,
      description: 'Tests caching strategies, horizontal scaling, asynchronous messaging, and idempotency in enterprise platforms.',
      questions: JSON.stringify([
        {
          id: 'q1',
          question: 'Which caching strategy writes data directly to the cache and the permanent database simultaneously in the same transaction?',
          options: [
            'Write-through cache',
            'Write-back (Write-behind) cache',
            'Cache-aside (Lazy loading)',
            'Read-only cache',
          ],
          correctIndex: 0,
          explanation: 'In Write-Through caching, data is written into both cache and database concurrently, ensuring consistency at the cost of higher write latency.',
        },
        {
          id: 'q2',
          question: 'Why are idempotent operations critical when designing webhook or payment processing endpoints in distributed systems?',
          options: [
            'To ensure that duplicate requests (due to retries or network blips) do not result in repeated duplicate transactions or inconsistent states',
            'To prevent users from logging out',
            'To automatically gzip API responses',
            'To bypass CORS verification',
          ],
          correctIndex: 0,
          explanation: 'Network timeouts often cause callers to retry; an idempotent endpoint produces the same outcome no matter how many times the exact request repeats.',
        },
        {
          id: 'q3',
          question: 'What is the primary trade-off highlighted by the CAP theorem in distributed data storage systems?',
          options: [
            'In the presence of a network partition (P), a distributed system must choose between Consistency (C) and Availability (A)',
            'Cost vs Capacity',
            'Bandwidth vs Latency',
            'Security vs Speed',
          ],
          correctIndex: 0,
          explanation: 'CAP states that when network partitions inevitably occur, a system can either stay consistent (rejecting stale reads) or available (returning best-effort data).',
        },
      ]),
    },
  ];

  for (const a of assessmentsData) {
    const assessment = await prisma.assessment.create({ data: a });
    // Link an initial passing submission for candidate Priya Sharma to show verified status
    if (a.skill === 'React') {
      await prisma.submission.create({
        data: {
          assessmentId: assessment.id,
          candidateId: candidateUser.candidateProfile.id,
          score: 94,
          status: 'PASSED',
          answers: JSON.stringify({ q1: 0, q2: 1, q3: 1, q4: 1 }),
          feedback: 'Outstanding mastery of React 18 concurrent features and lifecycle management.',
        },
      });
    }
  }
  console.log(`✓ Seeded ${assessmentsData.length} practical assessments with interactive question banks`);

  console.log('\n=============================================');
  console.log('🎉 SkilBridge Demo Database Seeded Successfully!');
  console.log('=============================================');
  console.log('Demo Candidate:');
  console.log('  Email:    candidate@skilbridge.com');
  console.log('  Password: Candidate123!');
  console.log('Demo Employer:');
  console.log('  Email:    employer@techcorp.com');
  console.log('  Password: Employer123!');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
