import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { API_URL } from "../services/api";

import type {
  Customer,
  Invoice,
  Job,
} from "../types";

function Dashboard() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            customerResponse,
            jobResponse,
            invoiceResponse,
          ] = await Promise.all([
            fetch(
              `${API_URL}/api/customers`
            ),
            fetch(
              `${API_URL}/api/jobs`
            ),
            fetch(
              `${API_URL}/api/invoices`
            ),
          ]);

          if (
            !customerResponse.ok ||
            !jobResponse.ok ||
            !invoiceResponse.ok
          ) {
            throw new Error(
              "Unable to load dashboard data"
            );
          }

          const customerData:
            Customer[] =
              await customerResponse.json();

          const jobData:
            Job[] =
              await jobResponse.json();

          const invoiceData:
            Invoice[] =
              await invoiceResponse.json();

          setCustomers(
            customerData
          );

          setJobs(
            jobData
          );

          setInvoices(
            invoiceData
          );
        } catch (error) {
          console.error(error);

          setError(
            "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
        }
      };

    loadDashboard();
  }, []);

  const formatCurrency = (
    amount: number
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    ).format(amount);

  const formatDate = (
    date: string | null | undefined
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }
    );
  };

  const totalInvoiced =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(invoice.total),
      0
    );

  const totalPaid =
    invoices
      .filter(
        (invoice) =>
          invoice.status ===
          "PAID"
      )
      .reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total
          ),
        0
      );

  const outstanding =
    totalInvoiced -
    totalPaid;

  const activeJobs =
    jobs.filter(
      (job) =>
        job.status ===
          "OPEN" ||
        job.status ===
          "IN_PROGRESS"
    ).length;

  const completedJobs =
    jobs.filter(
      (job) =>
        job.status ===
        "COMPLETED"
    ).length;

  const recentJobs =
    useMemo(() => {
      return [...jobs]
        .sort((a, b) => {
          const aDate =
            a.startDate
              ? new Date(
                  a.startDate
                ).getTime()
              : 0;

          const bDate =
            b.startDate
              ? new Date(
                  b.startDate
                ).getTime()
              : 0;

          return (
            bDate -
            aDate
          );
        })
        .slice(0, 5);
    }, [jobs]);

  const recentInvoices =
    useMemo(() => {
      return [...invoices]
        .sort((a, b) => {
          return (
            new Date(
              b.issueDate
            ).getTime() -
            new Date(
              a.issueDate
            ).getTime()
          );
        })
        .slice(0, 5);
    }, [invoices]);

  if (loading) {
    return (
      <p>
        Loading dashboard...
      </p>
    );
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">
            Longbranch Automation
            & Controls
          </p>

          <h2>
            Dashboard
          </h2>

          <p className="subtitle">
            Business overview and
            current activity.
          </p>
        </div>
      </header>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="summary-grid">
        <div className="summary-card">
          <span>
            Customers
          </span>

          <strong>
            {
              customers.length
            }
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Total Jobs
          </span>

          <strong>
            {jobs.length}
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Active Jobs
          </span>

          <strong>
            {activeJobs}
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Completed Jobs
          </span>

          <strong>
            {completedJobs}
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Total Invoiced
          </span>

          <strong>
            {formatCurrency(
              totalInvoiced
            )}
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Outstanding
          </span>

          <strong>
            {formatCurrency(
              outstanding
            )}
          </strong>
        </div>

        <div className="summary-card">
          <span>
            Paid
          </span>

          <strong>
            {formatCurrency(
              totalPaid
            )}
          </strong>
        </div>
      </section>

      <section className="invoice-section">
        <div className="section-heading">
          <div>
            <h3>
              Recent Jobs
            </h3>

            <p>
              Latest project activity
            </p>
          </div>
        </div>

        <div className="invoice-table">
          <div className="table-row table-header">
            <span>
              Job Number
            </span>

            <span>
              Job Name
            </span>

            <span>
              Customer
            </span>

            <span>
              Status
            </span>

            <span>
              Start Date
            </span>
          </div>

          {recentJobs.length ===
          0 ? (
            <div className="table-row">
              <span>
                No jobs yet.
              </span>
            </div>
          ) : (
            recentJobs.map(
              (job) => (
                <div
                  className="table-row"
                  key={job.id}
                >
                  <strong>
                    {
                      job.jobNumber
                    }
                  </strong>

                  <span>
                    {job.name}
                  </span>

                  <span>
                    {job.facility
                      ?.customer
                      ?.name ||
                      "—"}
                  </span>

                  <span>
                    <span
                      className={`status ${job.status
                        ?.toLowerCase()
                        .replace(
                          "_",
                          "-"
                        )}`}
                    >
                      {job.status ||
                        "—"}
                    </span>
                  </span>

                  <span>
                    {formatDate(
                      job.startDate
                    )}
                  </span>
                </div>
              )
            )
          )}
        </div>
      </section>

      <section className="invoice-section">
        <div className="section-heading">
          <div>
            <h3>
              Recent Invoices
            </h3>

            <p>
              Latest billing activity
            </p>
          </div>
        </div>

        <div className="invoice-table">
          <div className="table-row table-header">
            <span>
              Invoice
            </span>

            <span>
              Customer
            </span>

            <span>
              Issue Date
            </span>

            <span>
              Status
            </span>

            <span className="amount">
              Total
            </span>
          </div>

          {recentInvoices.length ===
          0 ? (
            <div className="table-row">
              <span>
                No invoices yet.
              </span>
            </div>
          ) : (
            recentInvoices.map(
              (invoice) => (
                <div
                  className="table-row"
                  key={
                    invoice.id
                  }
                >
                  <strong>
                    {
                      invoice.invoiceNumber
                    }
                  </strong>

                  <span>
                    {
                      invoice
                        .customer
                        .name
                    }
                  </span>

                  <span>
                    {formatDate(
                      invoice.issueDate
                    )}
                  </span>

                  <span>
                    <span
                      className={`status ${invoice.status.toLowerCase()}`}
                    >
                      {
                        invoice.status
                      }
                    </span>
                  </span>

                  <strong className="amount">
                    {formatCurrency(
                      Number(
                        invoice.total
                      )
                    )}
                  </strong>
                </div>
              )
            )
          )}
        </div>
      </section>
    </>
  );
}

export default Dashboard;