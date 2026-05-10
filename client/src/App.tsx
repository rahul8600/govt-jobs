import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/AuthContext";
import { Layout } from "@/components/Layout";

// Direct imports (No lazy loading)
import Home from "@/pages/Home";
import JobDetails from "@/pages/JobDetails";
import JobList from "@/pages/JobList";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/job/:id" component={JobDetails} />
        <Route path="/admin" component={Admin} />

        {/* Job Categories */}
        <Route path="/search" component={JobList} />
        <Route path="/latest-jobs" component={JobList} />
        <Route path="/admit-card" component={JobList} />
        <Route path="/results" component={JobList} />
        <Route path="/answer-key" component={JobList} />
        <Route path="/admission" component={JobList} />

        {/* Qualification Pages */}
        <Route path="/jobs/10th-pass" component={JobList} />
        <Route path="/jobs/12th-pass" component={JobList} />
        <Route path="/jobs/graduation" component={JobList} />
        <Route path="/jobs/post-graduate" component={JobList} />

        {/* State Jobs */}
        <Route path="/jobs/state/:state" component={JobList} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
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
