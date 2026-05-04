export interface Job {
  id: string;
  slug?: string;
  title: string;
  department: string;
  type: 'job' | 'admit-card' | 'result' | 'answer-key' | 'admission';
  lastDate?: string;
  postDate: string;
  createdAt?: string;
  shortInfo: string;
  qualification?: string;
  state?: string;
  category?: string;
  vacancyDetails: {
    postName: string;
    totalPost: string;
    eligibility: string;
  }[];
  applicationFee: {
    category: string;
    fee: string;
  }[];
  importantDates: {
    label: string;
    date: string;
  }[];
  ageLimit: {
    category: string;
    minAge: string;
    maxAge: string;
  }[];
  eligibilityDetails: string;
  selectionProcess: string[];
  physicalEligibility: {
    criteria: string;
    male: string;
    female: string;
  }[];
  links: {
    label: string;
    url: string;
  }[];
  featured?: boolean;
  trending?: boolean;
  rawJobContent?: string;
  applyOnlineUrl?: string;
  admitCardUrl?: string;
  resultUrl?: string;
  answerKeyUrl?: string;
  notificationUrl?: string;
  officialWebsiteUrl?: string;
  importantDatesHtml?: string;
  applicationFeeHtml?: string;
  ageLimitHtml?: string;
  vacancyDetailsHtml?: string;
  physicalStandardHtml?: string;
  physicalEfficiencyHtml?: string;
  selectionProcessHtml?: string;
  importantLinksHtml?: string;
}

