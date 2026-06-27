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
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import SitemapPage from "@/pages/SitemapPage";
import BlogList from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import SalaryCalculator from "@/pages/SalaryCalculator";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/job/:id" component={JobDetails} />
        <Route path="/admin" component={Admin} />
        <Route path="/search" component={JobList} />
        <Route path="/latest-jobs" component={JobList} />
        <Route path="/admit-card" component={JobList} />
        <Route path="/results" component={JobList} />
        <Route path="/answer-key" component={JobList} />
        <Route path="/admission" component={JobList} />
        <Route path="/jobs/10th-pass" component={JobList} />
        <Route path="/jobs/12th-pass" component={JobList} />
        <Route path="/jobs/graduation" component={JobList} />
        <Route path="/jobs/post-graduate" component={JobList} />
        <Route path="/jobs/state/:state" component={JobList} />
        <Route path="/blog" component={BlogList} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/privacy-policy" component={PrivacyPage} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/syllabus" component={Syllabus} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/about-us" component={AboutPage} />
        <Route path="/sitemap" component={SitemapPage} />
        <Route path="/salary-calculator" component={SalaryCalculator} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
