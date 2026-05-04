import { Link } from "wouter";

export default function InfoPage({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="portal-card bg-white p-8 md:p-12 shadow-sm border-slate-200 rounded-2xl">
      <h1 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4 uppercase tracking-tighter">
        {title}
      </h1>
      <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-6">
        {children}
      </div>
      <div className="mt-12 pt-8 border-t border-slate-100">
        <Link href="/">
          <span className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}

export function Disclaimer() {
  return (
    <InfoPage title="Disclaimer">
      <p>The information provided on this website is for general informational purposes only.</p>
      <p><strong>This website is NOT a government website.</strong> It is a privately owned informational platform and is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with any Government authority, department, ministry, or organization of India.</p>
      <p>All job notifications, admit cards, results, answer keys, and admission information published on this website are collected from official government websites, employment news, and publicly available sources.</p>
      <p>While we make every effort to provide accurate and up-to-date information, we do not guarantee the completeness or accuracy of the data. Users are strongly advised to verify all details from the official notification or official website before applying.</p>
      <p>This website does not process any job applications. All application links redirect users to the respective official government websites only.</p>
      <p>We do not charge any fee for providing job-related information.</p>
      <p>The website shall not be held responsible for any loss, damage, or inconvenience caused due to the use of the information provided.</p>
    </InfoPage>
  );
}

export function PrivacyPolicy() {
  return (
    <InfoPage title="Privacy Policy">
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">1. Data Collection</h2>
        <p>We collect minimal data to improve your experience. This includes standard cookies and anonymous analytics data through services like Google Analytics to understand website traffic and performance.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">2. Use of Information</h2>
        <p>The collected data is used solely for analyzing website performance, improving content delivery, and ensuring a smooth user experience across different devices.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">3. Data Protection</h2>
        <p>We do NOT sell, trade, or otherwise transfer your personally identifiable information to outside parties. Your privacy is our priority.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Third-Party Services</h2>
        <p>We may use third-party services like Google Analytics and Google AdSense. These services may use cookies to serve ads based on your previous visits to our website.</p>
      </section>
    </InfoPage>
  );
}

export function TermsOfService() {
  return (
    <InfoPage title="Terms of Service">
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">1. User Responsibility</h2>
        <p>By using this website, you agree to take full responsibility for the use of the information provided. You must verify all details with official sources before making any decisions.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">2. No Guarantee of Selection</h2>
        <p>Govt Job Alert provides information about job openings but does not guarantee job selection or employment. The final hiring decision lies solely with the respective government body.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">3. External Links Disclaimer</h2>
        <p>Our website contains links to external official websites. We have no control over the content or availability of those sites and are not responsible for any issues arising from their use.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">4. Content Usage</h2>
        <p>The layout and compiled information on this portal are for personal use only. Unauthorized reproduction or commercial use of our compiled lists is strictly prohibited.</p>
      </section>
    </InfoPage>
  );
}

export function Syllabus() {
  return (
    <InfoPage title="Exam Syllabus">
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Government Exam Syllabus</h2>
        <p>Find detailed syllabus information for all major government examinations. We provide comprehensive syllabus guides to help you prepare effectively.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">SSC Exams</h2>
        <p><strong>SSC CGL:</strong> General Intelligence & Reasoning, General Awareness, Quantitative Aptitude, English Comprehension</p>
        <p><strong>SSC CHSL:</strong> English Language, General Intelligence, Quantitative Aptitude, General Awareness</p>
        <p><strong>SSC GD:</strong> General Intelligence & Reasoning, General Knowledge, Elementary Mathematics, English/Hindi</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Railway Exams</h2>
        <p><strong>RRB NTPC:</strong> Mathematics, General Intelligence, General Awareness, General Science</p>
        <p><strong>RRB Group D:</strong> Mathematics, General Intelligence, General Science, General Awareness on Current Affairs</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Banking Exams</h2>
        <p><strong>IBPS PO/Clerk:</strong> English Language, Quantitative Aptitude, Reasoning Ability, General/Financial Awareness, Computer Aptitude</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">State Police Exams</h2>
        <p><strong>UP Police:</strong> General Hindi, Law/Constitution, Numerical Ability, Mental Ability, General Knowledge</p>
        <p><strong>Haryana Police:</strong> General Studies, Reasoning, Numerical Ability, Computer Knowledge, English/Hindi</p>
      </section>
      <p className="text-sm text-slate-500 mt-6 italic">Note: Always refer to the official notification for the most accurate and updated syllabus information.</p>
    </InfoPage>
  );
}

export function Contact() {
  return (
    <InfoPage title="Contact Us">
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Get In Touch</h2>
        <p>Have questions, suggestions, or feedback? We'd love to hear from you. Please use the information below to reach out to our team.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Email Support</h2>
        <p>For general inquiries and support:</p>
        <p className="text-blue-600 font-semibold">support@govtjobalert.info</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Report Incorrect Information</h2>
        <p>If you find any incorrect or outdated information on our website, please let us know immediately so we can correct it:</p>
        <p className="text-blue-600 font-semibold">corrections@govtjobalert.info</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Response Time</h2>
        <p>We typically respond to all queries within 24-48 hours during business days. For urgent matters related to ongoing applications, we recommend directly contacting the respective government department.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-3">Important Note</h2>
        <p>Please note that we are an informational website only. We do not process job applications or have access to any recruitment database. For application-related issues, please contact the respective recruitment body directly.</p>
      </section>
    </InfoPage>
  );
}
