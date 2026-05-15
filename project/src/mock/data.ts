export type UserRole = 'HR' | 'Manager' | 'Employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
  managerId?: string;
}

export interface Review {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Acknowledged';
  overallScore: number;
  goals: Goal[];
  competencyScores: CompetencyScore[];
  submittedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'At Risk';
  weight: number;
}

export interface CompetencyScore {
  competencyId: string;
  name: string;
  current: number;
  target: number;
}

export interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
  levels: {
    level: number;
    label: string;
    description: string;
  }[];
  applicableRoles: string[];
}

export interface DevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  targetRole: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed' | 'On Hold';
  overallProgress: number;
  milestones: Milestone[];
  trainings: TrainingRecord[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface TrainingRecord {
  id: string;
  title: string;
  provider: string;
  type: 'Course' | 'Certification' | 'Workshop' | 'Mentoring';
  status: 'Planned' | 'In Progress' | 'Completed';
  completedDate?: string;
  score?: number;
  credentialUrl?: string;
}

export interface FeedbackLog {
  id: string;
  from: string;
  message: string;
  sentiment: 'positive' | 'neutral' | 'constructive';
  date: string;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alexandra Chen', email: 'admin@hrms.com', role: 'HR', department: 'HR', title: 'HR Director', avatar: 'AC' },
  { id: 'u2', name: 'Marcus Thompson', email: 'hr@hrms.com', role: 'HR', department: 'HR', title: 'HR Business Partner', avatar: 'MT' },
  { id: 'u3', name: 'Sarah Williams', email: 'manager@hrms.com', role: 'Manager', department: 'Engineering', title: 'Engineering Manager', avatar: 'SW' },
  { id: 'u4', name: 'James Okafor', email: 'employee@hrms.com', role: 'Employee', department: 'Engineering', title: 'Senior Software Engineer', avatar: 'JO', managerId: 'u3' },
  { id: 'u5', name: 'Priya Sharma', email: 'priya@hrms.com', role: 'Employee', department: 'Engineering', title: 'Software Engineer', avatar: 'PS', managerId: 'u3' },
  { id: 'u6', name: 'Daniel Park', email: 'daniel@hrms.com', role: 'Employee', department: 'Engineering', title: 'Frontend Developer', avatar: 'DP', managerId: 'u3' },
  { id: 'u7', name: 'Olivia Martinez', email: 'olivia@hrms.com', role: 'Employee', department: 'Product', title: 'Product Manager', avatar: 'OM' },
  { id: 'u8', name: 'Ethan Brooks', email: 'ethan@hrms.com', role: 'Employee', department: 'Design', title: 'UX Designer', avatar: 'EB' },
];

export const DEMO_ACCOUNTS = [
  { email: 'admin@hrms.com', password: 'admin123', role: 'HR' as UserRole },
  { email: 'hr@hrms.com', password: 'hr123', role: 'HR' as UserRole },
  { email: 'manager@hrms.com', password: 'manager123', role: 'Manager' as UserRole },
  { email: 'employee@hrms.com', password: 'employee123', role: 'Employee' as UserRole },
];

export const MOCK_COMPETENCIES: Competency[] = [
  {
    id: 'c1', name: 'Technical Expertise', category: 'Technical',
    description: 'Depth and breadth of technical knowledge relevant to role',
    levels: [
      { level: 1, label: 'Foundational', description: 'Basic understanding, requires guidance' },
      { level: 2, label: 'Developing', description: 'Applies knowledge independently on routine tasks' },
      { level: 3, label: 'Proficient', description: 'Applies knowledge to complex problems, mentors others' },
      { level: 4, label: 'Expert', description: 'Recognized expert, shapes strategy and architecture' },
    ],
    applicableRoles: ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager'],
  },
  {
    id: 'c2', name: 'Communication', category: 'Core',
    description: 'Clarity and effectiveness in written and verbal communication',
    levels: [
      { level: 1, label: 'Foundational', description: 'Communicates basic information clearly' },
      { level: 2, label: 'Developing', description: 'Adapts communication style for audience' },
      { level: 3, label: 'Proficient', description: 'Facilitates complex discussions, influences stakeholders' },
      { level: 4, label: 'Expert', description: 'Executive-level communication, organizational thought leader' },
    ],
    applicableRoles: ['All'],
  },
  {
    id: 'c3', name: 'Leadership', category: 'Leadership',
    description: 'Ability to guide, inspire, and develop team members',
    levels: [
      { level: 1, label: 'Foundational', description: 'Leads self effectively' },
      { level: 2, label: 'Developing', description: 'Informal leadership, guides peers' },
      { level: 3, label: 'Proficient', description: 'Manages a team, fosters growth' },
      { level: 4, label: 'Expert', description: 'Builds high-performing organizations' },
    ],
    applicableRoles: ['Engineering Manager', 'HR Director', 'Product Manager'],
  },
  {
    id: 'c4', name: 'Problem Solving', category: 'Core',
    description: 'Analytical thinking and creative solution development',
    levels: [
      { level: 1, label: 'Foundational', description: 'Solves defined, structured problems' },
      { level: 2, label: 'Developing', description: 'Handles ambiguous problems with some guidance' },
      { level: 3, label: 'Proficient', description: 'Tackles complex, multi-faceted problems independently' },
      { level: 4, label: 'Expert', description: 'Reframes problem spaces, drives systemic solutions' },
    ],
    applicableRoles: ['All'],
  },
  {
    id: 'c5', name: 'Collaboration', category: 'Core',
    description: 'Effectiveness working within and across teams',
    levels: [
      { level: 1, label: 'Foundational', description: 'Participates constructively in team settings' },
      { level: 2, label: 'Developing', description: 'Proactively shares information, supports team goals' },
      { level: 3, label: 'Proficient', description: 'Builds cross-functional relationships, drives alignment' },
      { level: 4, label: 'Expert', description: 'Creates collaborative culture across organization' },
    ],
    applicableRoles: ['All'],
  },
  {
    id: 'c6', name: 'Innovation', category: 'Technical',
    description: 'Generating creative ideas and driving improvements',
    levels: [
      { level: 1, label: 'Foundational', description: 'Suggests incremental improvements' },
      { level: 2, label: 'Developing', description: 'Proposes new approaches within own domain' },
      { level: 3, label: 'Proficient', description: 'Leads innovation initiatives with measurable impact' },
      { level: 4, label: 'Expert', description: 'Shapes innovation strategy for the organization' },
    ],
    applicableRoles: ['Software Engineer', 'Senior Software Engineer', 'Product Manager'],
  },
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1', employeeId: 'u4', employeeName: 'James Okafor', reviewerId: 'u3', reviewerName: 'Sarah Williams',
    period: 'Annual', status: 'Completed', overallScore: 4.2,
    goals: [
      { id: 'g1', title: 'Lead microservices migration', description: 'Migrate monolith to microservices', progress: 90, dueDate: '2024-12-31', status: 'Completed', weight: 40 },
      { id: 'g2', title: 'Mentor junior engineers', description: 'Provide weekly 1:1s and code reviews', progress: 100, dueDate: '2024-12-31', status: 'Completed', weight: 30 },
      { id: 'g3', title: 'AWS Solutions Architect cert', description: 'Complete AWS certification', progress: 75, dueDate: '2024-12-31', status: 'In Progress', weight: 30 },
    ],
    competencyScores: [
      { competencyId: 'c1', name: 'Technical Expertise', current: 3.5, target: 4 },
      { competencyId: 'c2', name: 'Communication', current: 3, target: 3.5 },
      { competencyId: 'c3', name: 'Leadership', current: 2.5, target: 3 },
      { competencyId: 'c4', name: 'Problem Solving', current: 4, target: 4 },
      { competencyId: 'c5', name: 'Collaboration', current: 3.5, target: 3.5 },
      { competencyId: 'c6', name: 'Innovation', current: 3, target: 3.5 },
    ],
    submittedAt: '2024-12-20',
  },
  {
    id: 'r2', employeeId: 'u4', employeeName: 'James Okafor', reviewerId: 'u3', reviewerName: 'Sarah Williams',
    period: 'Mid-Year', status: 'Acknowledged', overallScore: 3.8,
    goals: [
      { id: 'g4', title: 'API gateway implementation', description: 'Design and implement API gateway', progress: 100, dueDate: '2024-06-30', status: 'Completed', weight: 50 },
      { id: 'g5', title: 'Code quality improvement', description: 'Achieve >80% test coverage', progress: 85, dueDate: '2024-06-30', status: 'Completed', weight: 50 },
    ],
    competencyScores: [
      { competencyId: 'c1', name: 'Technical Expertise', current: 3.2, target: 3.5 },
      { competencyId: 'c2', name: 'Communication', current: 2.8, target: 3 },
      { competencyId: 'c3', name: 'Leadership', current: 2, target: 2.5 },
      { competencyId: 'c4', name: 'Problem Solving', current: 3.8, target: 4 },
      { competencyId: 'c5', name: 'Collaboration', current: 3.2, target: 3.5 },
      { competencyId: 'c6', name: 'Innovation', current: 2.8, target: 3 },
    ],
    submittedAt: '2024-06-28',
  },
  {
    id: 'r3', employeeId: 'u5', employeeName: 'Priya Sharma', reviewerId: 'u3', reviewerName: 'Sarah Williams',
    period: 'Annual', status: 'In Progress', overallScore: 0,
    goals: [
      { id: 'g6', title: 'React performance optimization', description: 'Reduce bundle size by 30%', progress: 60, dueDate: '2024-12-31', status: 'In Progress', weight: 50 },
      { id: 'g7', title: 'Design system contribution', description: 'Contribute 5 reusable components', progress: 40, dueDate: '2024-12-31', status: 'In Progress', weight: 50 },
    ],
    competencyScores: [
      { competencyId: 'c1', name: 'Technical Expertise', current: 2.5, target: 3 },
      { competencyId: 'c2', name: 'Communication', current: 3, target: 3.5 },
      { competencyId: 'c3', name: 'Leadership', current: 1.5, target: 2 },
      { competencyId: 'c4', name: 'Problem Solving', current: 3, target: 3.5 },
      { competencyId: 'c5', name: 'Collaboration', current: 3.5, target: 4 },
      { competencyId: 'c6', name: 'Innovation', current: 2.5, target: 3 },
    ],
  },
  {
    id: 'r4', employeeId: 'u6', employeeName: 'Daniel Park', reviewerId: 'u3', reviewerName: 'Sarah Williams',
    period: 'Annual', status: 'Draft', overallScore: 0,
    goals: [
      { id: 'g8', title: 'Accessibility audit', description: 'WCAG 2.1 AA compliance', progress: 25, dueDate: '2024-12-31', status: 'In Progress', weight: 60 },
      { id: 'g9', title: 'Component library', description: 'Document all shared components', progress: 10, dueDate: '2024-12-31', status: 'Not Started', weight: 40 },
    ],
    competencyScores: [
      { competencyId: 'c1', name: 'Technical Expertise', current: 2, target: 3 },
      { competencyId: 'c2', name: 'Communication', current: 2.5, target: 3 },
      { competencyId: 'c3', name: 'Leadership', current: 1, target: 2 },
      { competencyId: 'c4', name: 'Problem Solving', current: 2.5, target: 3 },
      { competencyId: 'c5', name: 'Collaboration', current: 3, target: 3.5 },
      { competencyId: 'c6', name: 'Innovation', current: 2, target: 3 },
    ],
  },
];

