import { useEffect } from "react";
import { Link } from "wouter";
import { Shield, Cookie, Eye, Lock, UserCheck, Baby, Mail } from "lucide-react";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | SarkariJobSeva - How We Protect Your Data";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "SarkariJobSeva Privacy Policy: Learn how we collect, use, and protect your personal information. We use Google AdSense and Google Analytics. Read our full privacy policy.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.sarkarijobseva.com/privacy-policy");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-blue-100">Last Updated: June 27, 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <p className="text-slate-700 leading-relaxed">
            At <strong>SarkariJobSeva.com</strong>, your privacy is our top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. By using our website, you agree to the terms of this Privacy Policy.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-50 rounded-xl p-6 mb-10 border border-slate-200">
          <h2 className="font-bold text-slate-800 mb-4">Table of Contents</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {[
              "1. Information We Collect",
              "2. How We Use Your Information",
              "3. Google AdSense & Advertising",
              "4. Cookies & Tracking Technologies",
              "5. Third-Party Services",
              "6. Data Security",
              "7. Children's Privacy",
              "8. Your Rights",
              "9. Changes to This Policy",
              "10. Contact Us",
            ].map((item, i) => (
              <a key={i} href={`#section-${i + 1}`} className="text-blue-600 text-sm hover:underline font-medium">
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Section 1 */}
        <section id="section-1" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">1. Information We Collect</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">
              We collect minimal information to provide and improve our services. The types of information we may collect include:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Log Data:</strong> When you visit our website, our servers automatically record information that your browser sends. This may include your IP address, browser type, browser version, the pages of our site that you visit, the time and date of your visit, the time spent on those pages, and other statistics.</li>
              <li><strong>Device Information:</strong> We may collect information about the device you use to access our website, including the hardware model, operating system, and unique device identifiers.</li>
              <li><strong>Contact Information:</strong> If you choose to contact us via email or our contact form, we collect your name, email address, and the content of your message.</li>
            </ul>
            <p><strong>We do NOT collect:</strong> We do not collect sensitive personal information such as Aadhaar number, PAN card, bank details, or any government identification numbers.</p>
          </div>
        </section>

        {/* Section 2 */}
        <section id="section-2" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">2. How We Use Your Information</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>To Provide Services:</strong> To deliver the content and services you request, including job notifications, admit cards, results, and answer keys.</li>
              <li><strong>To Improve Our Website:</strong> To understand how users interact with our website and to improve user experience, content relevance, and website performance.</li>
              <li><strong>To Communicate:</strong> To respond to your inquiries, feedback, or requests sent through our contact form or email.</li>
              <li><strong>To Ensure Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats.</li>
              <li><strong>For Analytics:</strong> To analyze website traffic and user behavior using Google Analytics.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 - AdSense */}
        <section id="section-3" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">3. Google AdSense & Advertising</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">
              We use <strong>Google AdSense</strong> to display advertisements on our website. Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to our website or other websites on the internet.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
              <p className="font-semibold text-slate-800 mb-2">How Google Uses Your Data:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Google uses cookies (including the DoubleClick cookie) to serve ads based on your interests and browsing history.</li>
                <li>Google may use device identifiers to track ad performance and prevent fraud.</li>
                <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</li>
              </ul>
            </div>
            <p className="mb-3">
              <strong>Opting Out:</strong> You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads Settings</a>. You can also opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aboutads.info</a>.
            </p>
            <p>
              <strong>Notice:</strong> The presence of advertisements on our website does not constitute an endorsement or recommendation by SarkariJobSeva. We are not responsible for the content of external advertisements.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section id="section-4" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">4. Cookies & Tracking Technologies</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">
              Cookies are small files that a website or its service provider transfers to your computer's hard drive through your web browser (if you allow) that enables the site's or service provider's systems to recognize your browser and capture and remember certain information.
            </p>
            <p className="mb-3">We use the following types of cookies:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential Cookies:</strong> Necessary for the website to function properly. These cannot be disabled.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website (via Google Analytics).</li>
              <li><strong>Advertising Cookies:</strong> Used by Google AdSense to show relevant ads (DoubleClick cookie).</li>
            </ul>
            <p className="mt-3">
              You can choose to disable cookies through your browser settings. However, disabling cookies may affect your experience on our website.
            </p>
          </div>
        </section>

        {/* Section 5 */}
        <section id="section-5" className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">5. Third-Party Services</h2>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">We may use third-party services that collect, monitor, and analyze information to improve our service. These include:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Analytics:</strong> For website traffic analysis and user behavior insights.</li>
              <li><strong>Google AdSense:</strong> For displaying advertisements.</li>
              <li><strong>Telegram/WhatsApp:</strong> For social sharing and community engagement.</li>
            </ul>
            <p className="mt-3">
              These third-party services have their own privacy policies. We encourage you to review their privacy policies before using their services.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section id="section-6" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">6. Data Security</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">
              We implement a variety of security measures to maintain the safety of your information. These include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Rate limiting to prevent abuse and unauthorized access</li>
              <li>Secure server infrastructure with firewall protection</li>
            </ul>
            <p className="mt-3">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section id="section-7" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Baby className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">7. Children's Privacy</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at <strong>supportsarkarijobseva@gmail.com</strong>. If we discover that we have collected personal information from a child under 13, we will promptly delete that information.
            </p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="section-8" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">8. Your Rights</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Right to Access:</strong> You can request copies of your personal data.</li>
              <li><strong>Right to Rectification:</strong> You can request that we correct any information you believe is inaccurate.</li>
              <li><strong>Right to Erasure:</strong> You can request that we erase your personal data under certain conditions.</li>
              <li><strong>Right to Restrict Processing:</strong> You can request that we restrict the processing of your personal data.</li>
              <li><strong>Right to Object:</strong> You can object to our processing of your personal data.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at <strong>supportsarkarijobseva@gmail.com</strong>.
            </p>
          </div>
        </section>

        {/* Section 9 */}
        <section id="section-9" className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">9. Changes to This Privacy Policy</h2>
          <div className="prose text-slate-700 leading-relaxed">
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="section-10" className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">10. Contact Us</h2>
          </div>
          <div className="prose text-slate-700 leading-relaxed">
            <p className="mb-3">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="font-semibold text-slate-800">SarkariJobSeva</p>
              <p className="text-slate-600">Email: supportsarkarijobseva@gmail.com</p>
              <p className="text-slate-600">Website: www.sarkarijobseva.com</p>
              <p className="text-slate-600">Location: New Delhi, India</p>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center pt-6 border-t border-slate-200">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
