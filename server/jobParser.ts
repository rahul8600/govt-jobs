interface ParsedJob {
  title: string;
  department: string;
  type: 'job' | 'admit-card' | 'result' | 'answer-key' | 'admission';
  shortInfo: string;
  qualification?: string;
  state?: string;
  vacancyDetails: { postName: string; totalPost: string; eligibility: string }[];
  applicationFee: { category: string; fee: string }[];
  importantDates: { label: string; date: string }[];
  ageLimit: { category: string; minAge: string; maxAge: string }[];
  eligibilityDetails?: string;
  selectionProcess: string[];
  physicalEligibility: { criteria: string; male: string; female: string }[];
  applyOnlineUrl?: string;
  admitCardUrl?: string;
  resultUrl?: string;
  answerKeyUrl?: string;
  notificationUrl?: string;
  officialWebsiteUrl?: string;
}

function extractSection(text: string, headers: string[]): string {
  const lowerText = text.toLowerCase();
  for (const header of headers) {
    const headerLower = header.toLowerCase();
    const idx = lowerText.indexOf(headerLower);
    if (idx !== -1) {
      const startIdx = idx + header.length;
      const nextSectionMatch = text.slice(startIdx).match(/\n\s*[A-Z][A-Z\s]{5,}[:\n]/);
      const endIdx = nextSectionMatch ? startIdx + (nextSectionMatch.index || 500) : startIdx + 1000;
      return text.slice(startIdx, Math.min(endIdx, startIdx + 1500)).trim();
    }
  }
  return '';
}

function extractDates(text: string): { label: string; date: string }[] {
  const dates: { label: string; date: string }[] = [];
  const dateSection = extractSection(text, ['Important Dates', 'IMPORTANT DATES', 'Important Date']);
  
  const datePatterns = [
    { regex: /application\s*(?:begin|start|starts?)\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/i, label: 'Application Start' },
    { regex: /(?:last|closing)\s*date\s*(?:for\s*(?:apply|application|online))?\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/i, label: 'Last Date' },
    { regex: /late\s*fee\s*(?:date|last\s*date)?\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/i, label: 'Late Fee Date' },
    { regex: /exam\s*date\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4}|notify\s*soon|will\s*be\s*notified)/i, label: 'Exam Date' },
    { regex: /admit\s*card\s*(?:date|available)?\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4}|before\s*exam|notify\s*soon)/i, label: 'Admit Card' },
    { regex: /result\s*(?:date|declaration)?\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|notify\s*soon|will\s*be\s*updated)/i, label: 'Result Date' },
    { regex: /fee\s*payment\s*(?:last\s*date)?\s*[:\-]?\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/i, label: 'Fee Payment Last Date' },
  ];

  const searchText = dateSection || text;
  
  for (const pattern of datePatterns) {
    const match = searchText.match(pattern.regex);
    if (match && match[1]) {
      dates.push({ label: pattern.label, date: match[1].trim() });
    }
  }

  const linePatterns = searchText.split('\n');
  for (const line of linePatterns) {
    const colonMatch = line.match(/^([^:]+):\s*([\d\/\-]+\s*\w*\s*\d{4}|\d{1,2}\s+\w+\s+\d{4})/);
    if (colonMatch && !dates.find(d => d.label.toLowerCase() === colonMatch[1].trim().toLowerCase())) {
      const label = colonMatch[1].trim();
      if (label.length > 3 && label.length < 50) {
        dates.push({ label, date: colonMatch[2].trim() });
      }
    }
  }

  return dates;
}

function extractFees(text: string): { category: string; fee: string }[] {
  const fees: { category: string; fee: string }[] = [];
  const feeSection = extractSection(text, ['Application Fee', 'APPLICATION FEE', 'Exam Fee', 'EXAM FEE']);
  const searchText = feeSection || text;

  const feePatterns = [
    { regex: /general\s*(?:\/\s*)?(?:ews\s*(?:\/\s*)?)?(?:obc)?\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i, category: 'General/EWS/OBC' },
    { regex: /general\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i, category: 'General' },
    { regex: /obc\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i, category: 'OBC' },
    { regex: /ews\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i, category: 'EWS' },
    { regex: /sc\s*(?:\/\s*)?st\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'SC/ST' },
    { regex: /sc\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'SC' },
    { regex: /st\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'ST' },
    { regex: /female\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'Female' },
    { regex: /(?:ph|pwd|divyang)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'PH/PWD' },
    { regex: /ex[\-\s]*servicem[ae]n\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+|nil|exempted)/i, category: 'Ex-Serviceman' },
  ];

  for (const pattern of feePatterns) {
    const match = searchText.match(pattern.regex);
    if (match && match[1]) {
      const fee = match[1].toLowerCase() === 'nil' || match[1].toLowerCase() === 'exempted' 
        ? 'Nil' 
        : `₹${match[1].replace(/,/g, '')}/-`;
      if (!fees.find(f => f.category === pattern.category)) {
        fees.push({ category: pattern.category, fee });
      }
    }
  }

  return fees;
}

