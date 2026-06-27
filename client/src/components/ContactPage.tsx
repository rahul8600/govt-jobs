import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Mail, MapPin, Clock, Send, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact Us | SarkariJobSeva - Get in Touch";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Contact SarkariJobSeva team for queries, feedback, or incorrect information. Email: supportsarkarijobseva@gmail.com. We typically respond within 24-48 hours.");
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', "https://www.sarkarijobseva.com/contact");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, send to API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-blue-100 text-lg">We are here to help you. Reach out for any queries, feedback, or corrections.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Get In Touch</h2>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Email Support</h3>
                    <p className="text-slate-600 text-sm mt-1">For general inquiries and support:</p>
                    <a href="mailto:supportsarkarijobseva@gmail.com" className="text-blue-600 font-semibold text-sm hover:underline">
                      supportsarkarijobseva@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Report Incorrect Info</h3>
                    <p className="text-slate-600 text-sm mt-1">Found wrong or outdated information?</p>
                    <a href="mailto:supportsarkarijobseva@gmail.com" className="text-green-600 font-semibold text-sm hover:underline">
                      supportsarkarijobseva@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Response Time</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      We typically respond within <strong>24-48 hours</strong> during business days (Monday-Saturday, 9 AM - 6 PM IST).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Office Location</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      New Delhi, India<br />
                      <span className="text-xs text-slate-500">(Virtual office - all operations are online)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h3 className="font-bold text-slate-800 mb-3">Follow Us</h3>
              <div className="flex gap-3">
                <a href="https://t.me/sarkarijobse" target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  📱 Telegram
                </a>
                <a href="#" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold text-green-800 text-lg">Message Sent!</h3>
                <p className="text-green-600 text-sm mt-2">Thank you for reaching out. We will get back to you within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name *</label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label>
                  <Input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject *</label>
                  <Input 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g., Wrong Information on SSC CGL Post"
                    className="bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Message *</label>
                  <Textarea 
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Describe your query or feedback in detail..."
                    className="bg-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            )}

            {/* Important Note */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-bold text-amber-800 text-sm mb-2">Important Note</h4>
              <p className="text-amber-700 text-sm leading-relaxed">
                We are an informational website only. We do not process job applications or have access to any recruitment database. For application-related issues, please contact the respective recruitment body directly through their official website.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
