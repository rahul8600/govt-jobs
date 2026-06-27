const slugRedirects: Record<string, string> = {
  "/job/348": "/job/upsc-geo-scientist-mains-admit-card-admit-card-2026-download-link-exam-date-348",
  "/job/340": "/job/mppsc-ses-state-engineering-services-answer-key-answer-key-2026-download-pdf-340",
  "/job/341": "/job/rpsc-si-platoon-commander-answer-key-answer-key-2026-download-pdf-objection-cut-341",
  "/job/342": "/job/bpsc-special-school-teacher-final-answer-key-answer-key-2026-download-pdf-342",
  "/job/343": "/job/bpsc-aso-assistant-section-officer-final-answer-key-answer-key-2026-download-343",
  "/job/344": "/job/rrb-ntpc-graduate-level-cbt-ii-exam-date-admit-card-2026-download-link-exam-344",
  "/job/345": "/job/nta-neet-ug-re-exam-city-details-admit-card-2026-download-link-exam-date-hall-345",
  "/job/346": "/job/nta-ugc-net-june-exam-city-details-admit-card-2026-download-link-exam-date-hall-346",
  "/job/347": "/job/upsc-engineering-services-ese-mains-admit-card-admit-card-2026-download-link-347",
};

import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

// ALL bots + Google Inspection Tool
const BOT_AGENTS = [
  'googlebot', 'google-inspection-tool', 'google-site-verification',
  'apis-google', 'mediapartners-google', 'adsbot-google',
  'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot',
  'applebot', 'discordbot', 'slackbot', 'chrome-lighthouse',
  'developers.google.com', 'w3c_validator'
];

function isBot(userAgent: string): boolean {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return false;
  if (BOT_AGENTS.some(bot => ua.includes(bot))) return true;
  if (ua.includes('google')) return true;
  return false;
}

