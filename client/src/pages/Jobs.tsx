import {
  useEffect,
  useState,
} from "react";

import JobForm from "../components/JobForm/JobForm";
import { API_URL } from "../services/api";

import type {
  Customer,
  Job,
} from "../types";

type JobsProps = {
  initialJobId?:
    number | null;
};

function Jobs({
  initialJobId,
}: JobsProps) {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    showNewJob,
    setShowNewJob,
  ] = useState(false);

  const [
    selectedJob,
    setSelectedJob,
  ] = useState<Job | null>(
    null
  );

  useEffect(() => {
  if (
    !initialJobId ||
    jobs.length === 0
  ) {
    return;
  }

  const jobToOpen =
    jobs.find(
      (job) =>
        job.id ===
        initialJobId
    );

  if (jobToOpen) {
    setSelectedJob(
      jobToOpen
    );
  }
}, [initialJobId, jobs]);

  const [
    editingJob,
    setEditingJob,
  ] = useState<Job | null>(
    null
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        jobResponse,
        customerResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/jobs`
        ),
        fetch(
          `${API_URL}/api/customers`
        ),
      ]);

      if (
        !jobResponse.ok ||
        !customerResponse.ok
      ) {
        throw new Error(
          "Unable to load jobs"
        );
      }

      const jobData:
        Job[] =
          await jobResponse.json();

      const customerData:
        Customer[] =
          await customerResponse.json();

      setJobs(jobData);
      setCustomers(
        customerData
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load jobs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openJob = async (
    jobId: number
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/jobs/${jobId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load job"
        );
      }

      const job:
        Job =
          await response.json();

      setSelectedJob(job);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteJob = async () => {
  if (!selectedJob) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedJob.jobNumber}?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/jobs/${selectedJob.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Unable to delete job");
    }

    setSelectedJob(null);
    setEditingJob(null);
    setShowNewJob(false);

    await loadData();
  } catch (error) {
    console.error(error);
    setError("Unable to delete job");
  }
};

  const handleJobSaved =
    async (
      savedJob?: Job
    ) => {
      await loadData();

      setShowNewJob(false);
      setEditingJob(null);

      if (savedJob) {
        setSelectedJob(
          savedJob
        );
      }
    };

  if (
    showNewJob ||
    editingJob
  ) {
    return (
      <JobForm
        customers={customers}
        job={editingJob}
        onCancel={() => {
          setShowNewJob(
            false
          );

          setEditingJob(
            null
          );
        }}
        onSaved={
          handleJobSaved
        }
      />
    );
  }

  if (selectedJob) {
    return (
      <>
        <header className="page-header">
          <div>
            <p className="eyebrow">
              Longbranch Automation
              & Controls
            </p>

            <h2>
              {
                selectedJob.jobNumber
              }
            </h2>

            <p className="subtitle">
              Job details
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setSelectedJob(
                null
              )
            }
          >
            Back to Jobs
          </button>
        </header>

        <section className="form-card">
<div className="form-card-header">
  <div>
    <h3>
      Job Information
    </h3>

    <p>
      Project details and
      assignment.
    </p>
  </div>

  <div className="detail-actions">
    <button
      type="button"
      className="secondary-button"
      onClick={() =>
        setEditingJob(
          selectedJob
        )
      }
    >
      Edit Job
    </button>

    <button
      type="button"
      className="danger-button"
      onClick={
        handleDeleteJob
      }
    >
      Delete Job
    </button>
  </div>
</div>

          <div className="form-grid">
            <div>
              <span className="invoice-label">
                Job Number
              </span>

              <p>
                {
                  selectedJob.jobNumber
                }
              </p>
            </div>

            <div>
              <span className="invoice-label">
                Job Name
              </span>

              <p>
                {
                  selectedJob.name
                }
              </p>
            </div>

            <div>
              <span className="invoice-label">
                Status
              </span>

              <p>
                {
                  selectedJob.status ||
                  "—"
                }
              </p>
            </div>

            <div>
              <span className="invoice-label">
                Customer
              </span>

              <p>
                {selectedJob
                  .facility
                  ?.customer
                  ?.name ||
                  "—"}
              </p>
            </div>

            <div>
              <span className="invoice-label">
                Facility
              </span>

              <p>
                {selectedJob
                  .facility
                  ?.name ||
                  "—"}
              </p>
            </div>

            <div>
              <span className="invoice-label">
                Start Date
              </span>

              <p>
                {selectedJob.startDate
                  ? new Date(
                      selectedJob.startDate
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div>
              <span className="invoice-label">
                End Date
              </span>

              <p>
                {selectedJob.endDate
                  ? new Date(
                      selectedJob.endDate
                    ).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="form-card">
          <div className="form-card-header">
            <div>
              <h3>
                Description
              </h3>

              <p>
                Work details and
                project notes.
              </p>
            </div>
          </div>

          <p>
            {selectedJob.description ||
              "No description"}
          </p>
        </section>
      </>
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

          <h2>Jobs</h2>

          <p className="subtitle">
            Manage customer jobs
            and project status.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowNewJob(
              true
            )
          }
        >
          + New Job
        </button>
      </header>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <section className="invoice-section">
        <div className="section-heading">
          <div>
            <h3>Jobs</h3>

            <p>
              Customer projects
              and work orders
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
              Facility
            </span>

            <span>
              Customer
            </span>

            <span>
              Status
            </span>
          </div>

          {loading ? (
            <div className="table-row">
              <span>
                Loading jobs...
              </span>
            </div>
          ) : jobs.length ===
            0 ? (
            <div className="table-row">
              <span>
                No jobs yet.
              </span>
            </div>
          ) : (
            jobs.map(
              (job) => (
                <div
                  className="table-row invoice-row"
                  key={job.id}
                  onClick={() =>
                    openJob(
                      job.id
                    )
                  }
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
                      ?.name ||
                      "—"}
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
                </div>
              )
            )
          )}
        </div>
      </section>
    </>
  );
}

export default Jobs;