import { useState } from "react";

import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Jobs from "./pages/Jobs";
import Invoices from "./pages/Invoices";

import "./App.css";

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [
    selectedJobId,
    setSelectedJobId,
  ] = useState<number | null>(
    null
  );

  const handleNavigate = (
    page: string
  ) => {
    setSelectedJobId(null);
    setActivePage(page);
  };

  const handleOpenJob = (
    jobId: number
  ) => {
    setSelectedJobId(jobId);
    setActivePage("jobs");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "customers":
        return (
          <Customers
            onNavigate={
              handleNavigate
            }
            onOpenJob={
              handleOpenJob
            }
          />
        );

      case "jobs":
        return (
          <Jobs
            initialJobId={
              selectedJobId
            }
          />
        );

      case "invoices":
      default:
        return <Invoices />;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activePage={
          activePage
        }
        onNavigate={
          handleNavigate
        }
      />

      <main className="main">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;