function esc(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ===== STATE TO CITY MAP =====
const STATE_CITY_MAP: Record<string, { city: string; postal: string }> = {
  'Uttar Pradesh': { city: 'Lucknow', postal: '226001' },
  'Bihar': { city: 'Patna', postal: '800001' },
  'Rajasthan': { city: 'Jaipur', postal: '302001' },
  'Madhya Pradesh': { city: 'Bhopal', postal: '462001' },
  'Maharashtra': { city: 'Mumbai', postal: '400001' },
  'Delhi': { city: 'New Delhi', postal: '110001' },
  'Gujarat': { city: 'Ahmedabad', postal: '380001' },
  'Karnataka': { city: 'Bangalore', postal: '560001' },
  'Tamil Nadu': { city: 'Chennai', postal: '600001' },
  'West Bengal': { city: 'Kolkata', postal: '700001' },
  'Andhra Pradesh': { city: 'Hyderabad', postal: '500001' },
  'Telangana': { city: 'Hyderabad', postal: '500001' },
  'Kerala': { city: 'Thiruvananthapuram', postal: '695001' },
  'Punjab': { city: 'Chandigarh', postal: '160001' },
  'Haryana': { city: 'Chandigarh', postal: '160001' },
  'Jharkhand': { city: 'Ranchi', postal: '834001' },
  'Odisha': { city: 'Bhubaneswar', postal: '751001' },
  'Chhattisgarh': { city: 'Raipur', postal: '492001' },
  'Assam': { city: 'Guwahati', postal: '781001' },
  'Uttarakhand': { city: 'Dehradun', postal: '248001' },
  'Himachal Pradesh': { city: 'Shimla', postal: '171001' },
  'All India': { city: 'New Delhi', postal: '110001' },
  'India': { city: 'New Delhi', postal: '110001' },
};

function getSalaryFromTitle(title: string, qualification: string): { min: number; max: number } {
  const t = (title + ' ' + qualification).toLowerCase();
  if (t.includes('ias') || t.includes('ips') || t.includes('ifs') || t.includes('upsc')) return { min: 56100, max: 250000 };
  if (t.includes('ssc cgl') || t.includes('bank po') || t.includes('manager')) return { min: 35400, max: 112400 };
  if (t.includes('constable') || t.includes('clerk') || t.includes('mts') || t.includes('10th')) return { min: 18000, max: 35000 };
  if (t.includes('teacher') || t.includes('lecturer') || t.includes('professor')) return { min: 35400, max: 104400 };
  if (t.includes('engineer') || t.includes('technical')) return { min: 44900, max: 142400 };
  if (t.includes('nurse') || t.includes('doctor') || t.includes('medical')) return { min: 35400, max: 67700 };
  if (t.includes('railway') || t.includes('rrb') || t.includes('alp')) return { min: 19900, max: 63200 };
  return { min: 25500, max: 81100 };
}

function getEducationCategory(qualification: string): string {
  const q = (qualification || '').toLowerCase();
  // Valid schema.org credentialCategory enum values accepted by Google
  if (q.includes('10th') || q.includes('matriculation') || q.includes('sslc')) return 'high school';
  if (q.includes('12th') || q.includes('intermediate') || q.includes('higher secondary')) return 'high school';
  if (q.includes('iti') || q.includes('diploma')) return 'associate degree';
  if (q.includes('b.tech') || q.includes('be ') || q.includes('engineering')) return 'bachelor degree';
  if (q.includes('mbbs') || q.includes('bds') || q.includes('b.sc nursing')) return 'bachelor degree';
  if (q.includes('m.tech') || q.includes('mba') || q.includes('m.sc') || q.includes('post grad') || q.includes('master')) return 'postgraduate degree';
  if (q.includes('graduation') || q.includes('graduate') || q.includes('bachelor') || q.includes('b.sc') || q.includes('b.com') || q.includes('b.a')) return 'bachelor degree';
  return 'bachelor degree';
}

// ===== HOW-TO GUIDE by type =====
function getHowToGuide(type: string): string {
  if (type === 'admit-card') {
    return `
    <h2>Admit Card Download Kaise Karein – Step by Step Guide</h2>
    <p>Agar aap is exam ke liye registered hain, to niche diye steps follow karke apna admit card download kar sakte hain:</p>
    <ol>
      <li><strong>Official website open karein</strong> – Upar diye "Download Admit Card" button par click karein ya seedha official website par jayein.</li>
      <li><strong>Admit Card / Hall Ticket link dhundein</strong> – Homepage par ya Latest News section mein link milega.</li>
      <li><strong>Login karein</strong> – Registration Number / Roll Number aur Date of Birth ya Password enter karein.</li>
      <li><strong>Submit karein</strong> – Aapka admit card screen par aa jayega.</li>
      <li><strong>Check karein</strong> – Naam, Roll Number, Exam Date, Exam Center sab verify karein. Koi galti ho to official helpline contact karein.</li>
      <li><strong>Download aur Print karein</strong> – Color ya Black &amp; White dono valid hote hain, check notification for instructions.</li>
      <li><strong>Exam day par kya le jayein</strong> – Admit Card ke saath ek valid Photo ID (Aadhar Card, Voter ID, Passport, Driving License) aur latest passport size photo saath rakhen.</li>
    </ol>
    <h2>Admit Card mein kya information hoti hai?</h2>
    <p>Admit Card ek important document hota hai jo exam mein entry ke liye zaroori hai. Iski jagah le sakti hai andar jaane ki permission. Ispe likha hota hai:</p>
    <ul>
      <li>Candidate ka Naam aur Roll Number</li>
      <li>Exam Date aur Reporting Time</li>
      <li>Exam Center ka Pata</li>
      <li>Exam ka Pattern aur Instructions</li>
      <li>Candidate ki Photograph aur Signature</li>
    </ul>
    <p><strong>Zaruri baat:</strong> Admit card ke bina exam hall mein entry nahi milti. Exam se ek din pehle apna admit card aur center ka pata zaroor confirm karein.</p>`;
  }
  if (type === 'result') {
    return `
    <h2>Result Kaise Dekhein – Step by Step Guide</h2>
    <p>Sarkari exam ka result check karna bahut aasaan hai. Niche diye steps follow karein:</p>
    <ol>
      <li><strong>Official website open karein</strong> – Upar diye "Download Result" button par click karein.</li>
      <li><strong>Result / Score Card link dhundein</strong> – Website par "Result 2026" ya "Score Card" section mein jayein.</li>
      <li><strong>Details enter karein</strong> – Roll Number / Registration Number aur Date of Birth ya password enter karein.</li>
      <li><strong>Submit karein</strong> – Result screen par aa jayega.</li>
      <li><strong>Score Card download karein</strong> – Future reference ke liye save aur print kar lein.</li>
      <li><strong>Cut-off check karein</strong> – Agar aap cut-off se upar hain to next round ke liye tayar ho jayein.</li>
      <li><strong>Merit list bhi dekhein</strong> – PDF mein aapka naam hai ya nahi, check karein.</li>
    </ol>
    <h2>Result ke baad kya hoga?</h2>
    <p>Result ke baad generally ye process hoti hai:</p>
    <ul>
      <li><strong>Qualified candidates</strong> ko next stage (Physical Test / Document Verification / Interview) ke liye bulaya jata hai</li>
      <li><strong>Final merit list</strong> ke baad appointment letters bheje jate hain</li>
      <li><strong>Cut-off marks</strong> category wise alag alag hote hain – General, OBC, SC, ST, EWS</li>
    </ul>`;
  }
  if (type === 'answer-key') {
    return `
    <h2>Answer Key Kaise Download Karein aur Objection Kaise Darj Karein</h2>
    <p>Exam ke baad answer key check karke aap apna score estimate kar sakte hain:</p>
    <ol>
      <li><strong>Official website open karein</strong> – Upar diye "Download Answer Key" button par click karein.</li>
      <li><strong>Answer Key PDF download karein</strong> – Set-wise (Set A, B, C, D) answer key available hoti hai.</li>
      <li><strong>Apne answers se milayein</strong> – Question number match karke sahi aur galat answers count karein.</li>
      <li><strong>Score calculate karein</strong> – Marking scheme ke hisab se (generally +1 sahi / -0.25 galat).</li>
      <li><strong>Objection darj karein (agar zaruri ho)</strong> – Koi answer galat lage to objection portal par jayein.</li>
      <li><strong>Objection form bharen</strong> – Question number, aapka jawab, aur reference/source mention karein.</li>
      <li><strong>Fee pay karein</strong> – Har question par ek fixed fee lagti hai (usually ₹50-200).</li>
      <li><strong>Last date se pehle submit karein</strong> – Deadline miss mat karein.</li>
    </ol>
    <h2>Objection window ke baad kya hoga?</h2>
    <ul>
      <li>Board sabhi objections review karta hai aur agar valid hue to Final Answer Key update ki jati hai</li>
      <li>Valid objections ki fee refund ho jati hai</li>
      <li>Final answer key ke basis par final result declare hota hai</li>
    </ul>`;
  }
  if (type === 'admission') {
    return `
    <h2>Online Admission Form Kaise Bharein – Step by Step Guide</h2>
    <p>Government college ya entrance exam mein admission ke liye niche steps follow karein:</p>
    <ol>
      <li><strong>Official notification padhen</strong> – Pehle eligibility, age limit, documents aur fee check karein.</li>
      <li><strong>Official website open karein</strong> – Upar diye "Apply Online" button par click karein.</li>
      <li><strong>New Registration karein</strong> – Email ID aur Mobile Number se register karein. Password save karein.</li>
      <li><strong>Application form bharein</strong> – Personal details, academic details, address sab sahi sahi bharein.</li>
      <li><strong>Documents upload karein</strong> – Photo, Signature, 10th/12th Marksheet, Category Certificate (agar applicable ho).</li>
      <li><strong>Application fee pay karein</strong> – Net Banking / UPI / Debit Card se.</li>
      <li><strong>Preview check karein</strong> – Submit se pehle ek baar poora form review karein.</li>
      <li><strong>Final Submit karein</strong> – Confirmation / Acknowledgement print ya save kar lein.</li>
    </ol>
    <h2>Admission ke liye important documents</h2>
    <ul>
      <li>10th aur 12th Marksheet aur Certificate</li>
      <li>Category Certificate (OBC/SC/ST/EWS) – if applicable</li>
      <li>Domicile Certificate (State govt courses ke liye)</li>
      <li>Aadhar Card (ID proof)</li>
      <li>Passport size Photograph (latest, white background)</li>
      <li>Signature (white paper par blue/black ink se)</li>
    </ul>`;
  }
  // default: job
  return `
  <h2>Online Apply Kaise Karein – Step by Step Guide</h2>
  <p>Sarkari naukri mein online apply karna bahut aasaan hai. Niche diye steps follow karein:</p>
  <ol>
    <li><strong>Notification ध्यान से पढ़ें</strong> – Pehle official notification padhen. Eligibility, age limit, qualification sab check karein.</li>
    <li><strong>Apply Online button par click karein</strong> – Upar diye button se official apply page par jayein.</li>
    <li><strong>New Registration karein</strong> – Official website par apna Email aur Mobile Number se account banayein. Registration Number / Password save karein.</li>
    <li><strong>Application Form bharein</strong> – Personal information, educational qualification, address sab sahi bharein. Galat information se form reject ho sakta hai.</li>
    <li><strong>Photo aur Signature upload karein</strong> – Photo: white background, latest, size as per notification. Signature: white paper, blue/black pen, scan karein.</li>
    <li><strong>Application Fee pay karein</strong> – Net Banking, UPI, Debit/Credit Card se. SC/ST/Female candidates ko relaxation milti hai – notification check karein.</li>
    <li><strong>Form preview check karein</strong> – Final submit se pehle ek baar poora form review zaroor karein.</li>
    <li><strong>Final Submit karein aur Print karein</strong> – Acknowledgement Number note karein aur form ka printout le lein. Future mein admit card aur result check karne ke liye kaam aayega.</li>
  </ol>
  <h2>Apply karne se pehle ye zaroor check karein</h2>
  <ul>
    <li><strong>Age Limit</strong> – Apni category ke hisab se age eligibility confirm karein</li>
    <li><strong>Educational Qualification</strong> – Required degree/certificate available hai ya nahi</li>
    <li><strong>Application Fee</strong> – Category wise fee alag hoti hai</li>
    <li><strong>Last Date</strong> – Last date se 2-3 din pehle apply karein – last moment server busy ho jata hai</li>
    <li><strong>Documents</strong> – Photo, Signature, Certificates ready rakhein pehle se</li>
  </ul>`;
}

// ===== FULL RICH HTML GENERATOR FOR BOTS =====

// ===== UNIQUE CONTENT GENERATOR =====
function getUniquePageContent(job: any): string {
  const dept = (job.department || '').toLowerCase();
  const type = (job.type || '').toLowerCase();
  const state = (job.state || '').toLowerCase();
  const qual = (job.qualification || '').toLowerCase();
  const title = (job.title || '');

  // Department specific taiyari tips
  let taiyariContent = '';

  if (dept.includes('ssc') || dept.includes('staff selection')) {
    taiyariContent = `
    <h2>${esc(title)} – Taiyari Tips 2026</h2>
    <p>SSC exams ki taiyari ke liye yeh subjects sabse important hain. Agar aap abhi se sahi strategy banao toh selection pakka ho sakta hai:</p>
    <ul>
      <li><strong>Quantitative Aptitude:</strong> Number System, Percentage, Ratio, Time-Work, Algebra, Geometry — Rakesh Yadav ki book best hai</li>
      <li><strong>General Intelligence & Reasoning:</strong> Analogy, Series, Coding-Decoding, Blood Relations, Direction Sense — roz 30-40 questions practice karo</li>
      <li><strong>English Language:</strong> Reading Comprehension, Error Detection, Fill in the Blanks, Cloze Test — SP Bakshi ya Wren & Martin follow karo</li>
      <li><strong>General Awareness:</strong> Current Affairs (last 6 months), Static GK, Science, History, Geography — monthly magazine zaroor padho</li>
    </ul>
    <p><strong>Strategy:</strong> Pehle previous year papers solve karo — SSC ke papers mein bahut repetition hoti hai. Tier-1 mein speed important hai — 100 questions 60 minutes mein. Mock tests roz do.</p>`;
  } else if (dept.includes('railway') || dept.includes('rrb') || title.toLowerCase().includes('railway') || title.toLowerCase().includes('rrb')) {
    taiyariContent = `
    <h2>${esc(title)} – Taiyari Tips 2026</h2>
    <p>Railway exams ki preparation ke liye yeh points dhyan mein rakho. RRB exams mein competition bahut zyada hota hai lekin pattern samajhne ke baad selection mushkil nahi:</p>
    <ul>
      <li><strong>Mathematics:</strong> BODMAS, Fractions, LCM-HCF, Percentage, Profit-Loss, Simple & Compound Interest, Time-Distance — Class 10 level ke questions aate hain</li>
      <li><strong>General Intelligence:</strong> Analogy, Classification, Coding-Decoding, Mathematical Operations, Venn Diagrams, Syllogism</li>
      <li><strong>General Science:</strong> Physics, Chemistry, Biology — NCERT Class 9 aur 10 se padho — sabse important source hai</li>
      <li><strong>General Awareness:</strong> Railway related GK, Current Affairs, Indian History, Geography — Railway Minister ka naam, Railway zones sabhi yaad karo</li>
    </ul>
    <p><strong>Physical Test (PET) tip:</strong> Railway ALP, Technician aur Group D mein physical test hota hai. Male ke liye 1000 meter 4 minutes 15 seconds mein — abhi se running shuru karo!</p>`;
  } else if (dept.includes('police') || title.toLowerCase().includes('police') || title.toLowerCase().includes('constable') || dept.includes('cisf') || dept.includes('bsf') || dept.includes('crpf')) {
    taiyariContent = `
    <h2>${esc(title)} – Taiyari Tips Aur Physical Preparation 2026</h2>
    <p>Police bharti mein written exam ke saath physical test bhi hota hai — dono ki taiyari saath mein zaroor karo:</p>
    <ul>
      <li><strong>Written Exam:</strong> Hindi Grammar, General Knowledge, Reasoning, Basic Mathematics — Class 10 level ke questions aate hain</li>
      <li><strong>GK ke liye:</strong> State ka itihas, bhugol, rajniti — khaas tor par apne state ki jankari bahut zaroori hai</li>
      <li><strong>Physical Fitness:</strong> Running roz karo — Male ke liye generally 1.6km 6 minutes mein, Female 1km 4 minutes mein</li>
      <li><strong>Height & Chest:</strong> Male ke liye minimum 167-168 cm height, chest 79-84 cm — inhale-exhale practice karo</li>
      <li><strong>Mental Preparation:</strong> Police duty demanding hoti hai — physical aur mental dono fitness zaroori hai</li>
    </ul>
    <p><strong>Important:</strong> Police mein Character Verification bhi hoti hai — kisi bhi criminal case mein nahi hona chahiye. Police bharti ke baad training period mein bhi mehnat zaroori hai.</p>`;
  } else if (dept.includes('upsc') || dept.includes('civil service') || title.toLowerCase().includes('ias') || title.toLowerCase().includes('ips') || title.toLowerCase().includes('nda') || title.toLowerCase().includes('cds')) {
    taiyariContent = `
    <h2>${esc(title)} – Taiyari Strategy 2026</h2>
    <p>UPSC exams India ki sabse prestigious aur mushkil parikshayein hain. Sahi planning aur dedicated study se success milti hai:</p>
    <ul>
      <li><strong>NCERT Foundation:</strong> Class 6 se 12 tak ki NCERT books pehle complete karo — History, Geography, Polity, Economics, Science</li>
      <li><strong>Standard Books:</strong> Laxmikanth (Polity), Bipin Chandra (History), Shankar IAS (Environment), Spectrum (Modern History)</li>
      <li><strong>Current Affairs:</strong> The Hindu ya Indian Express daily padho — minimum 1-2 ghante news reading zaroori hai</li>
      <li><strong>Answer Writing:</strong> UPSC Mains ke liye roz answer writing practice karo — 250 words ke answers structured tarike se likhne ki practice karo</li>
      <li><strong>Optional Subject:</strong> Soch samajhkar choose karo — scoring subject chunna important hai</li>
    </ul>
    <p><strong>NDA ke liye:</strong> Mathematics aur English pe zyada focus karo. Physical fitness bhi maintain karo — SSB interview mein personality assessment hota hai.</p>`;
  } else if (dept.includes('bank') || dept.includes('ibps') || dept.includes('sbi') || dept.includes('rbi') || title.toLowerCase().includes('bank')) {
    taiyariContent = `
    <h2>${esc(title)} – Bank Exam Taiyari Tips 2026</h2>
    <p>Bank exams mein competition bahut hai lekin preparation sahi ho toh selection zaroor hoga. Bank jobs mein security ke saath achhi salary bhi milti hai:</p>
    <ul>
      <li><strong>Quantitative Aptitude:</strong> Data Interpretation sabse important — pie charts, bar graphs, tables roz practice karo. Simplification, Number Series, Quadratic Equations bhi important hain</li>
      <li><strong>Reasoning Ability:</strong> Puzzle, Seating Arrangement, Syllogism, Coding-Decoding — bank exams mein yeh section scoring hai</li>
      <li><strong>English Language:</strong> Reading Comprehension, Error Correction, Sentence Rearrangement — English strong karo</li>
      <li><strong>General Awareness (Banking):</strong> Banking terms, RBI policies, current rates, Financial Awareness — Monthly Banking Awareness capsule zaroor padho</li>
      <li><strong>Computer Knowledge:</strong> MS Office basics, Internet, Banking software — basic computer knowledge zaroori hai</li>
    </ul>
    <p><strong>Interview tip:</strong> Bank PO mein interview hota hai — dress formal raho, banking current affairs aur your state economy ke baare mein ready raho.</p>`;
  } else if (dept.includes('teacher') || dept.includes('tet') || dept.includes('ctet') || dept.includes('rpsc') || dept.includes('kpsc') || title.toLowerCase().includes('teacher') || title.toLowerCase().includes('lecturer')) {
    taiyariContent = `
    <h2>${esc(title)} – Teacher Bharti Taiyari Guide 2026</h2>
    <p>Teacher banna ek noble profession hai. Is bharti mein select hone ke liye in points pe focus karo:</p>
    <ul>
      <li><strong>Child Development & Pedagogy:</strong> TET exams mein yeh section compulsory hota hai — Jean Piaget, Vygotsky, Bloom's Taxonomy yaad karo</li>
      <li><strong>Language (Hindi/English):</strong> Grammar, Comprehension, Writing Skills — apni teaching language strong karo</li>
      <li><strong>Subject Knowledge:</strong> Jis subject mein teaching karni hai use NCERT se padho — question paper mein school level ke questions aate hain</li>
      <li><strong>Environmental Studies:</strong> Primary level ke liye EVS important hai — Nature, Environment, Social Sciences sab cover karo</li>
      <li><strong>Teaching Methodology:</strong> How to teach concepts — practical examples, activities, teaching aids ke baare mein padho</li>
    </ul>
    <p><strong>Remember:</strong> Teacher hone ke saath patience aur communication skills bhi develop karo — interview ya demo lesson mein yeh check kiya jaata hai.</p>`;
  } else if (type === 'admit-card') {
    taiyariContent = `
    <h2>${esc(title)} – Admit Card Download Kaise Karein</h2>
    <p>Admit card download karne se pehle aur exam ke din yeh zaroori baatein dhyan mein rakho:</p>
    <ul>
      <li><strong>Step 1:</strong> Official website par jayein (upar diye link se)</li>
      <li><strong>Step 2:</strong> Admit Card / Hall Ticket section mein jayein</li>
      <li><strong>Step 3:</strong> Registration Number / Roll Number aur Date of Birth enter karein</li>
      <li><strong>Step 4:</strong> Admit Card PDF download karein aur A4 size mein print karein</li>
      <li><strong>Step 5:</strong> Colored photo ek print pe paste karein (agar required ho)</li>
    </ul>
    <h3>Exam Center Par Kya Leke Jayein?</h3>
    <ul>
      <li>✅ Original Admit Card print (2 copies leke jayein)</li>
      <li>✅ Original Photo ID Proof — Aadhar Card, Voter ID, Passport, Driving License</li>
      <li>✅ Passport size photographs (2-4 extra)</li>
      <li>✅ Black/Blue ballpoint pen</li>
      <li>❌ Mobile phone, electronic devices, calculator, wallet — exam hall mein allowed nahi</li>
    </ul>
    <p><strong>Important:</strong> Exam center par 30 minutes pehle pahunchein. Admit card mein likhe reporting time ko strictly follow karein.</p>`;
  } else if (type === 'result') {
    taiyariContent = `
    <h2>${esc(title)} – Result Check Kaise Karein</h2>
    <p>Result dekhne ke baad yeh steps follow karein:</p>
    <ul>
      <li><strong>Result Check:</strong> Upar diye direct link se ya official website par jayein</li>
      <li><strong>Login:</strong> Roll Number / Registration Number aur Date of Birth enter karein</li>
      <li><strong>Download:</strong> Result PDF ya merit list download karein aur save karein</li>
      <li><strong>Cut Off:</strong> Official cut off marks zaroor check karein — category wise alag hoti hai</li>
    </ul>
    <h3>Result ke Baad Kya Karein?</h3>
    <ul>
      <li>✅ <strong>Selected hain toh:</strong> Document Verification / Medical ki taiyari shuru karein</li>
      <li>✅ <strong>Waiting list mein hain toh:</strong> Official notification follow karte rahein</li>
      <li>✅ <strong>Qualify nahi kiya toh:</strong> Galtiyan analyze karo aur agli preparation mein sudhar karo</li>
      <li>📋 <strong>Documents ready rakho:</strong> Marksheets, Caste Certificate, Domicile, Photo ID, Passport Photos</li>
    </ul>
    <p><strong>SarkariJobSeva tip:</strong> Result ka printout aur screenshot zaroor save karo — future reference ke liye kaam aata hai. Official website par bhi cross-verify zaroor karo.</p>`;
  } else if (type === 'answer-key') {
    taiyariContent = `
    <h2>${esc(title)} – Answer Key Se Apna Score Kaise Calculate Karein</h2>
    <p>Official answer key aane ke baad in steps se apna estimated score calculate karo:</p>
    <ul>
      <li><strong>Step 1:</strong> Answer key PDF download karo (upar diya link)</li>
      <li><strong>Step 2:</strong> Apne question paper se match karo — Set A/B/C/D dhyan se dekho</li>
      <li><strong>Step 3:</strong> Sahi jawaabon ko count karo</li>
      <li><strong>Step 4:</strong> Negative marking hai toh minus karo (aamtaur par ¼ ya ⅓ mark)</li>
      <li><strong>Step 5:</strong> Previous year cut off se compare karo</li>
    </ul>
    <h3>Objection Kaise Karen Agar Answer Galat Lage?</h3>
    <ul>
      <li>Official website par "Answer Key Challenge" section mein jayein</li>
      <li>Galat lagne wale question ka number aur reason likho</li>
      <li>Evidence ke tor par reference books ya official source ka link do</li>
      <li>Objection fee (agar applicable) pay karo</li>
      <li>Deadline se pehle submit karo — late objection accepted nahi hota</li>
    </ul>
    <p><strong>Note:</strong> Final answer key aur result official website par hi valid maana jaata hai. Kisi bhi coaching ya unofficial source ki answer key blindly mat mano.</p>`;
  } else if (type === 'admission') {
    taiyariContent = `
    <h2>${esc(title)} – Admission Form Kaise Bharein</h2>
    <p>Admission form fill karte waqt in baaton ka dhyan rakho taaki form reject na ho:</p>
    <ul>
      <li><strong>Documents Ready Rakho:</strong> 10th, 12th marksheet, graduation certificate (agar applicable), photo, signature, ID proof, caste certificate</li>
      <li><strong>Photo Specifications:</strong> Recent passport size photo — white background, clear face, 20KB-200KB JPG format</li>
      <li><strong>Signature:</strong> White paper pe black pen se karo, scan karo ya smartphone se photo khicho</li>
      <li><strong>Details Accuracy:</strong> Name exactly board certificate ke anusaar likho — spelling mistake se rejection ho sakti hai</li>
      <li><strong>Fee Payment:</strong> UPI ya Net Banking se karo — payment confirmation screenshot save karo</li>
    </ul>
    <h3>Entrance Exam Taiyari Tips:</h3>
    <ul>
      <li>Syllabus download karo aur topic-wise study plan banao</li>
      <li>Previous year papers solve karo — pattern samajhna zaroori hai</li>
      <li>Mock tests weekly do — time management practice karo</li>
      <li>Weak subjects pe extra time do</li>
    </ul>
    <p><strong>Important:</strong> Admission ke liye sirf official portal use karo. Kisi bhi agent ya third-party site ko fee mat do.</p>`;
  } else {
    taiyariContent = `
    <h2>${esc(title)} – Kaise Karein Taiyari?</h2>
    <p>Is sarkari bharti ki taiyari ke liye yeh general tips follow karo:</p>
    <ul>
      <li><strong>Syllabus:</strong> Pehle official syllabus download karo aur topic-wise study plan banao</li>
      <li><strong>Previous Papers:</strong> Pichle 5-10 saal ke question papers solve karo — pattern samajhna zaroori hai</li>
      <li><strong>Mock Tests:</strong> Weekly mock tests do — time management aur accuracy dono improve hogi</li>
      <li><strong>Current Affairs:</strong> Roz newspaper padho ya monthly current affairs magazine follow karo</li>
      <li><strong>Revision:</strong> Jo padha hai use regularly revise karo — sirf nayi cheez padhna kafi nahi</li>
    </ul>
    <p>SarkariJobSeva.com par is bharti se judi saari latest updates milti rahegi — notifications, admit card, result sab ek jagah!</p>`;
  }

  // State specific content
  let stateContent = '';
  if (state.includes('uttar pradesh') || state.includes('up')) {
    stateContent = `
    <h2>Uttar Pradesh Ke Candidates Ke Liye Khaas Jankari</h2>
    <p>UP mein sarkari naukri ka sapna dekhne wale lakhon yuvaon ke liye yeh bharti ek suhana mauka hai. UP mein sabse zyada government jobs hain — railway, police, teaching, state PSC sab mein UP ke candidates bahut sangharsh karte hain aur select bhi hote hain.</p>
    <ul>
      <li><strong>Domicile:</strong> UP ke permanent residents ko priority milti hai — UP domicile certificate zaroori hai</li>
      <li><strong>OBC/SC/ST:</strong> UP mein reserved category candidates ko fee aur age dono mein relaxation milti hai</li>
      <li><strong>EWS:</strong> Economically Weaker Section certificate Tehsildar se banwao — bahut helpful hai</li>
      <li><strong>Language:</strong> UP ke exams mein Hindi medium students ko advantage hota hai</li>
    </ul>`;
  } else if (state.includes('bihar')) {
    stateContent = `
    <h2>Bihar Ke Candidates Ke Liye Khaas Jankari</h2>
    <p>Bihar ke lakho yuva sarkari naukri ke liye mehnat karte hain. BPSC, BSSC, Bihar Police, Bihar Teacher — yeh sab Bihar ke students ke liye bade mauke hain. Bihar se IAS, IPS aur bade officers bhi nikle hain — hausla rakho!</p>
    <ul>
      <li><strong>Domicile:</strong> Bihar permanent resident certificate zaroori hai — Block/Tehsil se banwao</li>
      <li><strong>BPSC:</strong> Bihar mein BPSC sabse prestigious exam hai — SDO, DSP, BDO jaisi posts milti hain</li>
      <li><strong>Bihar Police:</strong> CSBC ke through bharti hoti hai — physical test compulsory hai</li>
      <li><strong>Language:</strong> Bihar ke exams Hindi mein hote hain — Hindi grammar strong karo</li>
    </ul>`;
  } else if (state.includes('rajasthan')) {
    stateContent = `
    <h2>Rajasthan Ke Candidates Ke Liye Khaas Jankari</h2>
    <p>Rajasthan mein RPSC, RSMSSB aur Rajasthan Police ke through hazaron sarkari jobs nikalti hain. Rajasthan ke students ki mehnat aur dedication kabile tarif hai:</p>
    <ul>
      <li><strong>RPSC:</strong> Rajasthan Public Service Commission se RAS, RPS, SI, School Lecturer ki bhartiyan nikalti hain</li>
      <li><strong>RSMSSB:</strong> Group C posts ke liye — Livestock Assistant, Constable, Junior Engineer</li>
      <li><strong>Language:</strong> Rajasthan ke exams mein Rajasthan ka itihas, bhugol aur sanskriti important hai</li>
      <li><strong>Domicile:</strong> Rajasthan permanent resident certificate required hota hai</li>
    </ul>`;
  } else if (state.includes('madhya pradesh') || state.includes('mp')) {
    stateContent = `
    <h2>Madhya Pradesh Ke Candidates Ke Liye Khaas Jankari</h2>
    <p>MP mein MPPSC, MPESB, MP Police ke through bahut saari sarkari jobs aati hain. MP ke students ke liye yeh khaas tips:</p>
    <ul>
      <li><strong>MPPSC:</strong> MP State Civil Services ke liye — DSP, Deputy Collector jaisi posts</li>
      <li><strong>MPESB:</strong> Group 2 aur 3 posts ke liye — Teacher, Nurse, Patwari</li>
      <li><strong>CPCT:</strong> MP government jobs ke liye Computer Proficiency Certificate zaroori hota hai — pehle se de lo</li>
      <li><strong>Language:</strong> MP ke exams mein MP ka itihas, geography important hai</li>
    </ul>`;
  } else if (state === 'all india' || state.includes('all india') || state === '') {
    stateContent = `
    <h2>All India Candidates Ke Liye Khaas Tips</h2>
    <p>Yeh bharti puri India ke candidates ke liye open hai — kisi bhi state se apply kar sakte hain. Kuch important baatein:</p>
    <ul>
      <li><strong>Age proof:</strong> 10th certificate sahi age proof hai — board certificate use karo</li>
      <li><strong>Category certificate:</strong> SC/ST/OBC/EWS certificate state government se issue hona chahiye</li>
      <li><strong>Domicile:</strong> Kuch posts mein state domicile nahi chahiye — notification check karo</li>
      <li><strong>Language:</strong> All India exams mein English aur Hindi dono options hote hain zyaatar</li>
      <li><strong>Multiple states:</strong> Aap apni preferred posting location choose kar sakte hain (agar option ho)</li>
    </ul>`;
  }

  // Qualification specific tips
  let qualContent = '';
  if (qual.includes('10th') || qual.includes('matric')) {
    qualContent = `
    <h2>10th Pass Ke Liye Sarkari Job Tips</h2>
    <p>10th pass hone ke baad bhi bahut saari sarkari jobs available hain — Army Agniveer, Railway Group D, SSC MTS, Police Constable aur kai aur. Agar abhi 12th kar rahe hain toh bhi in forms ke liye eligible ho sakte hain:</p>
    <ul>
      <li>ITI ya vocational course karo — Railway aur technical jobs mein advantage milta hai</li>
      <li>Physical fitness maintain karo — zyaatar 10th level jobs mein physical test hota hai</li>
      <li>Math aur Reasoning strong karo — basic level hai lekin speed aur accuracy zaroori hai</li>
      <li>Hindi/English basic grammar — written test mein kaam aayegi</li>
    </ul>`;
  } else if (qual.includes('12th') || qual.includes('intermediate')) {
    qualContent = `
    <h2>12th Pass Ke Liye Best Sarkari Job Strategy</h2>
    <p>12th pass candidates ke liye bahut saare options hain — SSC CHSL, Railway ALP/Technician, NDA, Police, Airforce Agniveer. Ek saath multiple forms bhar sakte ho:</p>
    <ul>
      <li>SSC CHSL ka form zaroor bharo — LDC/DEO posts milti hain</li>
      <li>NDA ke liye — 12th ke saath apply karo, interview aur SSB clear karo</li>
      <li>Agniveer — Army, Navy, Airforce teeno ke forms bharo</li>
      <li>State level jobs — apne state ki PSC aur SSC ka form bhi do</li>
    </ul>`;
  } else if (qual.includes('graduation') || qual.includes('graduate') || qual.includes('bachelor')) {
    qualContent = `
    <h2>Graduate Candidates Ke Liye Premium Sarkari Job Options</h2>
    <p>Graduation ke baad sarkari job ke best options — SSC CGL, UPSC, Bank PO, State PSC. Yeh posts zyada salary aur respect deti hain:</p>
    <ul>
      <li><strong>SSC CGL:</strong> Income Tax Inspector, CBI Sub Inspector — ₹75,000+ salary</li>
      <li><strong>UPSC CSE:</strong> IAS, IPS — highest prestige aur power</li>
      <li><strong>Bank PO:</strong> IBPS PO, SBI PO — good salary aur career growth</li>
      <li><strong>State PSC:</strong> SDO, DSP, BDO — apne state mein posting</li>
    </ul>
    <p>Multiple exams ek saath prepare karo — SSC CGL aur Bank PO ka syllabus overlap hota hai.</p>`;
  }

  return taiyariContent + stateContent + qualContent;
}
// ===== END UNIQUE CONTENT GENERATOR =====

function generateJobHTML(job: any, canonical: string): string {
  const jobTitle = esc(job.title || '');
  const baseTitle = job.title && job.title.length > 50
    ? job.title.slice(0, 50).trim() + ' | SarkariJobSeva'
    : `${job.title} | SarkariJobSeva`;

  const rawDesc = job.shortInfo
    ? `${job.shortInfo}`.slice(0, 155)
    : `${job.title} – ${job.department || 'Govt'}. Eligibility, important dates, apply link at SarkariJobSeva.com`;
  const desc = esc(rawDesc);

  // Schema
  const stateData = STATE_CITY_MAP[job.state || ''] || { city: 'New Delhi', postal: '110001' };
  const salary = getSalaryFromTitle(job.title || '', job.qualification || '');
  const eduCategory = getEducationCategory(job.qualification || '');
  const validThrough = job.lastDate && job.lastDate !== 'N/A' && job.lastDate.trim() !== ''
    ? job.lastDate
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const isJobPosting = job.type === 'job';
  let schemaObj: any;

  if (isJobPosting) {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": (job.shortInfo || job.eligibilityDetails || job.title || '').slice(0, 500),
      "datePosted": job.postDate || new Date().toISOString().split('T')[0],
      "validThrough": validThrough,
      "url": canonical,
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.department || "Government of India",
        "sameAs": job.officialWebsiteUrl || "https://www.india.gov.in"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": `${job.department || 'Government of India'}, ${stateData.city || 'New Delhi'}`,
          "addressLocality": stateData.city || 'New Delhi',
          "addressRegion": job.state || "Delhi",
          "postalCode": stateData.postal || '110001',
          "addressCountry": "IN"
        }
      },
      "applicantLocationRequirements": { "@type": "Country", "name": "India" },
      "employmentType": "FULL_TIME",
      "industry": "Government",
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": salary.min,
          "maxValue": salary.max,
          "unitText": "MONTH"
        }
      },
      "educationRequirements": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": eduCategory
      },
      "qualifications": job.qualification || job.eligibilityDetails || undefined,
      "directApply": true
    };
  } else {
    const typeLabels: Record<string, string> = {
      'admit-card': 'Admit Card',
      'result': 'Result',
      'answer-key': 'Answer Key',
      'admission': 'Admission'
    };
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": job.title,
      "description": (job.shortInfo || job.title || '').slice(0, 500),
      "author": { "@type": "Organization", "name": "SarkariJobSeva" },
      "publisher": {
        "@type": "Organization",
        "name": "SarkariJobSeva",
        "url": "https://sarkarijobseva.com",
        "logo": { "@type": "ImageObject", "url": "https://sarkarijobseva.com/logo.png" }
      },
      "datePublished": job.postDate || job.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      "dateModified": job.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      "url": canonical,
      "articleSection": typeLabels[job.type] || "Government Job",
      "keywords": `${job.title}, ${job.department}, ${job.type} 2026, sarkari naukri`
    };
  }

  const schema = JSON.stringify(schemaObj);
  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sarkarijobseva.com" },
      { "@type": "ListItem", "position": 2, "name": job.type === 'job' ? 'Latest Jobs' : job.type === 'admit-card' ? 'Admit Card' : job.type === 'result' ? 'Results' : job.type === 'answer-key' ? 'Answer Key' : 'Admission', "item": `https://sarkarijobseva.com/${job.type === 'job' ? 'latest-jobs' : job.type === 'admit-card' ? 'admit-card' : job.type === 'result' ? 'results' : job.type === 'answer-key' ? 'answer-key' : 'admission'}` },
      { "@type": "ListItem", "position": 3, "name": job.title, "item": canonical }
    ]
  });

  // ===== BUILD RICH BODY CONTENT =====
  let bodyContent = `
    <nav aria-label="breadcrumb" style="font-size:13px;color:#666;margin-bottom:16px">
      <a href="https://sarkarijobseva.com">Home</a> &raquo;
      <a href="https://sarkarijobseva.com/latest-jobs">Sarkari Naukri</a> &raquo;
      <span>${jobTitle}</span>
    </nav>
    <h1>${jobTitle}</h1>
    <p><strong>Department / Organization:</strong> ${esc(job.department || 'Government of India')}</p>
    ${job.lastDate ? `<p><strong>Last Date to Apply:</strong> ${esc(job.lastDate)}</p>` : ''}
    ${job.postDate ? `<p><strong>Notification Date:</strong> ${esc(job.postDate)}</p>` : ''}
    ${job.state ? `<p><strong>Location / State:</strong> ${esc(job.state)}</p>` : ''}
  `;

  // Short info / overview
  if (job.shortInfo) {
    bodyContent += `
    <h2>Overview</h2>
    <p>${esc(job.shortInfo)}</p>`;
  }

  // Eligibility
  if (job.qualification || job.eligibilityDetails) {
    bodyContent += `
    <h2>Eligibility / Educational Qualification</h2>
    <p>${esc(job.qualification || job.eligibilityDetails || '')}</p>`;
    if (job.eligibilityDetails && job.qualification && job.eligibilityDetails !== job.qualification) {
      bodyContent += `<p>${esc(job.eligibilityDetails)}</p>`;
    }
  }

  // Vacancy details
  if (job.vacancyDetails && Array.isArray(job.vacancyDetails) && job.vacancyDetails.length > 0) {
    bodyContent += `<h2>Vacancy Details</h2><table style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Post Name</th><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Total Posts</th><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Eligibility</th></tr></thead><tbody>`;
    job.vacancyDetails.forEach((v: any) => {
      if (v.postName || v.totalPost) {
        bodyContent += `<tr><td style="border:1px solid #ddd;padding:8px">${esc(v.postName || '-')}</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${esc(v.totalPost || '-')}</td><td style="border:1px solid #ddd;padding:8px">${esc(v.eligibility || '-')}</td></tr>`;
      }
    });
    bodyContent += `</tbody></table>`;
  }

  // Important dates
  if (job.importantDates && Array.isArray(job.importantDates) && job.importantDates.length > 0) {
    bodyContent += `<h2>Important Dates</h2><table style="border-collapse:collapse;width:100%"><tbody>`;
    job.importantDates.forEach((d: any) => {
      if (d.label || d.date) {
        bodyContent += `<tr><td style="border:1px solid #ddd;padding:8px;font-weight:bold;width:50%">${esc(d.label || '')}</td><td style="border:1px solid #ddd;padding:8px">${esc(d.date || '')}</td></tr>`;
      }
    });
    bodyContent += `</tbody></table>`;
  } else {
    // Fallback dates section
    bodyContent += `
    <h2>Important Dates</h2>
    <p>Is notification ki important dates official website par available hain. Generally sarkari bharti mein ye dates hoti hain:</p>
    <ul>
      <li>Notification Release Date – Official website par check karein</li>
      <li>Online Application Start Date – Notification mein di jati hai</li>
      <li>Last Date to Apply – Notification mein di jati hai</li>
      <li>Application Fee Last Date – Online form ke saath</li>
      <li>Admit Card Download Date – Exam se 2-3 week pehle</li>
      <li>Exam Date – Admit card par mention hoga</li>
      <li>Result Date – Exam ke baad announced hoti hai</li>
    </ul>`;
  }

  // Application fee
  if (job.applicationFee && Array.isArray(job.applicationFee) && job.applicationFee.length > 0) {
    bodyContent += `<h2>Application Fee</h2><table style="border-collapse:collapse;width:100%"><tbody>`;
    job.applicationFee.forEach((f: any) => {
      if (f.category || f.fee) {
        bodyContent += `<tr><td style="border:1px solid #ddd;padding:8px;font-weight:bold;width:50%">${esc(f.category || '')}</td><td style="border:1px solid #ddd;padding:8px">${esc(f.fee || '')}</td></tr>`;
      }
    });
    bodyContent += `</tbody></table>`;
  } else {
    bodyContent += `
    <h2>Application Fee</h2>
    <p>Application fee ki jankari official notification mein di gai hai. Aamtaur par sarkari bharti mein category-wise fee hoti hai:</p>
    <ul>
      <li>General / EWS / OBC – ₹100 se ₹1000 (exam anusar alag)</li>
      <li>SC / ST – Relaxation milti hai ya free hoti hai</li>
      <li>PwD / Divyang – Zyada tar exams mein free</li>
      <li>Female Candidates – Kai bhartiyon mein free</li>
    </ul>
    <p>Fee payment ke liye: Net Banking, UPI, Debit Card, Credit Card sabhi accept hote hain.</p>`;
  }

  // Age limit
  if (job.ageLimit && Array.isArray(job.ageLimit) && job.ageLimit.length > 0) {
    bodyContent += `<h2>Age Limit</h2><table style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Category</th><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Minimum Age</th><th style="border:1px solid #ddd;padding:8px;background:#f5f5f5">Maximum Age</th></tr></thead><tbody>`;
    job.ageLimit.forEach((a: any) => {
      bodyContent += `<tr><td style="border:1px solid #ddd;padding:8px">${esc(a.category || '')}</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${esc(a.minAge || '')} years</td><td style="border:1px solid #ddd;padding:8px;text-align:center">${esc(a.maxAge || '')} years</td></tr>`;
    });
    bodyContent += `</tbody></table>`;
  } else {
    bodyContent += `
    <h2>Age Limit</h2>
    <p>Is bharti ki age limit official notification mein di gai hai. Sarkari naukri mein aamtaur par ye relaxation milti hai:</p>
    <ul>
      <li>General – 18 se 27/30/35 saal (post anusar)</li>
      <li>OBC – 3 saal ki relaxation</li>
      <li>SC / ST – 5 saal ki relaxation</li>
      <li>PwD / Divyang – 10 saal ki relaxation</li>
      <li>Ex-Serviceman – Service period + 3 saal</li>
    </ul>`;
  }

  // Selection process
  if (job.selectionProcess && Array.isArray(job.selectionProcess) && job.selectionProcess.length > 0) {
    bodyContent += `<h2>Selection Process</h2><ol>`;
    job.selectionProcess.forEach((s: string) => {
      if (s) bodyContent += `<li>${esc(s)}</li>`;
    });
    bodyContent += `</ol>`;
  } else {
    bodyContent += `
    <h2>Selection Process</h2>
    <p>Is bharti ka selection process official notification mein diya gaya hai. Aamtaur par sarkari bharti mein ye stages hoti hain:</p>
    <ol>
      <li>Written Exam / Computer Based Test (CBT)</li>
      <li>Physical Efficiency Test / Physical Standard Test (agar applicable ho)</li>
      <li>Document Verification (DV)</li>
      <li>Medical Examination</li>
      <li>Final Merit List aur Appointment</li>
    </ol>`;
  }

  // How to apply / how to download guide
  bodyContent += getHowToGuide(job.type);

  // Salary section
  bodyContent += `
    <h2>Salary / Pay Scale</h2>
    <p>Is post ke liye estimated salary ₹${salary.min.toLocaleString()} se ₹${salary.max.toLocaleString()} per month tak ho sakti hai (7th Pay Commission anusar). Exact pay scale official notification mein check karein. Sarkari naukri mein salary ke saath in facilities bhi milti hain:</p>
    <ul>
      <li>HRA (House Rent Allowance)</li>
      <li>DA (Dearness Allowance) – har 6 mahine update hota hai</li>
      <li>Medical facilities aur Leave Travel Concession</li>
      <li>Provident Fund aur Pension (NPS/OPS anusar)</li>
      <li>Job security aur promotion opportunities</li>
    </ul>`;

  // Important links section
  bodyContent += `<h2>Important Links</h2><ul>`;
  if (job.applyOnlineUrl) bodyContent += `<li><a href="${esc(job.applyOnlineUrl)}" target="_blank" rel="noopener">Apply Online – Official Link</a></li>`;
  if (job.notificationUrl) bodyContent += `<li><a href="${esc(job.notificationUrl)}" target="_blank" rel="noopener">Official Notification PDF Download</a></li>`;
  if (job.admitCardUrl) bodyContent += `<li><a href="${esc(job.admitCardUrl)}" target="_blank" rel="noopener">Admit Card Download Link</a></li>`;
  if (job.resultUrl) bodyContent += `<li><a href="${esc(job.resultUrl)}" target="_blank" rel="noopener">Result Download Link</a></li>`;
  if (job.answerKeyUrl) bodyContent += `<li><a href="${esc(job.answerKeyUrl)}" target="_blank" rel="noopener">Answer Key Download Link</a></li>`;
  if (job.officialWebsiteUrl) bodyContent += `<li><a href="${esc(job.officialWebsiteUrl)}" target="_blank" rel="noopener">Official Website</a></li>`;
  bodyContent += `<li><a href="https://sarkarijobseva.com/latest-jobs">Latest Government Jobs 2026</a></li>`;
  bodyContent += `<li><a href="https://sarkarijobseva.com/admit-card">Admit Card Download 2026</a></li>`;
  bodyContent += `<li><a href="https://sarkarijobseva.com/results">Sarkari Result 2026</a></li>`;
  bodyContent += `</ul>`;

  // FAQ
  bodyContent += `
    <h2>Frequently Asked Questions (FAQ)</h2>
    <div itemscope itemtype="https://schema.org/FAQPage">
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">${esc(job.title)} ke liye kaun apply kar sakta hai?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${esc(job.qualification || 'Eligibility details ke liye official notification padhen. Age limit aur educational qualification notification mein di gai hai.')}</p>
        </div>
      </div>
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">Is bharti ki last date kya hai?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${job.lastDate ? `Is bharti ki last date ${esc(job.lastDate)} hai. Last date se pehle apply zaroor karein.` : 'Last date ke liye official notification check karein. Sarkarijobseva.com par regular update milta rehta hai.'}</p>
        </div>
      </div>
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">${esc(job.department || 'Is organization')} ke liye apply kaise karein?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Online apply ke liye official website par jayein. Registration karein, form bharein, documents upload karein, fee pay karein aur submit karein. Upar diye step-by-step guide follow karein.</p>
        </div>
      </div>
      <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <h3 itemprop="name">Kya is bharti mein SC/ST candidates ko relaxation milti hai?</h3>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">Haan, government norms ke anusar SC/ST candidates ko age limit mein 5 saal ki aur fee mein bhi relaxation milti hai. Exact relaxation ke liye official notification padhen.</p>
        </div>
      </div>
    </div>`;

  // Unique content - taiyari tips, state specific, qualification specific
  bodyContent += getUniquePageContent(job);

  // SarkariJobSeva About Section
  bodyContent += `
    <h2>SarkariJobSeva.com Ke Baare Mein</h2>
    <p>SarkariJobSeva.com India ka ek vishwasaniya sarkari naukri information portal hai. Hamare portal par roz nayi sarkari bhartiyon ki jankari update hoti hai — Railway, SSC, Police, Bank, Teacher, Army, UPSC, State PSC sab kuch ek jagah milta hai. Hamare readers ki madad ke liye hum sirf verified aur official sources se information share karte hain. Koi bhi application ya fee ke liye hamesha official website use karein.</p>
    <ul>
      <li>📅 Daily updated — roz nayi bhartiyan</li>
      <li>✅ Verified information — official sources se</li>
      <li>📱 Mobile friendly — phone se aasaani se dekho</li>
      <li>🔔 Free job alerts — koi charge nahi</li>
    </ul>`;

  // Disclaimer
  bodyContent += `
    <h2>Disclaimer</h2>
    <p>Is page par di gayi jankari kewal informational purposes ke liye hai. Apply karne se pehle official notification zaroor padhen aur official website se verify karein. SarkariJobSeva.com kisi bhi galti ke liye zimmedar nahi hai. Yeh website kisi bhi government department, ministry ya organization se affiliated nahi hai.</p>`;

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(baseTitle)}</title>
  <meta name="description" content="${desc}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(baseTitle)}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(baseTitle)}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="https://sarkarijobseva.com/og-image.png">
  <meta name="twitter:site" content="@sarkarijobseva">
  <script type="application/ld+json">${schema}</script>
  <script type="application/ld+json">${breadcrumbSchema}</script>
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px 12px;color:#222;line-height:1.7}
    h1{font-size:1.5rem;color:#1a1a2e;margin-bottom:.5rem}
    h2{font-size:1.15rem;color:#16213e;margin-top:1.8rem;margin-bottom:.6rem;border-left:4px solid #d32f2f;padding-left:10px}
    h3{font-size:1rem;color:#16213e;margin-top:1.2rem}
    p,li{font-size:.95rem}
    a{color:#1565c0}
    table{width:100%;border-collapse:collapse;margin:.5rem 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:.9rem}
    th{background:#f5f5f5;font-weight:bold}
    ol,ul{padding-left:1.4rem}
    li{margin-bottom:.4rem}
    nav{font-size:13px;color:#666;margin-bottom:16px}
    header{padding:12px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}
    header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}
    footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:.85rem;color:#555}
  </style>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – Sarkari Naukri, Admit Card, Result 2026</header>
  <main>${bodyContent}</main>
  <footer>
    <p><strong>SarkariJobSeva.com</strong> – India's trusted government job portal. Daily updates on sarkari naukri, admit card, result, answer key 2026.</p>
    <nav>
      <a href="https://sarkarijobseva.com">Home</a> |
      <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> |
      <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> |
      <a href="https://sarkarijobseva.com/results">Results</a> |
      <a href="https://sarkarijobseva.com/answer-key">Answer Key</a> |
      <a href="https://sarkarijobseva.com/admission">Admission</a> |
      <a href="https://sarkarijobseva.com/blog">Blog</a>
    </nav>
  </footer>
</body>
</html>`;
}

function generateCategoryHTML(config: {title: string; desc: string; posts?: any[]}, canonical: string): string {
  let postsHtml = '';
  if (config.posts && config.posts.length > 0) {
    postsHtml = `<h2>Latest Updates</h2><ul>`;
    config.posts.forEach((p: any) => {
      postsHtml += `<li><a href="https://sarkarijobseva.com/job/${p.slug || p.id}">${esc(p.title)}</a>`;
      if (p.lastDate) postsHtml += ` – Last Date: ${esc(p.lastDate)}`;
      if (p.department) postsHtml += ` | ${esc(p.department)}`;
      postsHtml += `</li>`;
    });
    postsHtml += `</ul>`;
  }

  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(config.title)} | SarkariJobSeva</title>
  <meta name="description" content="${esc(config.desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(config.title)} | SarkariJobSeva">
  <meta property="og:description" content="${esc(config.desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/og-image.png">
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px 12px;color:#222;line-height:1.7}
    h1{font-size:1.5rem;color:#1a1a2e}
    h2{font-size:1.1rem;color:#16213e;margin-top:1.5rem;border-left:4px solid #d32f2f;padding-left:10px}
    a{color:#1565c0} li{margin-bottom:.5rem;font-size:.95rem}
    nav.topnav{margin:10px 0 20px}
    nav.topnav a{display:inline-block;margin:4px 6px 4px 0;padding:5px 12px;background:#fff3e0;color:#e65100;border-radius:4px;text-decoration:none;font-size:13px;font-weight:500}
    .info-box{background:#fff8e1;border-left:4px solid #ffa000;padding:14px;margin:20px 0;border-radius:4px}
    table{width:100%;border-collapse:collapse;margin:.5rem 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:.9rem}
    th{background:#f5f5f5}
    header{padding:12px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}
    header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}
    footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:.85rem;color:#555}
  </style>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – Sarkari Naukri, Admit Card, Result 2026</header>
  <nav class="topnav">
    <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a>
    <a href="https://sarkarijobseva.com/admit-card">Admit Card</a>
    <a href="https://sarkarijobseva.com/results">Results</a>
    <a href="https://sarkarijobseva.com/answer-key">Answer Key</a>
    <a href="https://sarkarijobseva.com/admission">Admission</a>
    <a href="https://sarkarijobseva.com/blog">Blog</a>
  </nav>
  <main>
    <h1>${esc(config.title)}</h1>
    <p>${esc(config.desc)}</p>
    ${postsHtml}

    <div class="info-box">
      <strong>SarkariJobSeva.com</strong> par aapko milega:
      <ul>
        <li>Railway, SSC, UPSC, Bank, Police, Army, Teacher, Anganwadi – sabhi bhartiyon ki jankari</li>
        <li>Admit Card, Result, Answer Key – direct download links</li>
        <li>10th, 12th, Graduation – sabhi qualification ke liye jobs</li>
        <li>Free Job Alert – koi registration nahi, koi charge nahi</li>
      </ul>
    </div>

    <h2>SarkariJobSeva.com Ke Baare Mein</h2>
    <p>SarkariJobSeva.com India ka ek vishwasaniya sarkari naukri portal hai jahan roz nayi government jobs, admit card, result aur answer key ki verified jankari di jaati hai. Hamare portal par SSC, Railway, UPSC, Bank PO/Clerk, Police Constable, Army Agniveer, Teacher Bharti, Anganwadi Bharti — sabhi types ki sarkari naukri milti hai.</p>
    <p>Hamare readers ki madad ke liye hum sirf official sources se information share karte hain. Koi bhi application ya fee ke liye hamesha official website use karein. SarkariJobSeva.com kisi bhi government department se affiliated nahi hai.</p>

    <h2>Humare Categories</h2>
    <ul>
      <li><a href="https://sarkarijobseva.com/category/railway">Railway Jobs 2026 – RRB ALP, Group D, NTPC, JE Bharti</a></li>
      <li><a href="https://sarkarijobseva.com/category/ssc">SSC Jobs 2026 – CGL, CHSL, GD Constable, MTS Bharti</a></li>
      <li><a href="https://sarkarijobseva.com/category/upsc">UPSC 2026 – Civil Services, NDA, CDS, Engineering Services</a></li>
      <li><a href="https://sarkarijobseva.com/category/bank">Bank Jobs 2026 – SBI PO/Clerk, IBPS PO/Clerk, RBI Bharti</a></li>
      <li><a href="https://sarkarijobseva.com/category/police">Police Bharti 2026 – UP Police, Rajasthan Police, MP Police, Delhi Police</a></li>
      <li><a href="https://sarkarijobseva.com/category/army-recruitment">Army Recruitment 2026 – Indian Army, Navy, Air Force Agniveer</a></li>
      <li><a href="https://sarkarijobseva.com/category/teacher">Teacher Bharti 2026 – CTET, TET, KVS, NVS, Shikshak Bharti</a></li>
      <li><a href="https://sarkarijobseva.com/category/anganwadi">Anganwadi Bharti 2026 – State Wise Anganwadi Recruitment</a></li>
      <li><a href="https://sarkarijobseva.com/category/state-jobs">State Govt Jobs 2026 – UP, Bihar, Rajasthan, MP, Haryana, Punjab</a></li>
    </ul>

    <h2>Sarkari Naukri Ke Liye Qualification Wise Jobs</h2>
    <table>
      <thead><tr><th>Qualification</th><th>Popular Job Options</th></tr></thead>
      <tbody>
        <tr><td>10th Pass</td><td>Army Agniveer, Railway Group D, SSC MTS, Police Constable, Peon, Driver</td></tr>
        <tr><td>12th Pass</td><td>SSC CHSL, Railway ALP, NDA, Airforce Agniveer, Clerk, Data Entry Operator</td></tr>
        <tr><td>Graduation</td><td>SSC CGL, Bank PO, UPSC, State PSC, Sub Inspector, Income Tax Inspector</td></tr>
        <tr><td>ITI / Diploma</td><td>Railway Technician, JE, Electrician, Fitter, Apprentice Bharti</td></tr>
        <tr><td>B.Ed / D.El.Ed</td><td>Teacher Bharti, TET, CTET, KVS, NVS, Navodaya Vidyalaya</td></tr>
        <tr><td>Engineering</td><td>PSU Jobs, PWD, DRDO, ISRO, Defence Civilian, SSC JE</td></tr>
        <tr><td>Medical / Nursing</td><td>AIIMS, ESIC, Army Medical, State Health Dept, ANM/GNM Bharti</td></tr>
      </tbody>
    </table>

    <h2>Sarkari Naukri Mein Apply Karne Se Pehle Ye Zaroor Jaanein</h2>
    <ul>
      <li><strong>Age Limit:</strong> Apni category ke hisab se age eligibility check karein – OBC ko 3 saal, SC/ST ko 5 saal ki relaxation milti hai</li>
      <li><strong>Application Fee:</strong> Category wise fee alag hoti hai – SC/ST/Female ko zyaatar exemption milti hai</li>
      <li><strong>Documents:</strong> 10th Certificate, Photo, Signature, Category Certificate, Domicile Certificate pehle se tayar rakhein</li>
      <li><strong>Last Date:</strong> Last date se 2-3 din pehle apply karein – last moment server slow ho jaata hai</li>
      <li><strong>Official Website:</strong> Hamesha official website se hi apply karein – kisi bhi agent ko paise mat dein</li>
    </ul>

    <h2>Disclaimer</h2>
    <p>Is website par di gayi jankari sirf informational purposes ke liye hai. Apply karne se pehle official notification zaroor padhen. SarkariJobSeva.com kisi bhi government department se affiliated nahi hai.</p>

    <p>Aur adhik sarkari naukri ki jankari ke liye <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> par visit karte rahein.</p>
  </main>
  <footer>
    <p><strong>SarkariJobSeva.com</strong> – India ka trusted sarkari naukri portal | Daily updated</p>
    <p><a href="https://sarkarijobseva.com">Home</a> | <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> | <a href="https://sarkarijobseva.com/results">Results</a> | <a href="https://sarkarijobseva.com/answer-key">Answer Key</a> | <a href="https://sarkarijobseva.com/about-us">About Us</a> | <a href="https://sarkarijobseva.com/privacy-policy">Privacy Policy</a> | <a href="https://sarkarijobseva.com/contact">Contact</a></p>
  </footer>
</body>
</html>`;
}

const CATEGORY_MAP: Record<string, {title: string; desc: string; type?: string}> = {
  '/': { title: 'SarkariJobSeva – Latest Sarkari Naukri, Admit Card, Result 2026', desc: 'India ka trusted sarkari naukri portal. Latest government jobs, admit card, result, answer key 2026. SSC, Railway, UPSC, Bank, State Govt jobs daily updates.' },
  '/latest-jobs': { title: 'Latest Government Jobs 2026 – Sarkari Naukri', desc: 'Latest sarkari naukri 2026 – SSC CGL, Railway RRB, UPSC, Bank PO, State Govt jobs. Apply online for latest government jobs at SarkariJobSeva.', type: 'job' },
  '/admit-card': { title: 'Admit Card Download 2026 – Hall Ticket', desc: 'Download admit card 2026 for all government exams – SSC, Railway, UPSC, Bank. Hall ticket download link available at SarkariJobSeva.', type: 'admit-card' },
  '/results': { title: 'Sarkari Result 2026 – Government Exam Results', desc: 'Sarkari result 2026 – Check government exam results, merit list, cut off marks. SSC, Railway, UPSC, Bank exam results at SarkariJobSeva.', type: 'result' },
  '/answer-key': { title: 'Answer Key 2026 – Government Exam Answer Keys', desc: 'Download answer key 2026 for government exams – SSC, Railway, UPSC, Bank. Official answer keys with objection details at SarkariJobSeva.', type: 'answer-key' },
  '/admission': { title: 'Admission Form 2026 – Government College Admission', desc: 'Government college admission 2026 – Apply online, eligibility, important dates. B.Ed, University, ITI admission at SarkariJobSeva.', type: 'admission' },
  '/search': { title: 'Search Sarkari Jobs 2026 – Find Government Jobs', desc: 'Search latest sarkari jobs, admit cards, results 2026 at SarkariJobSeva. Find SSC, Railway, UPSC, Bank jobs.' },
  '/blog': { title: 'Sarkari Job Blog – Government Job Tips & Updates', desc: 'Latest sarkari job news, tips, syllabus and updates for government job aspirants at SarkariJobSeva.' },
};

// Info pages for static rendering
const INFO_PAGES: Record<string, {title: string; html: string}> = {
  '/privacy-policy': {
    title: 'Privacy Policy',
    html: `
    <p><em>Last updated: June 2026</em></p>
    <p>Welcome to <strong>SarkariJobSeva.com</strong>. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.</p>

    <h2>1. Information We Collect</h2>
    <p>We collect minimal data to improve your experience:</p>
    <ul>
      <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, device type, and IP address — collected automatically via Google Analytics.</li>
      <li><strong>Cookies:</strong> Small files stored on your device to remember preferences and serve relevant ads via Google AdSense.</li>
      <li><strong>Contact Info:</strong> Only if you email us directly — we do NOT collect your name, phone, or email otherwise.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <ul>
      <li>To analyze website traffic and improve content quality</li>
      <li>To serve relevant advertisements via Google AdSense</li>
      <li>To respond to queries you send us via email</li>
      <li>To ensure website security and prevent abuse</li>
    </ul>

    <h2>3. Google AdSense & Advertising</h2>
    <p>We use <strong>Google AdSense</strong> to display advertisements on this website. Google may use cookies, including the DoubleClick cookie, to serve ads based on your prior visits to this or other websites.</p>
    <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>. For more details, see <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Google's advertising policies</a>.</p>

    <h2>4. Google Analytics</h2>
    <p>We use Google Analytics to understand how visitors use our site. Google Analytics collects data anonymously. You can opt out via the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics Opt-out Browser Add-on</a>.</p>

    <h2>5. Cookies Policy</h2>
    <p>We use cookies to enhance your browsing experience. You can disable cookies via your browser settings, though this may affect some website functionality. By continuing to use our site, you consent to our use of cookies.</p>

    <h2>6. Third-Party Links</h2>
    <p>Our website contains links to official government websites and external sources. We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies.</p>

    <h2>7. Data Security</h2>
    <p>We do NOT sell, trade, rent, or share your personal information with third parties. We implement reasonable security measures to protect your data.</p>

    <h2>8. Children's Privacy</h2>
    <p>SarkariJobSeva.com does not knowingly collect personal information from children under 13 years of age. If you believe your child has provided us with personal information, please contact us immediately.</p>

    <h2>9. Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>

    <h2>10. Contact Us</h2>
    <p>For questions about this Privacy Policy, please contact:<br>
    📧 <a href="mailto:supportsarkarijobseva@gmail.com">supportsarkarijobseva@gmail.com</a><br>
    🌐 <a href="https://sarkarijobseva.com">www.sarkarijobseva.com</a></p>
    `
  },
  '/disclaimer': {
    title: 'Disclaimer',
    html: `
    <p><em>Last updated: June 2026</em></p>

    <h2>General Disclaimer</h2>
    <p>The information provided on <strong>SarkariJobSeva.com</strong> is for general informational purposes only. While we strive to keep all information accurate and up-to-date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information.</p>

    <h2>Not a Government Website</h2>
    <p><strong>SarkariJobSeva.com is NOT a government website.</strong> It is a privately owned informational platform and is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with any Government authority, department, ministry, or organization of India including but not limited to SSC, UPSC, Railway Board, IBPS, SBI, or any State Government.</p>

    <h2>Information Sources</h2>
    <p>All job notifications, admit cards, results, answer keys, and admission information published on this website are collected from:</p>
    <ul>
      <li>Official government websites and portals</li>
      <li>Employment News (Rozgar Samachar)</li>
      <li>Publicly available official press releases</li>
    </ul>
    <p><strong>Users are strongly advised to verify all details from the official notification or official website before applying for any job or examination.</strong></p>

    <h2>No Job Application Processing</h2>
    <p>This website does NOT process any job applications. All application links redirect users to the respective official government websites only. We have no role in the selection process.</p>

    <h2>No Fees Charged</h2>
    <p>SarkariJobSeva.com does NOT charge any fee for providing job-related information. All information on this website is completely free. <strong>If anyone asks for money in our name, please report it immediately to us and to the authorities. Such persons are committing fraud.</strong></p>

    <h2>Advertising Disclosure</h2>
    <p>SarkariJobSeva.com participates in Google AdSense and displays advertisements. These ads are served by Google and governed by Google's advertising policies. The presence of an advertisement does not constitute our endorsement of the advertiser's products or services.</p>

    <h2>Limitation of Liability</h2>
    <p>SarkariJobSeva.com shall not be held responsible for any loss, damage, or inconvenience caused due to use of, or reliance on, the information provided on this website. Users rely on the information at their own risk.</p>

    <h2>Contact</h2>
    <p>📧 <a href="mailto:supportsarkarijobseva@gmail.com">supportsarkarijobseva@gmail.com</a></p>
    `
  },
  '/about-us': {
    title: 'About Us – SarkariJobSeva',
    html: `
    <h2>SarkariJobSeva.com के बारे में</h2>
    <p><strong>SarkariJobSeva.com</strong> भारत का एक विश्वसनीय और निःशुल्क सरकारी नौकरी सूचना पोर्टल है। हमारा उद्देश्य देश के हर कोने में बैठे युवाओं तक सरकारी भर्तियों की सटीक, समय पर और सम्पूर्ण जानकारी पहुंचाना है — बिल्कुल मुफ्त।</p>

    <p>भारत में हर साल करोड़ों युवा सरकारी नौकरी की तैयारी करते हैं। लेकिन सही जानकारी सही समय पर न मिलने के कारण कई बार अवसर चूक जाते हैं। SarkariJobSeva.com इसी समस्या का समाधान है।</p>

    <h2>हम क्या प्रदान करते हैं</h2>
    <ul>
      <li><strong>Latest Sarkari Jobs:</strong> SSC, Railway RRB, UPSC, Bank PO/Clerk, Police, Army, Teacher, Anganwadi, State PSC — सभी सरकारी भर्तियां रोज़ अपडेट</li>
      <li><strong>Admit Card:</strong> सभी परीक्षाओं के Admit Card का Direct Download Link</li>
      <li><strong>Result:</strong> परीक्षाओं के परिणाम, Merit List और Cut-off Marks</li>
      <li><strong>Answer Key:</strong> Official Answer Keys और Objection Form की जानकारी</li>
      <li><strong>Admission:</strong> Government College Admission, B.Ed, ITI, Polytechnic की जानकारी</li>
      <li><strong>Blog:</strong> Exam Tips, Syllabus, Preparation Strategy — Hindi में</li>
    </ul>

    <h2>हमारी विशेषताएं</h2>
    <ul>
      <li>✅ Daily Updated — हर दिन नई भर्तियां और Updates</li>
      <li>✅ Verified Information — सिर्फ Official Sources से जानकारी</li>
      <li>✅ 100% Free — कोई Registration नहीं, कोई Fee नहीं</li>
      <li>✅ Mobile Friendly — Phone पर आसानी से देखें</li>
      <li>✅ Hindi में जानकारी — आसान भाषा में पूरी जानकारी</li>
      <li>✅ Fast & Reliable — तेज और भरोसेमंद वेबसाइट</li>
    </ul>

    <h2>हमारा मिशन</h2>
    <p>हमारा मिशन है कि भारत का हर नौजवान — चाहे वो किसी भी राज्य में हो, चाहे गांव में हो या शहर में — सरकारी नौकरी की हर जानकारी समय पर पाए और अपने सपनों को पूरा कर सके।</p>

    <h2>Important Notice</h2>
    <p><strong>SarkariJobSeva.com एक निजी सूचना पोर्टल है।</strong> यह किसी भी सरकारी विभाग, मंत्रालय या संगठन से संबद्ध नहीं है। हम केवल जानकारी प्रदान करते हैं। आवेदन करने से पहले हमेशा Official Notification ध्यान से पढ़ें और Official Website से ही Apply करें।</p>
    <p>हम किसी भी भर्ती प्रक्रिया में कोई शुल्क नहीं लेते। यदि कोई हमारे नाम पर पैसे मांगे तो वह Fraud है — तुरंत Report करें।</p>

    <h2>संपर्क करें</h2>
    <p>किसी भी जानकारी, सुझाव या शिकायत के लिए:<br>
    📧 Email: <a href="mailto:supportsarkarijobseva@gmail.com">supportsarkarijobseva@gmail.com</a><br>
    🌐 Website: <a href="https://sarkarijobseva.com">www.sarkarijobseva.com</a></p>
    <p><em>Last updated: June 2026</em></p>
    `
  },
  '/contact': {
    title: 'Contact Us',
    html: `
    <h2>Get In Touch With SarkariJobSeva</h2>
    <p>We'd love to hear from you! Whether you have questions, found incorrect information, or want to suggest improvements — please reach out to us.</p>

    <h2>📧 Email Support</h2>
    <p>For all queries, corrections, and feedback:</p>
    <p><strong><a href="mailto:supportsarkarijobseva@gmail.com">supportsarkarijobseva@gmail.com</a></strong></p>
    <p>We typically respond within 24–48 working hours.</p>

    <h2>📋 Report Incorrect Information</h2>
    <p>If you find any incorrect, outdated, or misleading information on our website, please email us immediately with:</p>
    <ul>
      <li>The URL of the page with incorrect information</li>
      <li>What information is incorrect</li>
      <li>The correct information with official source link</li>
    </ul>
    <p>We will verify and correct it as soon as possible. Accuracy is our top priority.</p>

    <h2>💡 Suggest a Job / Vacancy</h2>
    <p>Know of a government job vacancy that is not listed on our website? Please email us the official notification link and we will add it.</p>

    <h2>⚠️ Report Fraud</h2>
    <p>SarkariJobSeva.com never charges any fee. If anyone contacts you claiming to be from SarkariJobSeva and asks for money — it is a fraud. Please report it to us and to your local police immediately.</p>

    <h2>🌐 Website</h2>
    <p><a href="https://sarkarijobseva.com">www.sarkarijobseva.com</a></p>

    <h2>Important Note</h2>
    <p>We are an <strong>informational website only</strong>. We do not process job applications and have no access to any recruitment database. For application-related issues, please contact the respective government recruitment body directly.</p>
    `
  },
  '/terms-of-service': {
    title: 'Terms of Service',
    html: `
    <p><em>Last updated: June 2026</em></p>
    <p>By accessing and using SarkariJobSeva.com, you agree to be bound by these Terms of Service. Please read them carefully.</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By using this website, you confirm that you are at least 13 years old and agree to these terms. If you disagree with any part of these terms, please discontinue use of our website.</p>

    <h2>2. Informational Purpose Only</h2>
    <p>SarkariJobSeva.com provides job-related information for informational purposes only. We do not process applications, guarantee employment, or represent any government body. Always verify information from official sources before acting on it.</p>

    <h2>3. User Responsibility</h2>
    <p>You are solely responsible for verifying the accuracy of information before applying to any job or examination. We strongly recommend reading the official notification carefully before applying.</p>

    <h2>4. No Guarantee of Selection</h2>
    <p>We provide information about job openings but do not guarantee selection or employment. The hiring decision rests solely with the respective government body.</p>

    <h2>5. Intellectual Property</h2>
    <p>The layout, design, and compiled information on this portal are for personal, non-commercial use only. Unauthorized reproduction, redistribution, or commercial use of our content is strictly prohibited.</p>

    <h2>6. Advertising</h2>
    <p>This website displays advertisements through Google AdSense. By using this website, you consent to viewing such advertisements. We are not responsible for the content of third-party advertisements.</p>

    <h2>7. Prohibited Activities</h2>
    <p>Users must not:</p>
    <ul>
      <li>Attempt to hack, exploit, or disrupt the website</li>
      <li>Use automated scrapers or bots excessively</li>
      <li>Spread misinformation or misuse our brand name</li>
      <li>Use our website for any unlawful purpose</li>
    </ul>

    <h2>8. External Links</h2>
    <p>Our website links to official government websites. We have no control over their content or availability and are not responsible for issues arising from their use.</p>

    <h2>9. Changes to Terms</h2>
    <p>We may update these Terms at any time. Continued use of our website after changes constitutes acceptance of the new terms.</p>

    <h2>10. Contact</h2>
    <p>For queries about these Terms: <a href="mailto:supportsarkarijobseva@gmail.com">supportsarkarijobseva@gmail.com</a></p>
    `
  },
};

function generateInfoPageHTML(title: string, content: string, canonical: string): string {
  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | SarkariJobSeva</title>
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#222;line-height:1.7}
    h1{font-size:1.6rem;color:#1a1a2e;margin-bottom:1rem}
    h2{font-size:1.15rem;color:#16213e;margin-top:1.8rem;border-left:4px solid #d32f2f;padding-left:10px}
    p,li{font-size:.95rem;line-height:1.8}
    a{color:#1565c0}
    ul,ol{padding-left:1.4rem}
    li{margin-bottom:.5rem}
    header{padding:12px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}
    header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}
    nav.topnav{margin:0 0 20px}
    nav.topnav a{display:inline-block;margin:4px 6px 4px 0;padding:5px 12px;background:#fff3e0;color:#e65100;border-radius:4px;text-decoration:none;font-size:13px}
    footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:.85rem;color:#555;text-align:center}
    footer a{color:#1565c0}
  </style>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – Sarkari Naukri, Admit Card, Result 2026</header>
  <nav class="topnav">
    <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a>
    <a href="https://sarkarijobseva.com/admit-card">Admit Card</a>
    <a href="https://sarkarijobseva.com/results">Results</a>
    <a href="https://sarkarijobseva.com/answer-key">Answer Key</a>
    <a href="https://sarkarijobseva.com/blog">Blog</a>
    <a href="https://sarkarijobseva.com/about-us">About Us</a>
    <a href="https://sarkarijobseva.com/contact">Contact</a>
  </nav>
  <main><h1>${esc(title)}</h1>${content}</main>
  <footer>
    <p><strong>SarkariJobSeva.com</strong> – India's trusted government job portal | Daily updated | 100% Free</p>
    <p>
      <a href="https://sarkarijobseva.com">Home</a> |
      <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> |
      <a href="https://sarkarijobseva.com/about-us">About Us</a> |
      <a href="https://sarkarijobseva.com/privacy-policy">Privacy Policy</a> |
      <a href="https://sarkarijobseva.com/disclaimer">Disclaimer</a> |
      <a href="https://sarkarijobseva.com/terms-of-service">Terms of Service</a> |
      <a href="https://sarkarijobseva.com/contact">Contact</a>
    </p>
  </footer>
</body>
</html>`;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  // ===== PRERENDER MIDDLEWARE =====
  // Bots get full prerendered HTML (for SEO/AdSense crawlers)
  // Normal users get index.html with injected meta tags (React UI loads normally)
  app.use(async (req: Request, res: Response, next: Function) => {
    const ua = req.headers['user-agent'] || '';
    const urlPath = req.path;
    const baseUrl = process.env.SITE_URL || 'https://sarkarijobseva.com';
    const canonical = `${baseUrl}${urlPath}`;

    // Skip static assets always
    if (urlPath.startsWith('/api/') || urlPath.startsWith('/uploads/') || urlPath.match(/\.(js|css|png|jpg|ico|svg|json|txt|xml|woff|woff2|map)$/)) {
      return next();
    }

    // === STEP 1: For ALL users — inject unique meta tags into index.html ===
    if (!isBot(ua)) {
      try {
        const indexPath = path.resolve(__dirname, 'public', 'index.html');
        if (!fs.existsSync(indexPath)) return next();
        let html = fs.readFileSync(indexPath, 'utf-8');

        let title = 'SarkariJobSeva – Latest Sarkari Naukri, Admit Card, Result 2026';
        let description = 'SarkariJobSeva.com par latest government jobs, admit card, result aur answer key ki verified jankari milti hai. SSC, Railway, UPSC, Bank, Police jobs — daily updated, bilkul free.';

        // Job page
        const jobMatch = urlPath.match(/^\/job\/([^/?]+)/);
        if (jobMatch) {
          try {
            let job: any = null;
            const r1 = await fetch(`${baseUrl}/api/posts/slug/${jobMatch[1]}`);
            if (r1.ok) job = await r1.json();
            if (!job) {
              const r2 = await fetch(`${baseUrl}/api/posts/${jobMatch[1]}`);
              if (r2.ok) job = await r2.json();
            }
            if (job && job.title) {
              title = `${job.title.slice(0, 60)} | SarkariJobSeva`;
              description = (job.shortInfo || `${job.title} – ${job.department || 'Govt'}. Eligibility, important dates, apply link.`).slice(0, 155);
            }
          } catch {}
        }

        // Blog page
        const blogMatch = urlPath.match(/^\/blog\/([^/?]+)/);
        if (blogMatch) {
          try {
            const r = await fetch(`${baseUrl}/api/blogs/${blogMatch[1]}`);
            if (r.ok) {
              const blog = await r.json();
              if (blog && blog.title) {
                title = `${blog.title} | SarkariJobSeva`;
                description = (blog.excerpt || blog.title).slice(0, 155);
              }
            }
          } catch {}
        }

        // Category pages
        const catTitles: Record<string, {t: string; d: string}> = {
          '/latest-jobs': { t: 'Latest Government Jobs 2026 | SarkariJobSeva', d: 'Latest sarkari naukri 2026 – SSC, Railway, UPSC, Bank, Police jobs. Daily updated at SarkariJobSeva.' },
          '/admit-card': { t: 'Admit Card Download 2026 | SarkariJobSeva', d: 'Download admit card 2026 for all government exams. Hall ticket direct download link at SarkariJobSeva.' },
          '/results': { t: 'Sarkari Result 2026 | SarkariJobSeva', d: 'Check government exam results, merit list, cut off marks 2026 at SarkariJobSeva.' },
          '/answer-key': { t: 'Answer Key 2026 | SarkariJobSeva', d: 'Download answer key 2026 for government exams. Objection details at SarkariJobSeva.' },
          '/admission': { t: 'Admission Form 2026 | SarkariJobSeva', d: 'Government college admission 2026. B.Ed, University, ITI admission at SarkariJobSeva.' },
          '/blog': { t: 'Sarkari Job Blog – Tips & Updates | SarkariJobSeva', d: 'Government job preparation tips, syllabus, exam strategy at SarkariJobSeva blog.' },
          '/about-us': { t: 'About Us | SarkariJobSeva', d: 'SarkariJobSeva.com ke baare mein – India ka trusted free sarkari naukri information portal.' },
          '/contact': { t: 'Contact Us | SarkariJobSeva', d: 'Contact SarkariJobSeva team for queries, corrections or feedback. Email: supportsarkarijobseva@gmail.com' },
          '/privacy-policy': { t: 'Privacy Policy | SarkariJobSeva', d: 'SarkariJobSeva privacy policy – how we collect, use and protect your data including Google AdSense cookies.' },
          '/disclaimer': { t: 'Disclaimer | SarkariJobSeva', d: 'SarkariJobSeva.com is not a government website. Read our full disclaimer before using our services.' },
          '/salary-calculator': { t: 'Government Salary Calculator 2026 | SarkariJobSeva', d: '7th Pay Commission salary calculator for government jobs. Calculate in-hand salary, HRA, DA at SarkariJobSeva.' },
        };
        if (catTitles[urlPath]) {
          title = catTitles[urlPath].t;
          description = catTitles[urlPath].d;
        }

        // Inject unique title and meta into index.html
        const escapedTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapedDesc = description.replace(/"/g, '&quot;').replace(/</g, '&lt;');
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
        html = html.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapedDesc}"`);
        html = html.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapedTitle}"`);
        html = html.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapedDesc}"`);
        html = html.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${canonical}"`);
        html = html.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapedTitle}"`);
        html = html.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapedDesc}"`);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(html);
      } catch (e) {
        console.error('[Meta Inject Error]', e);
        return next();
      }
    }

    // === STEP 2: Bots get full prerendered HTML ===

    try {
      // 1. Job/Post pages
      const jobMatch = urlPath.match(/^\/job\/([^/?]+)/);
      if (jobMatch) {
        const slug = jobMatch[1];
        let job: any = null;
        try {
          const r1 = await fetch(`${baseUrl}/api/posts/slug/${slug}`);
          if (r1.ok) job = await r1.json();
        } catch {}
        if (!job) {
          try {
            const r2 = await fetch(`${baseUrl}/api/posts/${slug}`);
            if (r2.ok) job = await r2.json();
          } catch {}
        }
        if (job && job.title) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('X-Prerendered', '1');
          return res.send(generateJobHTML(job, canonical));
        }
      }

      // 2. Blog pages
      const blogMatch = urlPath.match(/^\/blog\/([^/?]+)/);
      if (blogMatch) {
        const slug = blogMatch[1];
        try {
          const r = await fetch(`${baseUrl}/api/blogs/${slug}`);
          if (r.ok) {
            const blog = await r.json();
            if (blog && blog.title) {
              const blogContent = blog.content || '';
              const blogTitle = esc(`${blog.title} | SarkariJobSeva`);
              const blogDesc = esc((blog.excerpt || blog.title || '').slice(0, 155));
              const blogSchema = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": blog.title,
                "description": blog.excerpt || blog.title,
                "author": {"@type": "Organization", "name": "SarkariJobSeva"},
                "publisher": {"@type": "Organization", "name": "SarkariJobSeva", "url": "https://sarkarijobseva.com"},
                "url": canonical,
                "datePublished": blog.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                "dateModified": blog.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
              });
              const blogHtml = `<!DOCTYPE html>
<html lang="hi-IN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${blogTitle}</title>
<meta name="description" content="${blogDesc}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${blogTitle}"><meta property="og:description" content="${blogDesc}">
<meta property="og:url" content="${canonical}"><meta property="og:type" content="article">
<meta property="og:image" content="https://sarkarijobseva.com/og-image.png">
<script type="application/ld+json">${blogSchema}</script>
<style>body{font-family:Arial,sans-serif;max-width:860px;margin:0 auto;padding:16px;color:#222;line-height:1.7}h1{font-size:1.6rem;color:#1a1a2e}h2{font-size:1.2rem;color:#16213e;margin-top:1.5rem;border-left:4px solid #d32f2f;padding-left:10px}p{line-height:1.7}a{color:#1565c0}header{padding:10px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}footer{margin-top:30px;padding-top:10px;border-top:1px solid #ddd;font-size:.85rem;color:#666}</style>
</head>
<body>
<header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> – Sarkari Naukri, Admit Card, Result 2026</header>
<main><h1>${esc(blog.title)}</h1><div>${blogContent}</div></main>
<footer><p>Latest Sarkari Jobs ke liye visit karein <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> | <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> | <a href="https://sarkarijobseva.com/results">Results</a></p></footer>
</body></html>`;
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('X-Prerendered', '1');
              return res.send(blogHtml);
            }
          }
        } catch {}
      }

      // 3. /about redirect
      if (urlPath === '/about') {
        return res.redirect(301, '/about-us');
      }

      // 3b. Policy / Info pages (Privacy Policy, About Us, Contact, Disclaimer, Terms)
      const infoPage = INFO_PAGES[urlPath];
      if (infoPage) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(generateInfoPageHTML(infoPage.title, infoPage.html, canonical));
      }

      // 4. Category pages
      const catConfig = CATEGORY_MAP[urlPath];
      if (catConfig) {
        let posts: any[] = [];
        if (catConfig.type) {
          try {
            const r = await fetch(`${baseUrl}/api/posts?type=${catConfig.type}&page=1&limit=30`);
            if (r.ok) {
              const data = await r.json();
              posts = Array.isArray(data) ? data : (data.data || []);
            }
          } catch {}
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Prerendered', '1');
        return res.send(generateCategoryHTML({ ...catConfig, posts }, canonical));
      }

    } catch (e) {
      console.error('[Prerender Error]', e);
    }

    next();
  });
  // ===== END PRERENDER =====

  app.use(express.static(distPath, {
    maxAge: "1y",
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.match(/\.(js|css)$/)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));

  app.use("*", (_req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
// ===== 301 REDIRECTS FOR SLUG CHANGES =====
