import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { Layout } from "@/components/Layout";
import { lazy, Suspense } from "react";

const Home       = lazy(() => import("@/pages/Home"));
const JobDetails = lazy(() => import("@/pages/JobDetails"));
const JobList    = lazy(() => import("@/pages/JobList"));
const Admin      = lazy(() => import("@/pages/Admin"));
const NotFound   = lazy(() => import("@/pages/not-found"));
const Disclaimer    = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Disclaimer })));
const PrivacyPolicy = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService= lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.TermsOfService })));
const Syllabus      = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Syllabus })));
const Contact       = lazy(() => import("@/pages/InfoPages").then(m => ({ default: m.Contact })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/"                    component={Home} />
          <Route path="/job/:id"             component={JobDetails} />
          <Route path="/admin"               component={Admin} />
          <Route path="/search"              component={JobList} />
          <Route path="/latest-jobs"         component={JobList} />
          <Route path="/admit-card"          component={JobList} />
          <Route path="/results"             component={JobList} />
          <Route path="/answer-key"          component={JobList} />
          <Route path="/admission"           component={JobList} />
          <Route path="/jobs/10th-pass"      component={JobList} />
          <Route path="/jobs/12th-pass"      component={JobList} />
          <Route path="/jobs/graduation"     component={JobList} />
          <Route path="/jobs/post-graduate"  component={JobList} />
          <Route path="/jobs/state/:state"   component={JobList} />
          <Route path="/disclaimer"          component={Disclaimer} />
          <Route path="/privacy-policy"      component={PrivacyPolicy} />
          <Route path="/terms-of-service"    component={TermsOfService} />
          <Route path="/syllabus"            component={Syllabus} />
          <Route path="/contact"             component={Contact} />
          <Route                             component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