function extractAgeLimit(text: string): { category: string; minAge: string; maxAge: string }[] {
  const ages: { category: string; minAge: string; maxAge: string }[] = [];
  const ageSection = extractSection(text, ['Age Limit', 'AGE LIMIT', 'Age Limits']);
  const searchText = ageSection || text;

  const singleAgeMatch = searchText.match(/(?:minimum|min)\s*(?:age)?\s*[:\-]?\s*(\d+)\s*(?:years?)?[\s,]*(?:maximum|max)\s*(?:age)?\s*[:\-]?\s*(\d+)/i);
  if (singleAgeMatch) {
    ages.push({ category: 'General', minAge: singleAgeMatch[1], maxAge: singleAgeMatch[2] });
  }

  const rangeMatch = searchText.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*years?/i);
  if (rangeMatch && ages.length === 0) {
    ages.push({ category: 'General', minAge: rangeMatch[1], maxAge: rangeMatch[2] });
  }

  const categoryPatterns = [
    { regex: /general\s*[:\-]?\s*(\d+)\s*(?:to|-)\s*(\d+)|general\s*[:\-]?[^0-9]*max(?:imum)?\s*(\d+)/i, category: 'General' },
    { regex: /obc\s*[:\-]?\s*(\d+)\s*(?:to|-)\s*(\d+)|obc\s*[:\-]?[^0-9]*max(?:imum)?\s*(\d+)/i, category: 'OBC' },
    { regex: /sc\s*(?:\/\s*st)?\s*[:\-]?\s*(\d+)\s*(?:to|-)\s*(\d+)|sc\s*[:\-]?[^0-9]*max(?:imum)?\s*(\d+)/i, category: 'SC/ST' },
    { regex: /ews\s*[:\-]?\s*(\d+)\s*(?:to|-)\s*(\d+)|ews\s*[:\-]?[^0-9]*max(?:imum)?\s*(\d+)/i, category: 'EWS' },
  ];

  for (const pattern of categoryPatterns) {
    const match = searchText.match(pattern.regex);
    if (match) {
      const minAge = match[1] || '18';
      const maxAge = match[2] || match[3] || '35';
      if (!ages.find(a => a.category === pattern.category)) {
        ages.push({ category: pattern.category, minAge, maxAge });
      }
    }
  }

  return ages;
}

function extractPhysicalEligibility(text: string): { criteria: string; male: string; female: string }[] {
  const physical: { criteria: string; male: string; female: string }[] = [];
  const physSection = extractSection(text, ['Physical Eligibility', 'PHYSICAL ELIGIBILITY', 'Physical Standard', 'PHYSICAL STANDARD', 'Physical Test']);
  
  if (!physSection) return physical;

  const heightMatch = physSection.match(/height[^0-9]*(\d+\.?\d*)\s*(?:cm|meter)?[^0-9]*(?:male)?[^0-9]*(?:female)?[^0-9]*(\d+\.?\d*)?/i);
  if (heightMatch) {
    physical.push({
      criteria: 'Height',
      male: heightMatch[1] ? `${heightMatch[1]} cm` : 'NA',
      female: heightMatch[2] ? `${heightMatch[2]} cm` : 'NA'
    });
  }

  const chestMatch = physSection.match(/chest[^0-9]*(\d+)[^\d]*-[^\d]*(\d+)/i);
  if (chestMatch) {
    physical.push({
      criteria: 'Chest',
      male: `${chestMatch[1]}-${chestMatch[2]} cm`,
      female: 'NA'
    });
  }

  const weightMatch = physSection.match(/weight[^0-9]*(\d+\.?\d*)\s*(?:kg)?/i);
  if (weightMatch) {
    physical.push({
      criteria: 'Weight',
      male: `${weightMatch[1]} kg`,
      female: 'NA'
    });
  }

  return physical;
}

