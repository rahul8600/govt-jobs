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
  if (q.includes('10th') || q.includes('matriculation') || q.includes('sslc')) return 'secondary school credential';
  if (q.includes('12th') || q.includes('intermediate') || q.includes('higher secondary')) return 'high school diploma';
  if (q.includes('iti') || q.includes('diploma')) return 'vocational training';
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
          "streetAddress": `${job.department || 'Government Office'}, ${stateData.city}`,
          "addressLocality": stateData.city,
          "addressRegion": job.state || "Delhi",
          "postalCode": stateData.postal,
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

  // Disclaimer
  bodyContent += `
    <h2>Disclaimer</h2>
    <p>Is page par di gayi jankari kewal informational purposes ke liye hai. Apply karne se pehle official notification zaroor padhen aur official website se verify karein. SarkariJobSeva.com kisi bhi galti ke liye zimmedar nahi hai.</p>`;

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
  <meta name="robots" content="index, follow, max-snippet:-1">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(config.title)} | SarkariJobSeva">
  <meta property="og:description" content="${esc(config.desc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SarkariJobSeva">
  <meta property="og:image" content="https://sarkarijobseva.com/og-image.png">
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px 12px;color:#222;line-height:1.7}
    h1{font-size:1.5rem;color:#1a1a2e} h2{font-size:1.1rem;color:#16213e;margin-top:1.5rem;border-left:4px solid #d32f2f;padding-left:10px}
    a{color:#1565c0} li{margin-bottom:.5rem;font-size:.95rem}
    header{padding:12px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}
    header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}
    footer{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:.85rem;color:#555}
  </style>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a></header>
  <main>
    <h1>${esc(config.title)}</h1>
    <p>${esc(config.desc)}</p>
    ${postsHtml}
    <p>Visit <a href="https://sarkarijobseva.com">SarkariJobSeva.com</a> for more updates.</p>
  </main>
  <footer><p><a href="https://sarkarijobseva.com">Home</a> | <a href="https://sarkarijobseva.com/latest-jobs">Latest Jobs</a> | <a href="https://sarkarijobseva.com/admit-card">Admit Card</a> | <a href="https://sarkarijobseva.com/results">Results</a></p></footer>
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
const INFO_PAGES: Record<string, {title: string; html: string}> = {};

function generateInfoPageHTML(title: string, content: string, canonical: string): string {
  return `<!DOCTYPE html>
<html lang="hi-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | SarkariJobSeva</title>
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <style>body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;color:#222;line-height:1.7}h1,h2{color:#1a1a2e}a{color:#1565c0}header{padding:12px 0;border-bottom:3px solid #d32f2f;margin-bottom:20px}header a{font-size:1.2rem;font-weight:bold;color:#d32f2f;text-decoration:none}</style>
</head>
<body>
  <header><a href="https://sarkarijobseva.com">SarkariJobSeva.com</a></header>
  <main><h1>${esc(title)}</h1>${content}</main>
</body>
</html>`;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  // ===== UNIFIED BOT PRERENDER MIDDLEWARE =====
  app.use(async (req: Request, res: Response, next: Function) => {
    const ua = req.headers['user-agent'] || '';
    if (!isBot(ua)) return next();

    const urlPath = req.path;
    const baseUrl = process.env.SITE_URL || 'https://sarkarijobseva.com';
    const canonical = `${baseUrl}${urlPath}`;

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