export const initialJobs: Job[] = [
  {
    id: "hssc-haryana-police-constable-2026",
    slug: "hssc-haryana-police-constable-recruitment-2026",
    title: "HSSC Haryana Police Constable Recruitment 2026",
    department: "Haryana Staff Selection Commission (HSSC)",
    type: "job",
    qualification: "12th Pass",
    state: "Haryana",
    category: "Police",
    lastDate: "25/01/2026",
    postDate: "06/01/2026",
    shortInfo: "Haryana Staff Selection Commission (HSSC) has released notification for recruitment of 5500 Police Constable posts for 12th pass candidates.",
    vacancyDetails: [
      { postName: "Constable GD (Male)", totalPost: "4500", eligibility: "12th Pass" },
      { postName: "Constable GD (Female)", totalPost: "600", eligibility: "12th Pass" },
      { postName: "Constable GD (GRP)", totalPost: "400", eligibility: "12th Pass" }
    ],
    applicationFee: [
      { category: "General / OBC / SC / ST / Female", fee: "0" }
    ],
    importantDates: [
      { label: "Application Start", date: "11/01/2026" },
      { label: "Last Date", date: "25/01/2026" },
      { label: "Exam Date", date: "To Be Notified" }
    ],
    ageLimit: [
      { category: "General", minAge: "18", maxAge: "25" },
      { category: "OBC", minAge: "18", maxAge: "28" },
      { category: "SC/ST", minAge: "18", maxAge: "30" }
    ],
    eligibilityDetails: "Candidates must have passed 12th or equivalent from a recognized board. Must be a citizen of India.",
    selectionProcess: ["Written Examination", "Physical Standard Test (PST)", "Physical Efficiency Test (PET)", "Document Verification", "Medical Examination"],
    physicalEligibility: [
      { criteria: "Height (General)", male: "170 cm", female: "158 cm" },
      { criteria: "Height (Reserved)", male: "168 cm", female: "156 cm" },
      { criteria: "Chest (General)", male: "83-87 cm", female: "N/A" },
      { criteria: "Running", male: "2.5 KM in 12 Min", female: "1 KM in 6 Min" }
    ],
    links: [
      { label: "Apply Online", url: "https://hssc.gov.in" },
      { label: "Download Notification PDF", url: "https://hssc.gov.in" },
      { label: "Official Website", url: "https://hssc.gov.in" }
    ],
    featured: true,
    trending: true
  },
  {
    id: "1",
    title: "SSC CGL 2025 Online Form",
    department: "Staff Selection Commission (SSC)",
    type: "job",
    qualification: "Graduation",
    state: "All India",
    category: "SSC",
    lastDate: "2025-02-15",
    postDate: "2025-01-10",
    shortInfo: "Staff Selection Commission (SSC) has released the notification for Combined Graduate Level CGL Examination 2025. Candidates who are interested in this vacancy can apply online.",
    vacancyDetails: [
      { postName: "Assistant Audit Officer", totalPost: "TBA", eligibility: "Bachelor Degree in Any Stream" },
      { postName: "Inspector (Central Excise)", totalPost: "TBA", eligibility: "Bachelor Degree in Any Stream" }
    ],
    applicationFee: [
      { category: "General / OBC / EWS", fee: "100" },
      { category: "SC / ST / PH", fee: "0" },
      { category: "All Category Female", fee: "0" }
    ],
    importantDates: [
      { label: "Application Begin", date: "10/01/2025" },
      { label: "Last Date for Apply Online", date: "15/02/2025" },
      { label: "Exam Date Tier I", date: "April 2025" }
    ],
    ageLimit: [
      { category: "General", minAge: "18", maxAge: "27" }
    ],
    eligibilityDetails: "Bachelor Degree in any stream from a recognized University.",
    selectionProcess: ["Tier I (CBT)", "Tier II (CBT)", "Document Verification"],
    physicalEligibility: [],
    links: [
      { label: "Apply Online", url: "#" },
      { label: "Download Notification", url: "#" },
      { label: "Official Website", url: "#" }
    ]
  },
  {
    id: "2",
    title: "UPSC IAS / IFS Pre 2025 Online Form",
    department: "Union Public Service Commission (UPSC)",
    type: "job",
    qualification: "Graduation",
    state: "All India",
    category: "UPSC",
    lastDate: "2025-03-05",
    postDate: "2025-02-01",
    shortInfo: "Union Public Service Commission (UPSC) has invited online applications for the Civil Services IAS and Indian Forest Service IFS Preliminary Examination 2025.",
    vacancyDetails: [
      { postName: "Indian Administrative Service (IAS)", totalPost: "1056", eligibility: "Bachelor Degree in Any Stream" },
      { postName: "Indian Forest Service (IFS)", totalPost: "150", eligibility: "Bachelor Degree in Science / Engineering" }
    ],
    applicationFee: [
      { category: "General / OBC / EWS", fee: "100" },
      { category: "SC / ST / PH", fee: "0" },
      { category: "Female", fee: "0" }
    ],
    importantDates: [
      { label: "Application Begin", date: "01/02/2025" },
      { label: "Last Date", date: "05/03/2025" }
    ],
    ageLimit: [
      { category: "General", minAge: "21", maxAge: "32" }
    ],
    eligibilityDetails: "Bachelor Degree in any stream from a recognized University.",
    selectionProcess: ["Preliminary Examination", "Mains Examination", "Interview"],
    physicalEligibility: [],
    links: [
      { label: "Apply Online", url: "#" },
      { label: "Official Website", url: "#" }
    ]
  },
  {
    id: "3",
    title: "Railway RPF Constable Admit Card 2025",
    department: "Railway Protection Force (RPF)",
    type: "admit-card",
    qualification: "12th Pass",
    state: "All India",
    category: "Railway",
    postDate: "2025-01-04",
    shortInfo: "Railway Protection Force (RPF) has released the admit card for the post of Constable. Download your admit card now.",
    vacancyDetails: [],
    applicationFee: [],
    importantDates: [
      { label: "Admit Card Available", date: "04/01/2025" },
      { label: "Exam Date", date: "15/01/2025 to 20/01/2025" }
    ],
    ageLimit: [],
    eligibilityDetails: "",
    selectionProcess: [],
    physicalEligibility: [],
    links: [
      { label: "Download Admit Card", url: "#" },
      { label: "Official Website", url: "#" }
    ]
  },
  {
    id: "4",
    title: "Bihar Police Constable Result 2024",
    department: "Bihar Police",
    type: "result",
    qualification: "12th Pass",
    state: "Bihar",
    category: "Police",
    postDate: "2024-12-28",
    shortInfo: "Central Selection Board of Constable (CSBC) Bihar has declared the result for the Constable Recruitment 2024.",
    vacancyDetails: [],
    applicationFee: [],
    importantDates: [
      { label: "Result Declared", date: "28/12/2024" }
    ],
    ageLimit: [],
    eligibilityDetails: "",
    selectionProcess: [],
    physicalEligibility: [],
    links: [
      { label: "Download Result", url: "#" },
      { label: "Official Website", url: "#" }
    ]
  },
  {
    id: "5",
    title: "IBPS PO Mains Result 2024",
    department: "Institute of Banking Personnel Selection (IBPS)",
    type: "result",
    qualification: "Graduation",
    state: "All India",
    category: "Banking",
    postDate: "2025-01-02",
    shortInfo: "IBPS has released the mains examination result for Probationary Officer PO XIII Recruitment 2024.",
    vacancyDetails: [],
    applicationFee: [],
    importantDates: [
      { label: "Result Declared", date: "02/01/2025" }
    ],
    ageLimit: [],
    eligibilityDetails: "",
    selectionProcess: [],
    physicalEligibility: [],
    links: [
      { label: "Check Result", url: "#" }
    ]
  }
];
