import longbranchLogo from "../../assets/longbranch-logo.png";
import "./Sidebar.css";

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img
          src={longbranchLogo}
          alt="Longbranch Automation & Controls"
          className="brand-logo"
        />

        <p>Business Management</p>
      </div>

      <nav>
        <button
          className={
            activePage === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={
            activePage === "customers"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate("customers")
          }
        >
          Customers
        </button>

        <button
          className={
            activePage === "jobs"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate("jobs")
          }
        >
          Jobs
        </button>

        <button
          className={
            activePage === "invoices"
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate("invoices")
          }
        >
          Invoices
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;