function extractVacancyDetails(text: string): { postName: string; totalPost: string; eligibility: string }[] {
  const vacancies: { postName: string; totalPost: string; eligibility: string }[] = [];
  const vacSection = extractSection(text, ['Vacancy Details', 'VACANCY DETAILS', 'Post Wise Vacancy', 'POST WISE VACANCY', 'Total Post']);
  const searchText = vacSection || text;

  const totalMatch = text.match(/total\s*(?:post|vacancy|vacancies)\s*[:\-]?\s*([\d,]+)/i);
  
  const postPatterns = searchText.split('\n');
  for (const line of postPatterns) {
    const postMatch = line.match(/([A-Za-z\s]+(?:constable|officer|clerk|assistant|manager|engineer|teacher|inspector)?)[:\-\s]+([\d,]+)\s*(?:post|vacancy)?/i);
    if (postMatch && postMatch[1].trim().length > 3) {
      vacancies.push({
        postName: postMatch[1].trim(),
        totalPost: postMatch[2].replace(/,/g, ''),
        eligibility: ''
      });
    }
  }

  if (vacancies.length === 0 && totalMatch) {
    const titleMatch = text.match(/(?:recruitment|notification|online\s*form)\s*(?:for|of)?\s*([A-Za-z\s]+)/i);
    vacancies.push({
      postName: titleMatch ? titleMatch[1].trim() : 'Various Posts',
      totalPost: totalMatch[1].replace(/,/g, ''),
      eligibility: ''
    });
  }

  return vacancies;
}

function extractLinks(text: string): { applyOnlineUrl?: string; notificationUrl?: string; officialWebsiteUrl?: string; admitCardUrl?: string; resultUrl?: string; answerKeyUrl?: string } {
  const links: any = {};

  const urlRegex = /https?:\/\/[^\s<>"')\]]+/gi;
  const allUrls = text.match(urlRegex) || [];

  for (const url of allUrls) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('apply') || lowerUrl.includes('registration')) {
      if (!links.applyOnlineUrl) links.applyOnlineUrl = url;
    } else if (lowerUrl.includes('notification') || lowerUrl.includes('pdf')) {
      if (!links.notificationUrl) links.notificationUrl = url;
    } else if (lowerUrl.includes('admit') || lowerUrl.includes('hall-ticket')) {
      if (!links.admitCardUrl) links.admitCardUrl = url;
    } else if (lowerUrl.includes('result')) {
      if (!links.resultUrl) links.resultUrl = url;
    } else if (lowerUrl.includes('answer') || lowerUrl.includes('key')) {
      if (!links.answerKeyUrl) links.answerKeyUrl = url;
    } else if (lowerUrl.includes('gov.in') || lowerUrl.includes('nic.in')) {
      if (!links.officialWebsiteUrl) links.officialWebsiteUrl = url;
    }
  }

  return links;
}

function extractSelectionProcess(text: string): string[] {
  const process: string[] = [];
  const selSection = extractSection(text, ['Selection Process', 'SELECTION PROCESS', 'Mode of Selection']);
  const searchText = selSection || text;

  const stages = [
    'Written Exam', 'Written Test', 'CBT', 'Computer Based Test',
    'Physical Efficiency Test', 'PET', 'Physical Standard Test', 'PST',
    'Document Verification', 'Medical Test', 'Medical Examination',
    'Interview', 'Skill Test', 'Typing Test', 'Trade Test'
  ];

  for (const stage of stages) {
    if (searchText.toLowerCase().includes(stage.toLowerCase())) {
      const normalized = stage.replace(/\s+/g, ' ').trim();
      if (!process.includes(normalized)) {
        process.push(normalized);
      }
    }
  }

  return process;
}

