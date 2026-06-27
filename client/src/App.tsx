import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import JobDetails from "@/pages/JobDetails";
import Admin from "@/pages/Admin";
import JobList from "@/pages/JobList";
import { Disclaimer, PrivacyPolicy, TermsOfService, Syllabus, Contact, AboutUs } from "@/pages/InfoPages";
import BlogList from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import SalaryCalculator from "@/pages/SalaryCalculator";

// NEW: AdSense optimized pages
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import SitemapPage from "@/pages/SitemapPage";

// NEW: SEO Schema Components
import { OrganizationSchema, WebsiteSchema } from "@/components/JobSchema";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/job/:slug" component={JobDetails} />
        <Route path="/latest-jobs" component={JobList} />
        <Route path="/admit-card" component={() => <JobList type="admit-card" />} />
        <Route path="/results" component={() => <JobList type="result" />} />
        <Route path="/answer-key" component={() => <JobList type="answer-key" />} />
        <Route path="/admission" component={() => <JobList type="admission" />} />
        <Route path="/category/:category" component={JobList} />
        <Route path="/state/:state" component={JobList} />
        <Route path="/search" component={JobList} />
        <Route path="/admin" component={Admin} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/salary-calculator" component={SalaryCalculator} />

        {/* OLD Info Pages - Keep for backward compatibility */}
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/syllabus" component={Syllabus} />

        {/* NEW: Enhanced AdSense-optimized pages */}
        <Route path="/about-us" component={AboutPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/privacy-policy" component={PrivacyPage} />
        <Route path="/sitemap" component={SitemapPage} />

        {/* Keep old routes redirecting to new ones */}
        <Route path="/about" component={AboutPage} />
        <Route path="/privacy" component={PrivacyPage} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          {/* Global SEO Schema */}
          <OrganizationSchema />
          <WebsiteSchema />
          <Router />
          <Toaster />
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
