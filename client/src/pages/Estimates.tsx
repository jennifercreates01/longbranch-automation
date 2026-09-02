import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import longbranchLogo from "../assets/longbranch-logo.png";
import { API_URL } from "../services/api";

import type {
  Customer,
  Job,
  LineItem,
} from "../types";

type EstimateLineItem = {
  id: number;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
};

type Estimate = {
  id: number;
  estimateNumber: string;
  issueDate: string;
  validUntil: string | null;
  subtotal: string;
  discount: string;
  total: string;
  notes: string | null;
  customer: Customer;
  job: Job | null;
  lineItems: EstimateLineItem[];
};

function Estimates() {
  const [estimates, setEstimates] =
    useState<Estimate[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    showNewEstimate,
    setShowNewEstimate,
  ] = useState(false);

  const [
    selectedEstimate,
    setSelectedEstimate,
  ] = useState<Estimate | null>(null);

  const [
    editingEstimateId,
    setEditingEstimateId,
  ] = useState<number | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [customerId, setCustomerId] =
    useState("");

  const [jobId, setJobId] =
    useState("");

  const [issueDate, setIssueDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [
    validUntil,
    setValidUntil,
  ] = useState("");

  const [discount, setDiscount] =
    useState("0");

  const [notes, setNotes] =
    useState("");

  const [lineItems, setLineItems] =
    useState<LineItem[]>([
      {
        description: "",
        quantity: "1",
        rate: "",
      },
    ]);

  const estimatePdfRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        estimateResponse,
        customerResponse,
        jobResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/api/estimates`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `${API_URL}/api/customers`,
          {
            credentials: "include",
          }
        ),

        fetch(
          `${API_URL}/api/jobs`,
          {
            credentials: "include",
          }
        ),
      ]);

      if (
        !estimateResponse.ok ||
        !customerResponse.ok ||
        !jobResponse.ok
      ) {
        throw new Error(
          "Unable to load Longbranch data"
        );
      }

      const estimateData:
        Estimate[] =
          await estimateResponse.json();

      const customerData:
        Customer[] =
          await customerResponse.json();

      const jobData: Job[] =
        await jobResponse.json();

      setEstimates(estimateData);
      setCustomers(customerData);
      setJobs(jobData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totalEstimated =
    estimates.reduce(
      (sum, estimate) =>
        sum +
        Number(estimate.total),
      0
    );

  const estimateCount =
    estimates.length;

  const averageEstimate =
    estimateCount > 0
      ? totalEstimated /
        estimateCount
      : 0;

  const filteredJobs =
    useMemo(() => {
      if (!customerId) {
        return jobs;
      }

      return jobs.filter(
        (job) =>
          job.facility?.customer
            ?.id ===
          Number(customerId)
      );
    }, [jobs, customerId]);

  const estimateSubtotal =
    lineItems.reduce(
      (sum, item) => {
        const quantity =
          Number(item.quantity) || 0;

        const rate =
          Number(item.rate) || 0;

        return (
          sum +
          quantity * rate
        );
      },
      0
    );

  const discountAmount =
    Number(discount) || 0;

  const estimateTotal =
    Math.max(
      estimateSubtotal -
        discountAmount,
      0
    );

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
    date: string | null
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

  const openNewEstimate = () => {
    setEditingEstimateId(null);
    setSelectedEstimate(null);

    setCustomerId("");
    setJobId("");

    setIssueDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setValidUntil("");
    setDiscount("0");
    setNotes("");

    setLineItems([
      {
        description: "",
        quantity: "1",
        rate: "",
      },
    ]);

    setFormError("");
    setShowNewEstimate(true);
  };

  const openEstimate = async (
    estimateId: number
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/estimates/${estimateId}`,
          {
            credentials: "include",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load estimate"
        );
      }

      const data: Estimate =
        await response.json();

      setEditingEstimateId(null);
      setShowNewEstimate(false);
      setSelectedEstimate(data);
    } catch (error) {
      console.error(error);
    }
  };

  const startEditingEstimate =
    () => {
      if (!selectedEstimate) {
        return;
      }

      setEditingEstimateId(
        selectedEstimate.id
      );

      setCustomerId(
        String(
          selectedEstimate
            .customer.id
        )
      );

      setJobId(
        selectedEstimate.job
          ? String(
              selectedEstimate
                .job.id
            )
          : ""
      );

      setIssueDate(
        selectedEstimate
          .issueDate
          .slice(0, 10)
      );

      setValidUntil(
        selectedEstimate.validUntil
          ? selectedEstimate
              .validUntil
              .slice(0, 10)
          : ""
      );

      setDiscount(
        selectedEstimate.discount
      );

      setNotes(
        selectedEstimate.notes ||
          ""
      );

      setLineItems(
        selectedEstimate
          .lineItems?.map(
            (item) => ({
              description:
                item.description,

              quantity:
                item.quantity,

              rate:
                item.rate,
            })
          ) || [
          {
            description: "",
            quantity: "1",
            rate: "",
          },
        ]
      );

      setSelectedEstimate(null);
      setShowNewEstimate(true);
      setFormError("");
    };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string
  ) => {
    setLineItems(
      (currentItems) =>
        currentItems.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  };

  const addLineItem = () => {
    setLineItems(
      (currentItems) => [
        ...currentItems,
        {
          description: "",
          quantity: "1",
          rate: "",
        },
      ]
    );
  };

  const removeLineItem = (
    index: number
  ) => {
    if (
      lineItems.length === 1
    ) {
      return;
    }

    setLineItems(
      (currentItems) =>
        currentItems.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !== index
        )
    );
  };

  const handleSaveEstimate =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setFormError("");

      if (!customerId) {
        setFormError(
          "Please select a customer."
        );

        return;
      }

      const validLineItems =
        lineItems.filter(
          (item) =>
            item.description.trim() &&
            Number(
              item.quantity
            ) > 0
        );

      if (
        validLineItems.length ===
        0
      ) {
        setFormError(
          "Add at least one estimate line item."
        );

        return;
      }

      try {
        setSaving(true);

        const url =
          editingEstimateId
            ? `${API_URL}/api/estimates/${editingEstimateId}`
            : `${API_URL}/api/estimates`;

        const response =
          await fetch(
            url,
            {
              credentials:
                "include",

              method:
                editingEstimateId
                  ? "PUT"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    customerId:
                      Number(
                        customerId
                      ),

                    jobId:
                      jobId
                        ? Number(
                            jobId
                          )
                        : null,

                    issueDate,

                    validUntil:
                      validUntil ||
                      null,

                    discount:
                      discountAmount,

                    notes:
                      notes ||
                      null,

                    lineItems:
                      validLineItems.map(
                        (
                          item
                        ) => ({
                          description:
                            item.description.trim(),

                          quantity:
                            Number(
                              item.quantity
                            ),

                          rate:
                            Number(
                              item.rate
                            ) || 0,
                        })
                      ),
                  }
                ),
            }
          );

        if (!response.ok) {
          const errorData =
            await response.json();

          throw new Error(
            errorData.message ||
              (editingEstimateId
                ? "Unable to update estimate"
                : "Unable to create estimate")
          );
        }

        const savedEstimate:
          Estimate =
            await response.json();

        await loadData();

        setEditingEstimateId(
          null
        );

        setShowNewEstimate(
          false
        );

        setSelectedEstimate(
          savedEstimate
        );
      } catch (error) {
        console.error(error);

        setFormError(
          error instanceof Error
            ? error.message
            : editingEstimateId
              ? "Unable to update estimate."
              : "Unable to create estimate."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDeleteEstimate =
    async () => {
      if (!selectedEstimate) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${selectedEstimate.estimateNumber}?\n\nThis action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setFormError("");

        const response =
          await fetch(
            `${API_URL}/api/estimates/${selectedEstimate.id}`,
            {
              method:
                "DELETE",

              credentials:
                "include",
            }
          );

        if (!response.ok) {
          let message =
            "Unable to delete estimate.";

          try {
            const data =
              await response.json();

            if (data.message) {
              message =
                data.message;
            }
          } catch {
            // Ignore non-JSON response
          }

          throw new Error(
            message
          );
        }

        setSelectedEstimate(
          null
        );

        await loadData();
      } catch (error) {
        console.error(error);

        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to delete estimate."
        );
      }
    };

  const cancelEstimateForm =
    () => {
      setEditingEstimateId(
        null
      );

      setShowNewEstimate(
        false
      );

      setFormError("");
    };

  const handleDownloadPdf =
    async () => {
      if (
        !selectedEstimate ||
        !estimatePdfRef.current
      ) {
        return;
      }

      try {
        const canvas =
          await html2canvas(
            estimatePdfRef.current,
            {
              scale: 2,

              backgroundColor:
                "#ffffff",

              useCORS: true,
            }
          );

        const imageData =
          canvas.toDataURL(
            "image/png"
          );

        const pdf =
          new jsPDF({
            orientation:
              "portrait",

            unit: "mm",

            format: "letter",
          });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        const margin = 7;

        const availableWidth =
          pageWidth -
          margin * 2;

        const imageWidth =
          availableWidth;

        const imageHeight =
          (canvas.height *
            imageWidth) /
          canvas.width;

        if (
          imageHeight <=
          pageHeight -
            margin * 2
        ) {
          pdf.addImage(
            imageData,
            "PNG",
            margin,
            margin,
            imageWidth,
            imageHeight
          );
        } else {
          const printableHeight =
            pageHeight -
            margin * 2;

          const scale =
            printableHeight /
            imageHeight;

          pdf.addImage(
            imageData,
            "PNG",
            margin,
            margin,
            imageWidth *
              scale,
            imageHeight *
              scale
          );
        }

        pdf.save(
          `${selectedEstimate.estimateNumber}.pdf`
        );
      } catch (error) {
        console.error(
          "Unable to generate estimate PDF",
          error
        );
      }
    };

  return (
    <>
      {selectedEstimate ? (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">
                Longbranch Automation
                & Controls
              </p>

              <h2>
                {
                  selectedEstimate
                    .estimateNumber
                }
              </h2>

              <p className="subtitle">
                Estimate details
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setSelectedEstimate(
                  null
                )
              }
            >
              Back to Estimates
            </button>
          </header>

          <section
            className="invoice-detail"
            ref={estimatePdfRef}
          >
            <div className="invoice-detail-top">
              <div>
                <img
                  src={
                    longbranchLogo
                  }
                  alt="Longbranch Automation & Controls"
                  className="invoice-detail-logo"
                />
              </div>

              <div className="invoice-detail-meta">
                <div>
                  <span>
                    Estimate
                  </span>

                  <strong>
                    {
                      selectedEstimate
                        .estimateNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Issue Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedEstimate
                        .issueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Valid Until
                  </span>

                  <strong>
                    {formatDate(
                      selectedEstimate
                        .validUntil
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="invoice-party-grid">
              <div>
                <span className="invoice-label">
                  Prepared For
                </span>

                <h3>
                  {
                    selectedEstimate
                      .customer
                      .name
                  }
                </h3>

                {selectedEstimate
                  .customer
                  .email && (
                  <p>
                    {
                      selectedEstimate
                        .customer
                        .email
                    }
                  </p>
                )}

                {selectedEstimate
                  .customer
                  .phone && (
                  <p>
                    {
                      selectedEstimate
                        .customer
                        .phone
                    }
                  </p>
                )}
              </div>

              <div>
                <span className="invoice-label">
                  Job
                </span>

                {selectedEstimate.job ? (
                  <>
                    <h3>
                      {
                        selectedEstimate
                          .job
                          .jobNumber
                      }
                    </h3>

                    <p>
                      {
                        selectedEstimate
                          .job
                          .name
                      }
                    </p>

                    {selectedEstimate
                      .job
                      .facility && (
                      <p>
                        {
                          selectedEstimate
                            .job
                            .facility
                            .name
                        }
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    No job assigned
                  </p>
                )}
              </div>
            </div>

            <div className="invoice-detail-table">
              <div className="invoice-detail-row invoice-detail-header">
                <span>
                  Description
                </span>

                <span>Qty</span>

                <span>Rate</span>

                <span>
                  Amount
                </span>
              </div>

              {selectedEstimate
                .lineItems?.map(
                  (item) => (
                    <div
                      className="invoice-detail-row"
                      key={
                        item.id
                      }
                    >
                      <span>
                        {
                          item.description
                        }
                      </span>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <span>
                        {formatCurrency(
                          Number(
                            item.rate
                          )
                        )}
                      </span>

                      <strong>
                        {formatCurrency(
                          Number(
                            item.amount
                          )
                        )}
                      </strong>
                    </div>
                  )
                )}
            </div>

            <div className="invoice-detail-bottom">
              <div className="invoice-notes">
                <span className="invoice-label">
                  Notes
                </span>

                <p>
                  {selectedEstimate
                    .notes ||
                    "No notes"}
                </p>
              </div>

              <div className="invoice-detail-totals">
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      Number(
                        selectedEstimate
                          .subtotal
                      )
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Discount
                  </span>

                  <strong>
                    {formatCurrency(
                      Number(
                        selectedEstimate
                          .discount
                      )
                    )}
                  </strong>
                </div>

                <div className="invoice-detail-grand-total">
                  <span>
                    Estimate Total
                  </span>

                  <strong>
                    {formatCurrency(
                      Number(
                        selectedEstimate
                          .total
                      )
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div
              className="invoice-actions"
              data-html2canvas-ignore="true"
            >
              <button
                type="button"
                className="secondary-button"
                onClick={
                  startEditingEstimate
                }
              >
                Edit Estimate
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={
                  handleDownloadPdf
                }
              >
                Download PDF
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={
                  handleDeleteEstimate
                }
              >
                Delete Estimate
              </button>
            </div>
          </section>
        </>
      ) : showNewEstimate ? (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">
                Longbranch Automation
                & Controls
              </p>

              <h2>
                {editingEstimateId
                  ? "Edit Estimate"
                  : "New Estimate"}
              </h2>

              <p className="subtitle">
                {editingEstimateId
                  ? "Update this customer estimate."
                  : "Create a customer estimate. The estimate number will be assigned automatically."}
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={
                cancelEstimateForm
              }
            >
              Back to Estimates
            </button>
          </header>

          <form
            className="invoice-form"
            onSubmit={
              handleSaveEstimate
            }
          >
            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}

            <section className="form-card">
              <div className="form-card-header">
                <div>
                  <h3>
                    Estimate Details
                  </h3>

                  <p>
                    Customer, job, and
                    estimate information.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  <span>
                    Customer
                  </span>

                  <select
                    value={
                      customerId
                    }
                    onChange={(
                      event
                    ) => {
                      setCustomerId(
                        event.target
                          .value
                      );

                      setJobId("");
                    }}
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {
                            customer.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Job
                  </span>

                  <select
                    value={jobId}
                    onChange={(
                      event
                    ) =>
                      setJobId(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      No job selected
                    </option>

                    {filteredJobs.map(
                      (job) => (
                        <option
                          key={
                            job.id
                          }
                          value={
                            job.id
                          }
                        >
                          {
                            job.jobNumber
                          }{" "}
                          —{" "}
                          {
                            job.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Issue Date
                  </span>

                  <input
                    type="date"
                    value={
                      issueDate
                    }
                    onChange={(
                      event
                    ) =>
                      setIssueDate(
                        event.target
                          .value
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Valid Until
                  </span>

                  <input
                    type="date"
                    value={
                      validUntil
                    }
                    onChange={(
                      event
                    ) =>
                      setValidUntil(
                        event.target
                          .value
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="form-card">
              <div className="form-card-header line-item-heading">
                <div>
                  <h3>
                    Line Items
                  </h3>

                  <p>
                    Add the work,
                    materials, or
                    services included
                    in this estimate.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    addLineItem
                  }
                >
                  + Add Line
                </button>
              </div>

              <div className="line-items">
                <div className="line-item-row line-item-header">
                  <span>
                    Description
                  </span>

                  <span>Qty</span>

                  <span>Rate</span>

                  <span>
                    Amount
                  </span>

                  <span />
                </div>

                {lineItems.map(
                  (
                    item,
                    index
                  ) => {
                    const amount =
                      (Number(
                        item.quantity
                      ) || 0) *
                      (Number(
                        item.rate
                      ) || 0);

                    return (
                      <div
                        className="line-item-row"
                        key={
                          index
                        }
                      >
                        <input
                          type="text"
                          placeholder="Description"
                          value={
                            item.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateLineItem(
                              index,
                              "description",
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            item.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateLineItem(
                              index,
                              "quantity",
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={
                            item.rate
                          }
                          onChange={(
                            event
                          ) =>
                            updateLineItem(
                              index,
                              "rate",
                              event
                                .target
                                .value
                            )
                          }
                        />

                        <strong>
                          {formatCurrency(
                            amount
                          )}
                        </strong>

                        <button
                          type="button"
                          className="remove-line-button"
                          onClick={() =>
                            removeLineItem(
                              index
                            )
                          }
                          disabled={
                            lineItems.length ===
                            1
                          }
                        >
                          ×
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <div className="invoice-bottom-grid">
              <section className="form-card">
                <div className="form-card-header">
                  <div>
                    <h3>
                      Notes
                    </h3>

                    <p>
                      Optional estimate
                      terms or customer
                      notes.
                    </p>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Add estimate notes..."
                />
              </section>

              <section className="form-card totals-card">
                <div className="invoice-total-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      estimateSubtotal
                    )}
                  </strong>
                </div>

                <label className="discount-row">
                  <span>
                    Discount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      discount
                    }
                    onChange={(
                      event
                    ) =>
                      setDiscount(
                        event.target
                          .value
                      )
                    }
                  />
                </label>

                <div className="invoice-total-row grand-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatCurrency(
                      estimateTotal
                    )}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="primary-button save-invoice-button"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? editingEstimateId
                      ? "Saving Changes..."
                      : "Creating Estimate..."
                    : editingEstimateId
                      ? "Save Changes"
                      : "Create Estimate"}
                </button>
              </section>
            </div>
          </form>
        </>
      ) : (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">
                Longbranch Automation
                & Controls
              </p>

              <h2>
                Estimates
              </h2>

              <p className="subtitle">
                Create, manage, and
                track customer
                estimates.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={
                openNewEstimate
              }
            >
              + New Estimate
            </button>
          </header>

          <section className="summary-grid">
            <div className="summary-card">
              <span>
                Total Estimated
              </span>

              <strong>
                {formatCurrency(
                  totalEstimated
                )}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Estimate Count
              </span>

              <strong>
                {estimateCount}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Average Estimate
              </span>

              <strong>
                {formatCurrency(
                  averageEstimate
                )}
              </strong>
            </div>
          </section>

          <section className="invoice-section">
            <div className="section-heading">
              <div>
                <h3>
                  Estimates
                </h3>

                <p>
                  Recent customer
                  estimates
                </p>
              </div>
            </div>

            <div className="invoice-table">
              <div className="table-row table-header">
                <span>
                  Estimate
                </span>

                <span>
                  Customer
                </span>

                <span>
                  Issue Date
                </span>

                <span>
                  Valid Until
                </span>

                <span className="amount">
                  Total
                </span>
              </div>

              {loading ? (
                <div className="table-row">
                  <span>
                    Loading estimates...
                  </span>
                </div>
              ) : estimates.length ===
                0 ? (
                <div className="table-row">
                  <span>
                    No estimates yet.
                  </span>
                </div>
              ) : (
                estimates.map(
                  (estimate) => (
                    <div
                      className="table-row invoice-row"
                      key={
                        estimate.id
                      }
                      onClick={() =>
                        openEstimate(
                          estimate.id
                        )
                      }
                    >
                      <strong>
                        {
                          estimate
                            .estimateNumber
                        }
                      </strong>

                      <span>
                        {
                          estimate
                            .customer
                            .name
                        }
                      </span>

                      <span>
                        {formatDate(
                          estimate
                            .issueDate
                        )}
                      </span>

                      <span>
                        {formatDate(
                          estimate
                            .validUntil
                        )}
                      </span>

                      <strong className="amount">
                        {formatCurrency(
                          Number(
                            estimate.total
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
      )}
    </>
  );
}

export default Estimates;
