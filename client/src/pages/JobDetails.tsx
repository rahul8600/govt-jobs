import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useJobs } from "@/lib/useJobs";
import { Calendar, ExternalLink, ShieldCheck, MapPin, ChevronDown, ChevronUp, Share2 } from "lucide-react";
import { useSEO, generateJobMeta } from "@/components/SEO";
import { usePageTracker } from "@/lib/usePageTracker";

const hasText = (val: string | null | undefined): boolean => {
  return typeof val === 'string' && val.trim().length > 0;
};

const hasArrayContent = <T,>(arr: T[] | null | undefined, validator?: (item: T) => boolean): boolean => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return false;
  if (validator) return arr.some(validator);
  return true;
};

const hasImportantDates = (dates: { label: string; date: string }[] | null | undefined): boolean => {
  return hasArrayContent(dates, d => hasText(d.label) || hasText(d.date));
};

const hasApplicationFee = (fees: { category: string; fee: string }[] | null | undefined): boolean => {
  return hasArrayContent(fees, f => hasText(f.category) || hasText(f.fee));
};

const hasAgeLimit = (ages: { category: string; minAge: string; maxAge: string }[] | null | undefined): boolean => {
  return hasArrayContent(ages, a => hasText(a.category) || hasText(a.minAge) || hasText(a.maxAge));
};

const hasVacancyDetails = (vacancies: { postName: string; totalPost: string; eligibility: string }[] | null | undefined): boolean => {
  return hasArrayContent(vacancies, v => hasText(v.postName) || hasText(v.totalPost) || hasText(v.eligibility));
};

const hasSelectionProcess = (steps: string[] | null | undefined): boolean => {
  return hasArrayContent(steps, s => hasText(s));
};

const hasPhysicalEligibility = (physical: { criteria: string; male: string; female: string }[] | null | undefined): boolean => {
  return hasArrayContent(physical, p => hasText(p.criteria) || hasText(p.male) || hasText(p.female));
};

const hasLinks = (links: { label: string; url: string }[] | null | undefined): boolean => {
  return hasArrayContent(links, l => hasText(l.label) && hasText(l.url));
};

// Check if job last date has passed
function isJobExpired(lastDate: string | null | undefined): boolean {
  if (!lastDate) return false;
  try {
    const months: Record<string, number> = {
      january:0,february:1,march:2,april:3,may:4,june:5,
      july:6,august:7,september:8,october:9,november:10,december:11
    };
    const wordMatch = lastDate.toLowerCase().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (wordMatch && months[wordMatch[2]] !== undefined) {
      const d = new Date(parseInt(wordMatch[3]), months[wordMatch[2]], parseInt(wordMatch[1]));
      d.setDate(d.getDate() + 1);
      return d < new Date();
    }
    const slashMatch = lastDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const d = new Date(parseInt(slashMatch[3]), parseInt(slashMatch[2])-1, parseInt(slashMatch[1]));
      d.setDate(d.getDate() + 1);
      return d < new Date();
    }
  } catch {}
  return false;
}


