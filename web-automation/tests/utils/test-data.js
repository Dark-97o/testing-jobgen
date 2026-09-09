/**
 * Comprehensive Dataset for Production Fuzzing, Combinatorics & Crawl Suite
 * Target: https://candidates.jobgen.ai/
 */

export const AUSTRALIAN_LOCATIONS = [
  'Sydney',
  'Melbourne',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Canberra',
  'Gold Coast',
  'Hobart',
  'Darwin',
  'Sunshine Coast',
  'Wollongong',
  'Newcastle',
  'Geelong',
  'Townsville',
  'Cairns'
];

export const GLOBAL_LOCATIONS = [
  'San Francisco, CA',
  'London, UK',
  'Toronto, ON, Canada',
  'Singapore',
  'New York, NY',
  'Tokyo, Japan',
  'Berlin, Germany',
  'Remote',
  'Paris, France',
  'Sydney, Australia'
];

export const JOB_TITLES = [
  'Software Engineer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'Frontend Developer',
  'QA Automation Engineer',
  'Cyber Security Analyst',
  'Mobile Developer',
  'Cloud Architect',
  'Systems Engineer',
  'Solutions Architect',
  'Machine Learning Engineer',
  'UI/UX Designer',
  'Scrum Master',
  'Engineering Manager',
  'Backend Developer',
  'Tech Lead',
  'Technical Writer',
  'Business Analyst'
];

export const FUZZ_STRINGS = [
  // Profanity & inappropriate word checks
  'damn',
  'hell',
  'crap',
  'fool',
  'idiot',
  'stupid',
  'bastard',
  'rubbish',
  'nonsense',
  'badword1',
  'badword2',
  
  // Boundary & Injection Checks
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '\' OR \'1\'=\'1',
  'SELECT * FROM users;',
  'DROP TABLE candidates;',
  '${7*7}',
  '../../../../etc/passwd',
  'C:\\Windows\\System32\\cmd.exe',
  'NULL',
  'undefined',
  'NaN',
  
  // Unicode & Emoji Test
  '🚀🔥💯 Senior Dev @ JobGen 🎉✨',
  '測試工程師 Tester 中文',
  'Øæåñµßçñ',
  
  // Extreme Lengths
  'A'.repeat(500),
  
  // Special Characters
  '!@#$%^&*()_+-=[]{}|;:\'",.<>/?~`'
];

export const INVALID_URLS = [
  'not-a-url',
  'ftp://invalid-domain',
  'htt://missing-p',
  'javascript:alert(1)',
  'http://',
  'www.'
];

export const VALID_URLS = [
  'https://google.com',
  'https://linkedin.com/in/testuser',
  'https://github.com/testuser',
  'https://jobgen.ai'
];

export const RESUME_SECTION_VARIATIONS = {
  personalInfo: [
    { name: 'Subhranil Tech', email: 'subhranil.test@example.com', phone: '+61 400 123 456', summary: 'Passionate Software Engineer specializing in Playwright automation.' },
    { name: 'Alex Smith', email: 'alex.smith.qa@domain.io', phone: '+1 555 019 2831', summary: 'Senior QA Specialist with 8+ years of test automation experience.' },
    { name: '<script>alert(1)</script>', email: 'invalid-email-test', phone: '0000000000', summary: 'A'.repeat(300) }
  ],
  skills: [
    'JavaScript, TypeScript, Playwright, Node.js, React, Next.js, HTML5, CSS3, TailwindCSS',
    'Python, PyTest, Selenium, Docker, Kubernetes, AWS, CI/CD, GitHub Actions',
    'SQL, PostgreSQL, MongoDB, GraphQL, REST APIs, Jest, Cypress, Git, Agile'
  ]
};

export const SUPPORT_CHAT_QUERIES = [
  'How do I tailor my resume for ATS compliance on JobGen?',
  'What is the difference between Free and Pro pricing plans?',
  'How does the JobGen Chrome Extension automatically save jobs?',
  'Can I export my tracked job applications to CSV or Excel?',
  'How do I set up automated interview prep questions?'
];
