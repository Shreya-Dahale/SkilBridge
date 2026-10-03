import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');

const target = process.argv[2]?.toLowerCase();

if (target === 'sqlite') {
  const sqliteSchema = fs.readFileSync(path.join(backendDir, 'prisma', 'schema.sqlite.prisma'), 'utf-8');
  fs.writeFileSync(path.join(backendDir, 'prisma', 'schema.prisma'), sqliteSchema);
  
  const envPath = path.join(backendDir, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }
  const sqliteUrl = 'DATABASE_URL="file:./dev.db"';
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(/DATABASE_URL=.*/g, sqliteUrl);
  } else {
    envContent = sqliteUrl + '\n' + envContent;
  }
  fs.writeFileSync(envPath, envContent);
  console.log('Switched to SQLite (file:./dev.db)');
} else if (target === 'pg' || target === 'postgres' || target === 'postgresql') {
  const pgSchemaContent = `// Prisma Schema for SkilBridge - Evidence-Based Career Re-entry Platform
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CANDIDATE
  EMPLOYER
}

model User {
  id               String            @id @default(uuid())
  name             String
  email            String            @unique
  password         String
  role             Role              @default(CANDIDATE)
  createdAt        DateTime          @default(now())
  candidateProfile CandidateProfile?
  employerProfile  EmployerProfile?
}

model CandidateProfile {
  id               String           @id @default(uuid())
  userId           String           @unique
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone            String?
  location         String?
  targetRole       String?
  careerBreakYears Float            @default(0)
  bio              String?
  profilePhoto     String?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  careerHistories  CareerHistory[]
  candidateSkills  CandidateSkill[]
  submissions      Submission[]
  evidences        Evidence[]
  sharedProfiles   SharedProfile[]
}

model EmployerProfile {
  id                 String          @id @default(uuid())
  userId             String          @unique
  user               User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName        String
  industry           String?
  location           String?
  companyDescription String?
  website            String?
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
  jobs               Job[]
  sharedProfiles     SharedProfile[]
}

model CareerHistory {
  id          String           @id @default(uuid())
  candidateId String
  candidate   CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  company     String
  role        String
  startDate   String
  endDate     String?
  description String?
  createdAt   DateTime         @default(now())
}

model Skill {
  id              String           @id @default(uuid())
  name            String           @unique
  category        String
  candidateSkills CandidateSkill[]
  jobSkills       JobSkill[]
}

model CandidateSkill {
  id              String           @id @default(uuid())
  candidateId     String
  candidate       CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  skillId         String
  skill           Skill            @relation(fields: [skillId], references: [id], onDelete: Cascade)
  yearsExperience Float            @default(0)
  status          String           @default("NEEDS_REFRESH")
  selfRating      Int              @default(3)
  createdAt       DateTime         @default(now())

  @@unique([candidateId, skillId])
}

model Job {
  id                 String          @id @default(uuid())
  employerId         String
  employer           EmployerProfile @relation(fields: [employerId], references: [id], onDelete: Cascade)
  title              String
  description        String
  location           String
  experienceRequired String
  status             String          @default("OPEN")
  salaryRange        String?
  workMode           String?         @default("Hybrid")
  createdAt          DateTime        @default(now())
  updatedAt          DateTime        @updatedAt
  jobSkills          JobSkill[]
}

model JobSkill {
  id        String  @id @default(uuid())
  jobId     String
  job       Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  skillId   String
  skill     Skill   @relation(fields: [skillId], references: [id], onDelete: Cascade)
  required  Boolean @default(true)
  preferred Boolean @default(false)

  @@unique([jobId, skillId])
}

model Assessment {
  id               String       @id @default(uuid())
  title            String
  description      String
  skill            String
  difficulty       String
  timeLimitMinutes Int          @default(20)
  passingScore     Int          @default(70)
  questions        String
  createdAt        DateTime     @default(now())
  submissions      Submission[]
}

model Submission {
  id           String           @id @default(uuid())
  assessmentId String
  assessment   Assessment       @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  candidateId  String
  candidate    CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  score        Float
  status       String
  submittedAt  DateTime         @default(now())
  answers      String?
  feedback     String?
}

model Evidence {
  id              String           @id @default(uuid())
  candidateId     String
  candidate       CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  skill           String
  evidenceType    String
  description     String
  score           Float            @default(85)
  status          String           @default("VERIFIED")
  verificationUrl String?
  verifiedAt      DateTime         @default(now())
}

model SharedProfile {
  id          String           @id @default(uuid())
  candidateId String
  candidate   CandidateProfile @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  employerId  String
  employer    EmployerProfile  @relation(fields: [employerId], references: [id], onDelete: Cascade)
  sharedAt    DateTime         @default(now())
  permissions String           @default("FULL_EVIDENCE_ACCESS")
  status      String           @default("ACTIVE")
  note        String?

  @@unique([candidateId, employerId])
}
`;
  fs.writeFileSync(path.join(backendDir, 'prisma', 'schema.prisma'), pgSchemaContent);
  console.log('Switched to PostgreSQL');
} else {
  console.log('Usage: node scripts/switch-db.js [sqlite|pg]');
}