// ===== DEPARTMENT-SPECIFIC CONTENT =====
// Har department ka alag exam pattern, syllabus, salary info
function getDepartmentContent(department: string, type: string, title: string) {
  const dept = (department + ' ' + title).toLowerCase();

  // EXAM PATTERN
  let examPattern = '';
  // SYLLABUS  
  let syllabus = '';
  // SALARY
  let salaryBreakdown = '';
  // PREPARATION TIPS
  let preparationTips = '';
  // APPLY STEPS (department specific)
  let applySteps: string[] = [];
  // FAQS
  let faqs: {q: string; a: string}[] = [];

  if (dept.includes('ssc') || dept.includes('staff selection')) {
    examPattern = `SSC exams mein generally 2 tiers hote hain. Tier-1 (Preliminary) mein 100 questions, 200 marks, 60 minutes hote hain — General Intelligence & Reasoning (25), General Awareness (25), Quantitative Aptitude (25), English Comprehension (25). Tier-2 mein Mathematical Abilities aur English Language & Comprehension papers hote hain. Negative marking 0.50 marks per wrong answer hai Tier-1 mein. Exam Computer Based Test (CBT) format mein hota hai.`;
    syllabus = `Reasoning: Analogy, Classification, Series, Coding-Decoding, Blood Relations, Direction Sense, Venn Diagrams, Syllogism. Quantitative: Number System, Percentage, Ratio & Proportion, Average, Time & Work, Speed Distance, Algebra, Geometry, Trigonometry, Statistics. English: Spotting Errors, Fill in the Blanks, Synonyms/Antonyms, Idioms & Phrases, Comprehension, Para Jumbles. General Awareness: History, Geography, Polity, Economics, Current Affairs, Science & Technology.`;
    salaryBreakdown = `SSC posts mein salary Pay Level ke hisaab se hoti hai. MTS/Chowkidar: Pay Level 1 — Basic ₹18,000, Gross ₹22,000-25,000. CHSL: Pay Level 4/5 — Basic ₹25,500-29,200, Gross ₹32,000-38,000. CGL posts: Pay Level 6/7/8 — Basic ₹35,400-47,600, Gross ₹45,000-65,000. In-hand salary mein HRA (8-27%), TA, DA add hota hai. 7th Pay Commission ke hisaab se sab allowances milte hain.`;
    preparationTips = `Best Books: Quantitative Aptitude by R.S. Aggarwal, English by S.P. Bakshi (Arihant), Reasoning by Dr. M.K. Pandey, Lucent GK for General Awareness. Strategy: Pehle syllabus samjho, phir topic-wise practice karo. Previous year papers zaroor solve karo — SSC ke questions repeat hote hain. Mock tests daily do, time management improve hoga. Current Affairs ke liye daily newspaper padho ya monthly magazine lo.`;
    applySteps = [
      `SSC Official Website ssc.gov.in par jao`,
      `"Apply" section mein is recruitment ka link dhundho`,
      `Pehli baar ho toh One-Time Registration (OTR) karo — naam, DOB, email, mobile`,
      `Login karke application form bharo — sab details dhyan se bharo`,
      `Recent photo (20-50 KB) aur signature (10-20 KB) upload karo`,
      `Application fee pay karo — UPI/Net Banking/Debit Card se (SC/ST/Female/PH exempt)`,
      `Final preview check karo aur Submit karo`,
      `Confirmation page download karo aur print rakho`
    ];
    faqs = [
      {q: "SSC exam attempt limit kitni hai?", a: "SSC CGL mein age limit tak unlimited attempts. MTS mein bhi age limit tak attempt kar sakte ho."},
      {q: "SSC exam mein negative marking hai?", a: "Haan, Tier-1 mein 0.5 marks katenge har galat answer pe. Tier-2 mein bhi negative marking hoti hai."},
      {q: "SSC ki preparation kitne mahine mein ho sakti hai?", a: "Agar regular 4-6 ghante padho toh 6-8 mahine mein CGL crack ho sakta hai. MTS/CHSL ke liye 3-4 mahine kaafi hain."}
    ];
  } else if (dept.includes('railway') || dept.includes('rrb') || dept.includes('rrb') || dept.includes('rrc')) {
    examPattern = `Railway exams mein CBT-1 (Preliminary) mein 100 questions, 90 minutes hote hain — Mathematics (30), General Intelligence & Reasoning (30), General Science (30), General Awareness (10). CBT-2 mein post-specific subjects hote hain. Group D mein CBT ke baad Physical Efficiency Test (PET) hota hai. Negative marking: 1/3 marks per wrong answer. Exam Hindi aur English dono mein hota hai.`;
    syllabus = `Mathematics: Number System, Decimals, Fractions, LCM/HCF, Ratio & Proportion, Percentage, Mensuration, Time & Work, Simple & Compound Interest, Profit/Loss, Algebra, Geometry, Trigonometry. Reasoning: Analogies, Venn Diagrams, Coding-Decoding, Syllogism, Number Series. General Science: Physics, Chemistry, Biology (10th level). Current Affairs: Railway, Science & Tech, Sports, Awards.`;
    salaryBreakdown = `Railway Group D: Pay Level 1 — Basic ₹18,000, Gross ₹22,000-26,000 + Free Railway Pass. NTPC JSA/Accounts Clerk: Pay Level 2 — Basic ₹19,900, Gross ₹25,000-29,000. NTPC ASM/CA: Pay Level 4-6 — Basic ₹25,500-35,400, Gross ₹32,000-48,000. ALP/Technician: Pay Level 2-5, Basic ₹19,900-29,200. Railway jobs mein HRA, TA, DA plus free medical + pass facilities milti hain.`;
    preparationTips = `Best Books: RRB NTPC/Group D Guide by Arihant, Railway Math by Rakesh Yadav, General Science by Lucent. Previous year papers 2015-2024 zaroor solve karo. CBT-1 mein General Science bahut important hai — NCERT 6th to 10th padho. Physical test ke liye pehle se stamina build karo. Speed aur accuracy dono improve karo — 100 questions, 90 minutes mein 1 minute per question.`;
    applySteps = [
      `RRB Official Website rrbcdg.gov.in ya apne zone ki RRB site par jao`,
      `"New Registration" karke account banao — Email aur Mobile se`,
      `Application form mein personal details, education, community sab bharo`,
      `Exam city preference choose karo`,
      `Photo (20-50 KB, JPEG) aur Signature (10-40 KB) upload karo`,
      `Application fee pay karo — UPI/Net Banking/SBI Challan se (SC/ST/Female/Ex-SM/PwBD exempt)`,
      `Form submit karo aur Application Number note karo`,
      `PDF download karo — Admit Card ke liye zaroori hai`
    ];
    faqs = [
      {q: "Railway exam mein medical test hota hai?", a: "Haan, selected candidates ko medical fitness test pass karna hota hai. Vision, hearing aur overall fitness check hoti hai."},
      {q: "RRB NTPC aur Group D mein kya fark hai?", a: "NTPC mein 12th/Graduate level ke clerical/accounts posts hain. Group D mein 10th pass ke liye physical/maintenance posts hain."},
      {q: "Railway job mein transfer hota hai?", a: "Haan, posting Railway Zone ke andar kisi bhi station par ho sakti hai. Seniority ke baad preference milti hai."}
    ];
  } else if (dept.includes('upsc') || dept.includes('civil service') || dept.includes('ias') || dept.includes('ips')) {
    examPattern = `UPSC Civil Services 3 stages mein hoti hai. Prelims: 2 papers — GS Paper 1 (200 marks, 2 hrs, 100 MCQ) aur CSAT Paper 2 (200 marks, 2 hrs, qualifying 33%). Mains: 9 papers — Essay (250), GS 1-4 (250 each), Optional Subject (2 papers x 250), English & Indian Language (qualifying). Interview: 275 marks. Total: 1750+275 = 2025 marks. Negative marking 1/3 Prelims mein.`;
    syllabus = `Prelims GS1: History, Geography, Polity, Economy, Environment, Science & Tech, Current Affairs. CSAT: Reading Comprehension, Logical Reasoning, Math (10th level). Mains GS1: Indian Heritage, History, Geography. GS2: Governance, Polity, International Relations. GS3: Economy, Agriculture, Environment, Disaster Management, Internal Security. GS4: Ethics, Integrity, Aptitude. Optional: Choose any 1 subject from list of 48.`;
    salaryBreakdown = `IAS/IPS/IFS — Pay Level 10 — Basic ₹56,100 (Junior Scale). Pay Level 11 — Basic ₹67,700 (Senior Scale). Pay Level 13 — Basic ₹1,18,500 (Director level). Cabinet Secretary: Basic ₹2,50,000. In-hand mein DA, HRA, TA plus free government bungalow, vehicle, staff, medical, LTC sab milta hai. Total package entry level par ₹70,000-90,000 per month effective.`;
    preparationTips = `Best Books: NCERT 6-12 sab subjects, Indian Polity by Laxmikant, Geography by Majid Husain, Modern India by Bipan Chandra, Economy by Ramesh Singh, Ethics by Lexicon. Strategy: NCERT se foundation banao, standard books padho, answer writing daily practice karo. Mains ke liye Current Affairs The Hindu/Indian Express se. Optional wisely choose karo — jo comfortable ho. Mock interviews must.`;
    applySteps = [
      `UPSC Official Website upsc.gov.in par jao`,
      `"Online Application for Various Examinations" section mein jao`,
      `Pehli baar hai toh Part-1 Registration karo — basic details bharo`,
      `Part-2 mein complete application bharo — education, photo, signature`,
      `Optional subject select karo`,
      `Application fee ₹100 pay karo (SC/ST/Female/PwBD exempt)`,
      `Print out aur registration ID save karo`,
      `Admit card UPSC website se download hoga exam se 3 weeks pehle`
    ];
    faqs = [
      {q: "UPSC mein kitne attempts milte hain?", a: "General: 6 attempts (32 years tak). OBC: 9 attempts (35 years tak). SC/ST: unlimited attempts (37 years tak). PwBD: General+3 extra."},
      {q: "Optional subject kaun sa lena chahiye?", a: "Woh subject lo jo tumhe pasand ho aur jisme previous year papers mein high scoring ho. Popular options: Geography, History, Public Administration, Sociology, PSIR."},
      {q: "UPSC ki preparation job ke saath ho sakti hai?", a: "Ho sakti hai lekin mushkil hai. Roz 4-5 ghante dedicated study aur weekends par extra time do. Job leave lekar padhe toh better results milte hain."}
    ];
  } else if (dept.includes('bank') || dept.includes('ibps') || dept.includes('sbi') || dept.includes('rbi')) {
    examPattern = `Bank exams mein 2 phases hote hain. Prelims: 3 sections — English (30 Q, 20 min), Quantitative Aptitude (35 Q, 20 min), Reasoning (35 Q, 20 min). Total 100 Q, 60 min, 100 marks. Mains: 4-5 sections — Reasoning & Computer (45 Q, 60 min), English (35 Q, 40 min), Quant (35 Q, 45 min), General/Financial Awareness (40 Q, 35 min). Sectional cutoff hoti hai. Negative marking 0.25 marks.`;
    syllabus = `Quantitative Aptitude: Number Series, Simplification, Data Interpretation (Tables, Graphs, Charts), Quadratic Equations, Percentage, Profit/Loss, SI/CI, Time-Work, Speed-Distance. Reasoning: Puzzles & Seating Arrangement, Syllogism, Coding-Decoding, Blood Relations, Inequality, Input-Output, Alphanumeric Series. English: Reading Comprehension, Cloze Test, Error Detection, Para Jumbles, Fill in Blanks. Banking Awareness: RBI, SEBI, Types of Accounts, Monetary Policy, Financial Institutions.`;
    salaryBreakdown = `Bank Clerk (IBPS): Pay Scale ₹11,765-42,020, Gross ₹26,000-29,000 in metro cities. Bank PO (IBPS): Pay Scale ₹23,700-42,020, Gross ₹52,000-55,000 with allowances. SBI Clerk: Basic ₹17,900, Gross ₹26,000+. SBI PO: Basic ₹27,620, Gross ₹52,000+. RBI Grade B: Basic ₹35,150, Gross ₹77,000+. Bank jobs mein DA, HRA, CCA, Medical, Leave Travel allowances milte hain plus pension.`;
    preparationTips = `Best Books: Quantitative Aptitude by R.S. Aggarwal, Reasoning by M.K. Pandey, English by S.P. Bakshi, Banking Awareness by Arihant. Online Resources: Testbook, Gradeup, Oliveboard mock tests best hain. Strategy: DI aur Puzzles mein sabse zyada time lagao — yeh scoring areas hain. Sectional cutoff pe dhyan do — koi section ignore mat karo. 50+ mock tests zaroor do Mains se pehle. Current Banking Affairs roz padho.`;
    applySteps = [
      `IBPS: ibps.in ya SBI: sbi.co.in par jao`,
      `"Careers" ya "Recruitment" section mein notification dhundho`,
      `"Apply Online" link par click karo`,
      `Registration karke Login ID/Password banao`,
      `Personal, educational aur category details bharo`,
      `Photo (4.5x3.5 cm, 20-50 KB) aur Signature (3.5x1.5 cm, 10-20 KB) upload karo`,
      `Application fee pay karo — SC/ST/PwBD exempt hain`,
      `Form submit karo, confirmation email aayegi — screenshot lo`
    ];
    faqs = [
      {q: "Bank PO aur Clerk mein kya fark hai?", a: "PO (Probationary Officer) — management cadre, promotion fast, zyada responsibility, higher salary. Clerk — clerical work, counter service, thodi slow growth but stable job."},
      {q: "IBPS exam attempt limit hai?", a: "Koi official attempt limit nahi hai — age limit (General 28 years, OBC 31, SC/ST 33) tak appear kar sakte ho."},
      {q: "Bank job mein kaunsa subject important hai?", a: "Quantitative Aptitude aur Reasoning sabse zyada weightage wale hain. Banking Awareness Mains mein important hai. English bhi ignore mat karo."}
    ];
  } else if (dept.includes('police') || dept.includes('constable') || dept.includes('si ') || dept.includes('sub inspector')) {
    examPattern = `Police recruitment mein Written Exam + Physical Test + Medical hota hai. Written: 100-150 questions, 2 ghante — General Knowledge (40-50 Q), Reasoning (20-30 Q), Math (20-30 Q), Hindi/English (20-30 Q). Negative marking 0.25 marks (varies by state). Physical Test: Male — 1600m run 5 min 45 sec, Long Jump 12 ft, High Jump 3.5 ft, Shot Put. Female — 800m run, alag standards. Medical mein eyesight, height, weight check hoti hai.`;
    syllabus = `General Knowledge: Uttar Pradesh/State History, Geography, Constitution, Current Affairs, Police Acts, Famous Personalities. Reasoning: Series, Analogy, Coding-Decoding, Classification, Direction Sense, Blood Relations. Mathematics: Number System, Percentage, Average, Simple Interest, Profit-Loss, Time-Work, Mensuration. Hindi: Vyakaran, Sandhi, Samas, Ras, Alankar, Muhaware, Translation. State-specific Acts aur Laws bhi syllabus mein hote hain.`;
    salaryBreakdown = `Police Constable: Pay Level 3 — Basic ₹21,700, Gross ₹28,000-33,000 + Uniform Allowance. Sub Inspector: Pay Level 6 — Basic ₹35,400, Gross ₹45,000-52,000. Inspector: Pay Level 7 — Basic ₹44,900, Gross ₹58,000-65,000. Police jobs mein Risk Allowance, Uniform Allowance, Ration, Free Quarter (in some posts) milta hai. Sarkari quarters ya HRA milta hai.`;
    preparationTips = `Best Books: Lucent GK, Arihant Police Constable Guide (state-specific), Math by RS Aggarwal. Physical Preparation: 3-4 mahine pehle se running shuru karo. Daily 5-6 km running karo stamina ke liye. State ka current GK padho — CM, Governor, famous places, recent events. Previous year papers solve karo — Police exams mein repeat questions aate hain. Hindi grammar strong rakhna zaroori hai.`;
    applySteps = [
      `State Police Recruitment Board ki official website par jao`,
      `"New Recruitment" ya "Apply Online" section mein jaao`,
      `Registration karke account banao`,
      `Application form mein personal details, education, category fill karo`,
      `Photo aur Signature upload karo (size notification mein dekho)`,
      `Application fee pay karo — OBC/General ke liye fee hoti hai, SC/ST mein kabhi kabhi exemption`,
      `Form submit karo aur Application Number note karo`,
      `Physical date par original documents aur Admit Card saath lao`
    ];
    faqs = [
      {q: "Police constable ke liye height kitni chahiye?", a: "Generally Male: General/OBC 168 cm, SC/ST 160 cm. Female: General/OBC 152 cm, SC/ST 147 cm. State ke hisaab se vary karta hai."},
      {q: "Police exam mein age relaxation milti hai?", a: "Haan — OBC: +3 years, SC/ST: +5 years, Ex-Servicemen: years of service + 3, PwBD: +10 years. State-specific relaxation bhi hoti hai."},
      {q: "Police job mein promotion kaise hoti hai?", a: "Constable se Head Constable, phir ASI, SI, Inspector — DPC (Departmental Promotion Committee) ke through. Seniority aur departmental exam se promotion milti hai."}
    ];
  } else if (dept.includes('teacher') || dept.includes('ctet') || dept.includes('tet') || dept.includes('school') || dept.includes('vidyalaya')) {
    examPattern = `Teaching exams (CTET/State TET) mein 2 papers hote hain. Paper 1 (Class 1-5): Child Development (30 Q), Language 1 (30 Q), Language 2 (30 Q), Mathematics (30 Q), Environmental Studies (30 Q) — Total 150 Q, 150 marks, 2.5 hrs. Paper 2 (Class 6-8): Child Development (30 Q), Language 1 (30 Q), Language 2 (30 Q), Subject (60 Q — Math/Science ya Social Studies). Qualifying marks: General 60%, SC/ST 55%. No negative marking in CTET.`;
    syllabus = `Child Development & Pedagogy: Growth & Development theories (Piaget, Vygotsky), Learning theories, Inclusive Education, Child Psychology, Assessment. Mathematics: Number System, Geometry, Shapes, Measurement, Data Handling (primary level pedagogy). Environmental Studies: Family, Food, Shelter, Water, Plants, Animals, Travel, Things We Make. Language: Reading Comprehension, Grammar, Pedagogy of Language teaching. For Paper 2 — Higher level subject content + Pedagogy.`;
    salaryBreakdown = `Primary Teacher (PRT): Pay Level 6 — Basic ₹35,400, Gross ₹45,000-50,000. Trained Graduate Teacher (TGT): Pay Level 7 — Basic ₹44,900, Gross ₹55,000-62,000. Post Graduate Teacher (PGT): Pay Level 8 — Basic ₹47,600, Gross ₹62,000-70,000. KVS/NVS mein HRA, TA, Medical, Gratuity, Pension sab milta hai. Government school teachers ko quarters ya HRA milta hai.`;
    preparationTips = `Best Books: Child Development by Disha Experts, NCERT books of respective class level, CTET/State TET previous years Arihant/Disha. Strategy: Child Development mein theories aur pedagogy samjho — sirf yaad mat karo. Mathematics ke basic concepts strong karo. Environmental Studies mein NCERT Science & Social Science 3-5 padho. Language mein grammar + reading comprehension practice. 50+ mock tests do timing ke liye.`;
    applySteps = [
      `CTET ke liye: ctet.nic.in par jao. State TET ke liye state board ki website par jao`,
      `"Apply Online" link click karo`,
      `Registration karke Login banao — Email aur Mobile se`,
      `Paper 1 ya Paper 2 ya dono choose karo`,
      `Personal details, education, teaching preference bharo`,
      `Photo (10-100 KB, JPEG) aur Signature upload karo`,
      `Exam fee pay karo — ₹1000 (1 paper) ya ₹1200 (dono papers)`,
      `Confirmation page download aur print karo`
    ];
    faqs = [
      {q: "CTET certificate kitne saal valid hai?", a: "2021 ke baad se CTET certificate lifetime valid ho gayi hai. Pehle sirf 7 saal valid thi."},
      {q: "TET pass karne ke baad job pakki hai?", a: "Nahi — TET sirf eligibility certificate hai. Iske baad state-wise teacher recruitment exam (like BPSC TRE, DSSSB, KVS) dena hota hai."},
      {q: "CTET mein kitni baar appear kar sakte hain?", a: "CTET mein koi attempt limit nahi hai. Jab tak pass na ho ya improve karna ho, appear kar sakte ho."}
    ];
  } else if (dept.includes('army') || dept.includes('navy') || dept.includes('air force') || dept.includes('nda') || dept.includes('defence') || dept.includes('agniveer')) {
    examPattern = `Defence exams (Agniveer/NDA) mein Written + Physical + Medical hota hai. Agniveer Written: 100 Q, 60 min — General Knowledge, Math, Physics. NDA Written: Mathematics (300 marks, 2.5 hrs) + General Ability Test (600 marks — English 200, GK 400). Physical: 1.6 km run, Pull-ups, Sit-ups, Jump. Medical mein strict physical fitness check hoti hai.`;
    syllabus = `Math: Algebra, Matrices, Determinants, Trigonometry, Calculus, Statistics, Probability. Physics: Motion, Laws, Work/Energy, Heat, Waves, Electricity, Magnetism. Chemistry: Basic concepts, Acids/Bases, Metals/Non-metals. GK: Indian History, Geography, Polity, Current Affairs. English: Grammar, Comprehension, Vocabulary. Reasoning: Series, Analogy, Spatial Ability.`;
    salaryBreakdown = `Agniveer: ₹30,000-40,000 per month + free ration, clothing, medical. 4 saal baad ₹11.71 lakh Seva Nidhi package. Permanent Commission: JCO — Pay Level 6 — ₹35,400+ with Military Service Pay. Officer entry: Lieutenant — Pay Level 10 — ₹56,100+. Defence jobs mein CSD canteen, free medical, pension (for permanent), group housing sab milta hai.`;
    preparationTips = `Best Books: NDA/CDS Guide by Pathfinder, Mathematics by RS Aggarwal, GK by Lucent. Physical: Running stamina build karo — daily 5 km compulsory. Pull-ups aur strength training daily. Medical ke liye eyesight strong rakhna zaroori hai — screen time kam karo. NDA ke liye 10+2 Physics/Math strong karo — NDA Math paper tough hota hai. Previous 10 years papers zaroor solve karo.`;
    applySteps = [
      `joinindianarmy.nic.in / joinindiannavy.gov.in / agnipathvayu.cdac.in par jao`,
      `Relevant recruitment link par click karo`,
      `Registration karo — Aadhar se link karke`,
      `Personal details, education, physical measurements bharo`,
      `Documents scan karke upload karo — Education, Domicile, Caste`,
      `Application fee pay karo (agar applicable ho)`,
      `Form submit karo aur Roll Number note karo`,
      `Physical test date par fit hokar aao — medical docs saath lo`
    ];
    faqs = [
      {q: "Agniveer aur regular army mein kya fark hai?", a: "Agniveer 4 saal ki temporary service hai. 4 saal baad 25% ko permanent rakha jaata hai, baaki Seva Nidhi leke civilian life mein jaate hain."},
      {q: "Defence job mein age limit kya hai?", a: "Agniveer: 17.5 to 21 years. NDA: 16.5 to 19.5 years. CDS: Graduate ke liye 20-24 years (varies by entry). Age relaxation SC/ST ko milti hai."},
      {q: "Kya glasses wale defence join kar sakte hain?", a: "Depends on post — Pilot ke liye strict eyesight chahiye. Infantry mein corrected vision acceptable hai. Medical standards post ke hisaab se vary karte hain."}
    ];
  } else {
    // Generic but still useful default
    examPattern = `Is recruitment mein Written Exam hota hai. Generally Objective type (MCQ) questions hote hain — General Knowledge, Reasoning, Mathematics, aur subject-specific questions. Exam ki duration 1.5 to 2 ghante hoti hai. Negative marking ho sakti hai — official notification confirm karo. Exam CBT (Computer Based) ya OMR sheet format mein ho sakta hai.`;
    syllabus = `General Knowledge: Indian History, Geography, Constitution, Current Affairs, Economy, Science & Technology. Reasoning: Series, Analogy, Coding-Decoding, Blood Relations, Direction Sense, Logical Reasoning. Mathematics: Basic Arithmetic, Percentage, Ratio, Average, Profit-Loss, Time & Work, Mensuration. Subject-specific: Department ke hisaab se technical/professional questions bhi ho sakte hain — official notification mein syllabus zaroor dekho.`;
    salaryBreakdown = `Government jobs mein 7th Pay Commission ke hisaab se salary milti hai. Pay Level 1-3 (entry level): Basic ₹18,000-21,700, Gross ₹23,000-28,000. Pay Level 4-6 (mid level): Basic ₹25,500-35,400, Gross ₹33,000-46,000. Pay Level 7-8 (senior level): Basic ₹44,900-47,600, Gross ₹58,000-65,000. Salary mein DA, HRA (8-27% based on city), TA aur other allowances add hote hain. Exact pay scale official notification mein confirm karo.`;
    preparationTips = `Is exam ki preparation ke liye: Official notification mein diya syllabus follow karo. Previous year question papers zaroor solve karo — pattern samajhne ke liye. Lucent GK aur RS Aggarwal Math standard books hain. Reasoning ke liye M.K. Pandey helpful hai. Daily current affairs padho. Mock tests time management ke liye zaroori hain. Coaching zaroor nahi — self-study se bhi crack ho sakta hai agar dedicated ho.`;
    applySteps = [
      `${department} ki official website par jao ya notification mein diye link par click karo`,
      `"Apply Online" ya "Online Application" link dhundho`,
      `Pehli baar hai toh registration karo — Email aur Mobile se`,
      `Application form carefully bharo — personal, educational, category details`,
      `Recent passport size photo aur signature scan karke upload karo`,
      `Application fee pay karo — notification mein category-wise fee dekho`,
      `Form submit karo aur Application Number/ID note karo`,
      `Acknowledgement print karo — Admit Card ke liye zaroori hoga`
    ];
    faqs = [
      {q: "Kya online apply karna compulsory hai?", a: "Haan, aajkal zyaatar government recruitments mein online application hi accepted hoti hai. Kuch cases mein offline bhi hoti hai — notification mein check karo."},
      {q: "Age relaxation kise milti hai?", a: "OBC ko generally 3 saal, SC/ST ko 5 saal, PwBD ko 10 saal relaxation milti hai. Ex-Servicemen aur Women ke liye bhi relaxation hoti hai — notification mein confirm karo."},
      {q: "Admit Card kaise milega?", a: "Admit Card official website par exam se 2-3 weeks pehle available hoga. Registration number aur DOB se download hoga. SMS/Email bhi aa sakta hai."}
    ];
  }

  return { examPattern, syllabus, salaryBreakdown, preparationTips, applySteps, faqs };
}