export const MOCK_DEVELOPMENT_PLANS: DevelopmentPlan[] = [
  {
    id: 'dp1', employeeId: 'u4', employeeName: 'James Okafor',
    title: 'Path to Staff Engineer', targetRole: 'Staff Software Engineer',
    startDate: '2024-01-01', endDate: '2025-06-30', status: 'Active', overallProgress: 62,
    milestones: [
      { id: 'm1', title: 'Complete system design course', dueDate: '2024-03-31', completed: true },
      { id: 'm2', title: 'Lead first cross-team project', dueDate: '2024-06-30', completed: true },
      { id: 'm3', title: 'Achieve AWS certification', dueDate: '2024-12-31', completed: false },
      { id: 'm4', title: 'Present at internal tech talk', dueDate: '2025-02-28', completed: false },
      { id: 'm5', title: 'Mentor 2 junior engineers to promotion', dueDate: '2025-06-30', completed: false },
    ],
    trainings: [
      { id: 't1', title: 'Distributed Systems Design', provider: 'Coursera', type: 'Course', status: 'Completed', completedDate: '2024-02-15', score: 94 },
      { id: 't2', title: 'AWS Solutions Architect Associate', provider: 'AWS', type: 'Certification', status: 'In Progress' },
      { id: 't3', title: 'Tech Lead Workshop', provider: 'Internal L&D', type: 'Workshop', status: 'Completed', completedDate: '2024-05-20' },
      { id: 't4', title: 'Executive Mentoring Program', provider: 'Internal', type: 'Mentoring', status: 'In Progress' },
    ],
  },
  {
    id: 'dp2', employeeId: 'u5', employeeName: 'Priya Sharma',
    title: 'Senior Engineer Readiness', targetRole: 'Senior Software Engineer',
    startDate: '2024-04-01', endDate: '2025-03-31', status: 'Active', overallProgress: 35,
    milestones: [
      { id: 'm6', title: 'Complete React Advanced Patterns', dueDate: '2024-06-30', completed: true },
      { id: 'm7', title: 'Lead first feature end-to-end', dueDate: '2024-09-30', completed: false },
      { id: 'm8', title: 'Pass performance calibration at Senior level', dueDate: '2025-03-31', completed: false },
    ],
    trainings: [
      { id: 't5', title: 'Advanced React Patterns', provider: 'Frontend Masters', type: 'Course', status: 'Completed', completedDate: '2024-05-30', score: 88 },
      { id: 't6', title: 'TypeScript Deep Dive', provider: 'Udemy', type: 'Course', status: 'In Progress' },
      { id: 't7', title: 'Agile Practitioner Certification', provider: 'PMI', type: 'Certification', status: 'Planned' },
    ],
  },
  {
    id: 'dp3', employeeId: 'u6', employeeName: 'Daniel Park',
    title: 'Frontend Specialist Track', targetRole: 'Senior Frontend Developer',
    startDate: '2024-07-01', endDate: '2025-12-31', status: 'Active', overallProgress: 18,
    milestones: [
      { id: 'm9', title: 'Complete accessibility certification', dueDate: '2024-12-31', completed: false },
      { id: 'm10', title: 'Build and ship design system v2', dueDate: '2025-06-30', completed: false },
    ],
    trainings: [
      { id: 't8', title: 'Web Accessibility (WCAG)', provider: 'Deque University', type: 'Certification', status: 'In Progress' },
      { id: 't9', title: 'Advanced CSS & Animations', provider: 'CSS-Tricks', type: 'Course', status: 'Planned' },
    ],
  },
];

export const MOCK_FEEDBACK: FeedbackLog[] = [
  { id: 'f1', from: 'Sarah Williams', message: 'James did an exceptional job leading the migration sprint. His technical depth and ability to unblock the team were standout.', sentiment: 'positive', date: '2024-11-15' },
  { id: 'f2', from: 'David Kim', message: 'Great collaboration on the API design. James was receptive to feedback and iterated quickly.', sentiment: 'positive', date: '2024-10-28' },
  { id: 'f3', from: 'Sarah Williams', message: 'Would benefit from more proactive status updates in Slack. The team was waiting for context a few times this sprint.', sentiment: 'constructive', date: '2024-10-10' },
  { id: 'f4', from: 'Elena Torres', message: 'The code review turnaround time has improved significantly. Much appreciated.', sentiment: 'positive', date: '2024-09-22' },
  { id: 'f5', from: 'Marcus Thompson', message: 'Demonstrated strong ownership during the incident last month. Reliable team member.', sentiment: 'positive', date: '2024-09-05' },
];

export const PERFORMANCE_HISTORY = [
  { period: 'Mid-Year', score: 3.8 },
  { period: 'Annual', score: 4.2 },
];