function detectType(text: string): 'job' | 'admit-card' | 'result' | 'answer-key' | 'admission' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('admit card') || lowerText.includes('hall ticket') || lowerText.includes('call letter')) {
    return 'admit-card';
  }
  if (lowerText.includes('result') && (lowerText.includes('download') || lowerText.includes('declared') || lowerText.includes('out'))) {
    return 'result';
  }
  if (lowerText.includes('answer key')) {
    return 'answer-key';
  }
  if (lowerText.includes('admission') && !lowerText.includes('admit card')) {
    return 'admission';
  }
  return 'job';
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  for (const line of lines.slice(0, 10)) {
    if (line.match(/recruitment|notification|online\s*form|vacancy|bharti/i) && line.length < 150) {
      return line.trim().replace(/[*#_]+/g, '').trim();
    }
  }

  const titleMatch = text.match(/(?:recruitment|notification|online\s*form)\s*(?:for|of)?\s*([A-Za-z0-9\s\-]+(?:2024|2025|2026)?)/i);
  if (titleMatch) {
    return titleMatch[0].trim();
  }

  return lines[0]?.slice(0, 100) || 'Government Job Notification';
}

function extractDepartment(text: string): string {
  const deptPatterns = [
    /(?:organization|department|ministry|commission|board|corporation)\s*[:\-]?\s*([A-Za-z\s]+)/i,
    /([A-Za-z\s]+(?:commission|board|ministry|department|corporation|police|railway|bank))/i,
  ];

  for (const pattern of deptPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().slice(0, 100);
    }
  }

  return 'Government of India';
}

function extractQualification(text: string): string {
  const qualSection = extractSection(text, ['Educational Qualification', 'EDUCATIONAL QUALIFICATION', 'Qualification', 'QUALIFICATION', 'Eligibility']);
  
  if (qualSection && qualSection.length > 20) {
    return qualSection.slice(0, 500);
  }

  const qualPatterns = [
    /10th\s*(?:pass|passed|class)/i,
    /12th\s*(?:pass|passed|class|intermediate)/i,
    /graduation|graduate|bachelor/i,
    /post\s*graduation|master/i,
    /b\.?tech|b\.?e\.|engineering/i,
    /mbbs|medical/i,
  ];

  const found: string[] = [];
  for (const pattern of qualPatterns) {
    if (text.match(pattern)) {
      found.push(pattern.source.replace(/\\s\*|\?\:|\|/g, ' ').replace(/\\/g, ''));
    }
  }

  return found.length > 0 ? found.join(', ') : '';
}

function extractState(text: string): string {
  const states = [
    'Uttar Pradesh', 'UP', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'MP',
    'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Kerala',
    'West Bengal', 'Haryana', 'Punjab', 'Delhi', 'Uttarakhand',
    'Jharkhand', 'Chhattisgarh', 'Odisha', 'Assam', 'Telangana',
    'Andhra Pradesh', 'Himachal Pradesh', 'Jammu', 'Kashmir'
  ];

  for (const state of states) {
    if (text.includes(state)) {
      return state === 'UP' ? 'Uttar Pradesh' : state === 'MP' ? 'Madhya Pradesh' : state;
    }
  }

  if (text.toLowerCase().includes('all india') || text.toLowerCase().includes('central government')) {
    return 'All India';
  }

  return '';
}

export function parseJobNotification(rawText: string): ParsedJob {
  const title = extractTitle(rawText);
  const department = extractDepartment(rawText);
  const type = detectType(rawText);
  const importantDates = extractDates(rawText);
  const applicationFee = extractFees(rawText);
  const ageLimit = extractAgeLimit(rawText);
  const physicalEligibility = extractPhysicalEligibility(rawText);
  const vacancyDetails = extractVacancyDetails(rawText);
  const selectionProcess = extractSelectionProcess(rawText);
  const qualification = extractQualification(rawText);
  const state = extractState(rawText);
  const links = extractLinks(rawText);

  const totalPosts = vacancyDetails.reduce((sum, v) => sum + (parseInt(v.totalPost) || 0), 0);
  const shortInfo = `${department} has released notification for ${title}. ${totalPosts > 0 ? `Total ${totalPosts} posts available.` : ''} ${importantDates.find(d => d.label.includes('Last'))?.date ? `Last date to apply: ${importantDates.find(d => d.label.includes('Last'))?.date}.` : ''}`.trim();

  return {
    title,
    department,
    type,
    shortInfo,
    qualification: qualification || undefined,
    state: state || undefined,
    vacancyDetails,
    applicationFee,
    importantDates,
    ageLimit,
    eligibilityDetails: qualification,
    selectionProcess,
    physicalEligibility,
    ...links
  };
}