export default function JobDetails() {
  const [match, params] = useRoute("/job/:id");
  const { jobs, loading } = useJobs();
  const [showFullNotification, setShowFullNotification] = useState(false);

  const job = jobs.find(j => j.id === params?.id || j.slug === params?.id);
  const deptContent = job ? getDepartmentContent(job.department || '', job.type || '', job.title || '') : null;
  
  const seoProps = job ? generateJobMeta(job) : { title: 'Loading...', description: '' };
  useSEO(seoProps);
  usePageTracker('job-detail', job ? parseInt(job.id) : undefined);

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;
  if (!match) return null;
  if (!job) return <div className="p-10 text-center font-bold">Job Not Found</div>;

  const notifyLink = job.notificationUrl || job.links.find(l => l.label.toLowerCase().includes('notification'))?.url || "#";
  
  const getPrimaryActionButton = () => {
    switch (job.type) {
      case 'job':
        const applyUrl = job.applyOnlineUrl || job.links.find(l => l.label.toLowerCase().includes('apply'))?.url || "#";
        return { label: 'Apply Online', url: applyUrl };
      case 'admit-card':
        const admitUrl = job.admitCardUrl || job.links.find(l => l.label.toLowerCase().includes('admit'))?.url || "#";
        return { label: 'Download Admit Card', url: admitUrl };
      case 'result':
        const resultUrl = job.resultUrl || job.links.find(l => l.label.toLowerCase().includes('result'))?.url || "#";
        return { label: 'Download Result', url: resultUrl };
      case 'answer-key':
        const answerUrl = job.answerKeyUrl || job.links.find(l => l.label.toLowerCase().includes('answer'))?.url || "#";
        return { label: 'Download Answer Key', url: answerUrl };
      default:
        return { label: 'Apply Online', url: '#' };
    }
  };
  
  const primaryAction = getPrimaryActionButton();
  const expired = isJobExpired(job.lastDate);

  // Related jobs — same type, excluding current
  const relatedJobs = jobs
    .filter(j => j.type === job.type && j.id !== job.id)
    .slice(0, 5);

  const showDatesHtml = hasText(job.importantDatesHtml);
  const showDatesStructured = !showDatesHtml && hasImportantDates(job.importantDates);
  const showDates = showDatesHtml || showDatesStructured;

  const showFeeHtml = hasText(job.applicationFeeHtml);
  const showFeeStructured = !showFeeHtml && hasApplicationFee(job.applicationFee);
  const showFee = showFeeHtml || showFeeStructured;

  const showAgeLimitHtml = hasText(job.ageLimitHtml);
  const showAgeLimitStructured = !showAgeLimitHtml && hasAgeLimit(job.ageLimit);
  const showAgeLimit = showAgeLimitHtml || showAgeLimitStructured;

  const showVacancyHtml = hasText(job.vacancyDetailsHtml);
  const showVacancyStructured = !showVacancyHtml && hasVacancyDetails(job.vacancyDetails);
  const showVacancy = showVacancyHtml || showVacancyStructured;

  const showSelectionHtml = hasText(job.selectionProcessHtml);
  const showSelectionStructured = !showSelectionHtml && hasSelectionProcess(job.selectionProcess);
  const showSelection = showSelectionHtml || showSelectionStructured;

  const showPstHtml = hasText(job.physicalStandardHtml);
  const showPetHtml = hasText(job.physicalEfficiencyHtml);
  const showPhysicalStructured = !showPstHtml && !showPetHtml && hasPhysicalEligibility(job.physicalEligibility);

  const showLinksHtml = hasText(job.importantLinksHtml);
  const showLinksStructured = !showLinksHtml && hasLinks(job.links);
  const showLinks = showLinksHtml || showLinksStructured;

  const showEligibility = hasText(job.eligibilityDetails);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">

      {/* Expired Banner */}
      {expired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-700 font-black text-sm uppercase tracking-wide">Application Closed!</p>
            <p className="text-red-600 text-xs mt-0.5">Last date ({job.lastDate}) has passed. Check latest jobs for new notifications.</p>
          </div>
          <Link href="/latest-jobs">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-red-700 flex-shrink-0">New Jobs</span>
          </Link>
        </div>
      )}

      {/* 1. Header Card */}
      <div className="bg-white p-10 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-6">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-snug text-center job-details-title" data-testid="text-job-title">
          {job.title}
          {job.department && (
            <span className="block text-sm font-semibold text-slate-500 mt-1">
              {job.department}
              {job.lastDate ? ` – Last Date: ${job.lastDate}` : ''}
            </span>
          )}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg"><MapPin className="w-4 h-4" /> {job.department}</span>
          <span className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-100"><Calendar className="w-4 h-4" /> Posted: {job.postDate}</span>
          {job.lastDate && <span className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg border border-rose-100"><Calendar className="w-4 h-4" /> Last Date: {job.lastDate}</span>}
        </div>
        
        {hasText(job.shortInfo) && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-7 rounded-xl border border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 job-details-short-heading">
              {job.type === 'admit-card' ? 'Admit Card Overview' :
               job.type === 'result' ? 'Result Overview' :
               job.type === 'answer-key' ? 'Answer Key Overview' :
               job.type === 'admission' ? 'Admission Overview' :
               'Job Overview / Short Information'}
            </h2>
            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line job-details-short-text" data-testid="text-short-info">{job.shortInfo}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-4 pt-4">
          <a href={primaryAction.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-blue-700 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl active:scale-[0.98]" data-testid="button-primary-action">
            <ExternalLink className="w-5 h-5 md:w-4 md:h-4" /> {primaryAction.label}
          </a>
          <a href={notifyLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-slate-700 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-700/25 hover:shadow-xl active:scale-[0.98]" data-testid="button-notification">
            Notification
          </a>
          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🔔 ${job.title}\n📅 Last Date: ${job.lastDate || 'N/A'}\n🔗 ${window.location.href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white w-full md:w-auto px-9 py-5 md:py-4 rounded-xl font-bold text-sm md:text-xs uppercase tracking-widest hover:bg-green-600 transition-all duration-200 shadow-lg active:scale-[0.98]"
          >
            <Share2 className="w-5 h-5 md:w-4 md:h-4" /> WhatsApp Share
          </a>
          {hasText(job.rawJobContent) && (
            <button 
              onClick={() => setShowFullNotification(!showFullNotification)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-9 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-600/25 active:scale-[0.98]"
              data-testid="button-view-full-notification"
            >
              {showFullNotification ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showFullNotification ? 'Hide Full Notification' : 'View Full Notification'}
            </button>
          )}
        </div>
      </div>

      {/* Full Notification Content */}
      {hasText(job.rawJobContent) && showFullNotification && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-lg">
          <h2 className="bg-emerald-600 text-white p-5 text-sm font-bold uppercase tracking-widest">Full Notification Details</h2>
          <div className="p-8 max-h-[600px] overflow-y-auto">
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.rawJobContent! }} />
          </div>
        </div>
      )}

      {/* Dates & Fees Grid */}
      {(showDates || showFee) && (
        <div className="grid md:grid-cols-2 gap-7 job-details-grid">
          {showDates && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
              <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Important Dates</h2>
              {showDatesHtml ? (
                <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.importantDatesHtml! }} />
              ) : (
                <table className="w-full border-collapse job-details-table">
                  <tbody className="divide-y divide-slate-100">
                    {job.importantDates?.filter(d => hasText(d.label) || hasText(d.date)).map((d, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <td className="p-5 text-xs font-bold uppercase text-slate-500 w-1/2 border-r border-slate-100">{d.label}</td>
                        <td className="p-5 text-sm font-semibold text-slate-800">{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {showFee && (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
              <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest">Application Fee</h2>
              {showFeeHtml ? (
                <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.applicationFeeHtml! }} />
              ) : (
                <table className="w-full border-collapse job-details-table">
                  <tbody className="divide-y divide-slate-100">
                    {job.applicationFee?.filter(f => hasText(f.category) || hasText(f.fee)).map((f, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                        <td className="p-5 text-xs font-bold uppercase text-slate-500 w-1/2 border-r border-slate-100">{f.category}</td>
                        <td className="p-5 text-sm font-semibold text-blue-700">₹{f.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Age Limit */}
      {showAgeLimit && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Age Limit Details</h2>
          {showAgeLimitHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.ageLimitHtml! }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse job-details-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Category</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Min Age</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Max Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.ageLimit?.filter(a => hasText(a.category) || hasText(a.minAge) || hasText(a.maxAge)).map((a, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                      <td className="p-5 text-sm font-semibold text-slate-700">{a.category}</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{a.minAge} Years</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{a.maxAge} Years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vacancy Details */}
      {showVacancy && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Vacancy Details</h2>
          {showVacancyHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.vacancyDetailsHtml! }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse job-details-table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Post Name</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Total Posts</th>
                    <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {job.vacancyDetails?.filter(v => hasText(v.postName) || hasText(v.totalPost) || hasText(v.eligibility)).map((v, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                      <td className="p-5 text-sm font-semibold text-slate-700">{v.postName}</td>
                      <td className="p-5 text-sm font-bold text-center text-blue-700">{v.totalPost}</td>
                      <td className="p-5 text-sm font-medium text-slate-600 leading-relaxed">{v.eligibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Eligibility Details */}
      {showEligibility && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-blue-700 text-white p-5 text-sm font-bold uppercase tracking-widest">Eligibility Details</h2>
          <div className="p-7">
            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">{job.eligibilityDetails}</p>
          </div>
        </div>
      )}

      {/* Selection Process */}
      {showSelection && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Selection Process</h2>
          {showSelectionHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.selectionProcessHtml! }} />
          ) : (
            <div className="p-7">
              <ul className="space-y-4">
                {job.selectionProcess?.filter(s => hasText(s)).map((step, i) => (
                  <li key={i} className="flex gap-4 items-center text-sm font-medium text-slate-600">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showPstHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Standard Test (PST)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalStandardHtml! }} />
        </div>
      )}

      {showPetHtml && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Efficiency Test (PET)</h2>
          <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.physicalEfficiencyHtml! }} />
        </div>
      )}

      {showPhysicalStructured && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Physical Eligibility Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse job-details-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-left">Criteria</th>
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Male</th>
                  <th className="p-5 text-xs font-bold uppercase text-slate-500 text-center">Female</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.physicalEligibility?.filter(p => hasText(p.criteria) || hasText(p.male) || hasText(p.female)).map((p, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors duration-200">
                    <td className="p-5 text-sm font-semibold text-slate-700">{p.criteria}</td>
                    <td className="p-5 text-sm font-bold text-center text-slate-800">{p.male}</td>
                    <td className="p-5 text-sm font-bold text-center text-slate-800">{p.female}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Important Links */}
      {showLinks && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Important Links</h2>
          {showLinksHtml ? (
            <div className="p-5 sarkari-content" dangerouslySetInnerHTML={{ __html: job.importantLinksHtml! }} />
          ) : (
            <div className="divide-y divide-slate-100">
              {job.links?.filter(l => hasText(l.label) && hasText(l.url)).map((l, i) => (
                <div key={i} className="grid grid-cols-2 items-center p-6 hover:bg-rose-50/30 transition-all duration-200">
                  <div className="font-bold text-slate-700 text-sm">{l.label}</div>
                  <div className="text-right">
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-rose-600 text-white px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all duration-200 shadow-lg shadow-rose-600/20 hover:shadow-xl">
                      Click Here
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Jobs */}
      {relatedJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md">
          <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Similar Jobs</h2>
          <div className="divide-y divide-slate-100">
            {relatedJobs.map(related => (
              <Link key={related.id} href={`/job/${(related as any).slug || related.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-1">{related.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{related.department}</p>
                  </div>
                  {(related as any).lastDate && (
                    <span className="text-xs text-orange-600 font-bold flex-shrink-0">{(related as any).lastDate}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* More Jobs */}

      {/* WhatsApp & Telegram Join Block */}
      <div className="bg-gradient-to-r from-green-500 to-sky-500 rounded-2xl p-5 shadow-lg">
        <p className="text-white font-black text-center text-base mb-1">🔔 सरकारी नौकरी अलर्ट पाएं!</p>
        <p className="text-white/80 text-center text-xs mb-4">Join करें और सबसे पहले पाएं — Jobs, Results, Admit Cards</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://whatsapp.com/channel/0029Vb7dt842ER6rNwc6eB47" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-green-600 font-black px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow text-sm">
            <svg className="w-5 h-5 fill-green-500" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Channel Join करें
          </a>
          <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white text-sky-600 font-black px-6 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow text-sm">
            <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram Channel Join करें
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
        <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">More Government Jobs</h2>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/latest-jobs">
              <div className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-blue-100">
                <span className="text-blue-700 font-bold text-sm">Latest Government Jobs</span>
              </div>
            </Link>
            <Link href="/latest-jobs?qualification=10th">
              <div className="bg-emerald-50 hover:bg-emerald-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-emerald-100">
                <span className="text-emerald-700 font-bold text-sm">10th Pass Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=police">
              <div className="bg-slate-100 hover:bg-slate-200 p-4 rounded-lg text-center transition-colors cursor-pointer border border-slate-200">
                <span className="text-slate-700 font-bold text-sm">Police Jobs</span>
              </div>
            </Link>
            <Link href="/search?q=ssc">
              <div className="bg-amber-50 hover:bg-amber-100 p-4 rounded-lg text-center transition-colors cursor-pointer border border-amber-100">
                <span className="text-amber-700 font-bold text-sm">SSC Jobs</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Fallback: Important Dates missing */}
      {!showDates && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Important Dates</h2>
          <div className="p-5">
            <p className="text-sm text-slate-600 mb-3">इस भर्ती की Important Dates जल्द Update की जाएंगी। Official Notification ज़रूर पढ़ें।</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Notification जारी होने की तारीख — Official Website देखें</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Online Form भरने की Start Date — Notification में दी जाएगी</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Last Date to Apply — Notification में दी जाएगी</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Admit Card Download Date — Exam से 2-3 हफ्ते पहले</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span> Exam Date — Notification में दी जाएगी</li>
            </ul>
            <p className="text-xs text-slate-400 mt-3 italic">⚠️ Exact dates ke liye official notification zaroor check karein.</p>
          </div>
        </div>
      )}

      {/* Fallback: Application Fee missing */}
      {!showFee && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest">Application Fee</h2>
          <div className="p-5">
            <p className="text-sm text-slate-600 mb-3">Application Fee की जानकारी Official Notification में दी जाएगी। आमतौर पर सरकारी भर्तियों में category-wise fee होती है:</p>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {[
                  ["General / OBC / EWS", "₹100 – ₹1000 (Exam अनुसार)"],
                  ["SC / ST", "₹0 – ₹500 (Relaxation मिलती है)"],
                  ["PWD / Ex-Serviceman", "प्रायः निःशुल्क (Free)"],
                  ["Female Candidates", "कई भर्तियों में Free होती है"],
                ].map(([cat, fee], i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                    <td className="p-4 text-slate-600 font-medium w-1/2">{cat}</td>
                    <td className="p-4 text-blue-700 font-bold">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-3 italic">⚠️ Exact fee ke liye official notification zaroor check karein.</p>
          </div>
        </div>
      )}

      {/* Fallback: Age Limit missing */}
      {!showAgeLimit && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Age Limit</h2>
          <div className="p-5">
            <p className="text-sm text-slate-600 mb-3">इस भर्ती की Age Limit Official Notification में दी जाएगी। सरकारी नौकरियों में आमतौर पर:</p>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {[
                  ["General", "18 – 27 वर्ष (Post अनुसार)"],
                  ["OBC", "3 साल की Relaxation"],
                  ["SC / ST", "5 साल की Relaxation"],
                  ["PWD", "10 साल की Relaxation"],
                  ["Ex-Serviceman", "Service Period + 3 साल"],
                ].map(([cat, age], i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                    <td className="p-4 text-slate-600 font-medium w-1/2">{cat}</td>
                    <td className="p-4 text-blue-700 font-bold">{age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-3 italic">⚠️ Exact age limit ke liye official notification zaroor check karein.</p>
          </div>
        </div>
      )}

      {/* Fallback: Vacancy Details missing */}
      {!showVacancy && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#006400] text-white p-4 text-sm font-bold uppercase tracking-widest text-center">Vacancy Details</h2>
          <div className="p-5">
            <p className="text-sm text-slate-600 mb-2">इस भर्ती की Post-wise Vacancy Details Official Notification में दी गई हैं। Apply करने से पहले:</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Notification में Total Vacancy check करें</li>
              <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Category-wise Vacancy (General/OBC/SC/ST/EWS) देखें</li>
              <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> अपनी Post के लिए Eligibility check करें</li>
              <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> State/Region wise vacancy भी हो सकती है</li>
            </ul>
            <p className="text-xs text-slate-400 mt-3 italic">⚠️ Exact vacancy ke liye official notification zaroor padhen.</p>
          </div>
        </div>
      )}

      {/* Fallback: Selection Process missing */}
      {!showSelection && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
          <h2 className="bg-[#800000] text-white p-4 text-sm font-bold uppercase tracking-widest">Selection Process</h2>
          <div className="p-7">
            <p className="text-sm text-slate-600 mb-4">इस भर्ती का Selection Process Official Notification में दिया गया है। सामान्यतः सरकारी भर्ती में ये steps होती हैं:</p>
            <ul className="space-y-3">
              {[
                "Written Exam / Computer Based Test (CBT)",
                "Physical Test (PST/PET) — Police, Army, Railway जैसी भर्तियों में",
                "Document Verification (DV)",
                "Medical Examination",
                "Final Merit List & Appointment",
              ].map((step, i) => (
                <li key={i} className="flex gap-4 items-center text-sm font-medium text-slate-600">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  {step}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-4 italic">⚠️ Exact selection process ke liye official notification zaroor check karein.</p>
          </div>
        </div>
      )}

      {/* PERMANENT: How to Apply — always visible on every post */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-md">
        <h2 className="bg-blue-700 text-white p-4 text-sm font-bold uppercase tracking-widest text-center">
          {job.type === 'admit-card' ? 'Admit Card Download कैसे करें?' :
           job.type === 'result' ? 'Result कैसे देखें?' :
           job.type === 'answer-key' ? 'Answer Key Download कैसे करें?' :
           'Apply Online कैसे करें?'}
        </h2>
        <div className="p-6">
          {job.type === 'admit-card' ? (
            <ol className="space-y-3">
              {[
                "ऊपर दिए 'Download Admit Card' button पर click करें",
                "Official Website पर जाएं",
                "Admit Card / Hall Ticket link पर click करें",
                "Registration Number / Roll Number और Date of Birth डालें",
                "Submit करें — Admit Card screen पर आ जाएगा",
                "Download करें और Print निकालें — Color या Black & White दोनों चलते हैं",
                "Exam वाले दिन Admit Card + Photo ID (Aadhar/Voter Card) साथ ले जाएं",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : job.type === 'result' ? (
            <ol className="space-y-3">
              {[
                "ऊपर दिए 'Download Result' button पर click करें",
                "Official Website पर जाएं",
                "Result / Score Card link पर click करें",
                "Roll Number / Registration Number डालें",
                "Submit करें — Result screen पर दिखेगा",
                "Score Card Download करें और Print कर लें",
                "Cut-off check करें — अगर ऊपर हैं तो Next Round के लिए तैयार रहें",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : job.type === 'answer-key' ? (
            <ol className="space-y-3">
              {[
                "ऊपर दिए 'Download Answer Key' button पर click करें",
                "Official Website पर जाएं",
                "Answer Key PDF Download करें",
                "अपने Answers से मिलाएं और Marks Calculate करें",
                "यदि कोई Answer गलत लगे — Objection Portal पर जाएं",
                "Objection Form भरें, Reference दें और Fee Pay करें",
                "Objection की Last Date से पहले Submit करें",
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="space-y-3">
              {(deptContent?.applySteps || [
                "पहले Official Notification ध्यान से पढ़ें — Eligibility check करें",
                `${job.department} की Official Website पर जाएं`,
                "New Registration करें — Email और Mobile Number डालें",
                "Online Application Form सही-सही भरें — सभी details verify करें",
                "Recent Photo और Signature Upload करें (Notification में size देखें)",
                "Application Fee Online Pay करें (Net Banking / UPI / Debit Card)",
                "Form Preview check करें और Final Submit करें",
                "Application Confirmation Print कर लें — भविष्य के लिए रखें",
              ]).map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>


            {/* Department-Specific Content Sections */}
      {deptContent && (
        <div className="space-y-4">
          {/* Exam Pattern */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <h2 className="bg-indigo-700 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest">
              📝 Exam Pattern
            </h2>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{deptContent.examPattern}</p>
            </div>
          </div>

          {/* Syllabus */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <h2 className="bg-purple-700 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest">
              📚 Syllabus Details
            </h2>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{deptContent.syllabus}</p>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <h2 className="bg-green-700 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest">
              💰 Salary Breakdown
            </h2>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{deptContent.salaryBreakdown}</p>
            </div>
          </div>

          {/* Preparation Tips */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <h2 className="bg-orange-600 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest">
              💡 Preparation Tips & Best Books
            </h2>
            <div className="p-5">
              <p className="text-sm text-slate-700 leading-relaxed">{deptContent.preparationTips}</p>
            </div>
          </div>

          {/* FAQs */}
          {deptContent.faqs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <h2 className="bg-slate-700 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest">
                ❓ Frequently Asked Questions
              </h2>
              <div className="p-5 space-y-4">
                {deptContent.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <p className="font-semibold text-sm text-slate-800 mb-1">Q: {faq.q}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 p-8 rounded-xl border border-amber-200">
        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Important Disclaimer
        </h4>
        <p className="text-sm font-medium text-amber-800/80 leading-relaxed">
          The recruitment information provided above is for immediate information to the candidates and does not constitute a legal document. While efforts have been made to make the information available as authentic as possible, please verify the details from the official website or notification before applying.
        </p>
      </div>
    </div>
  );
}
