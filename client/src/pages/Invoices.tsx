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
  Invoice,
  Job,
  LineItem,
} from "../types";

function Invoices() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showNewInvoice, setShowNewInvoice] =
    useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

  const [editingInvoiceId, setEditingInvoiceId] =
    useState<number | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
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

  const [dueDate, setDueDate] =
    useState("");

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

  const invoicePdfRef =
    useRef<HTMLDivElement | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        invoiceResponse,
        customerResponse,
        jobResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/invoices`),
        fetch(`${API_URL}/api/customers`),
        fetch(`${API_URL}/api/jobs`),
      ]);

      if (
        !invoiceResponse.ok ||
        !customerResponse.ok ||
        !jobResponse.ok
      ) {
        throw new Error(
          "Unable to load Longbranch data"
        );
      }

      const invoiceData: Invoice[] =
        await invoiceResponse.json();

      const customerData: Customer[] =
        await customerResponse.json();

      const jobData: Job[] =
        await jobResponse.json();

      setInvoices(invoiceData);
      setCustomers(customerData);
      setJobs(jobData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalInvoiced =
    invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.total),
      0
    );

  const totalPaid =
    invoices
      .filter(
        (invoice) =>
          invoice.status === "PAID"
      )
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.total),
        0
      );

  const outstanding =
    totalInvoiced - totalPaid;

  const filteredJobs =
    useMemo(() => {
      if (!customerId) {
        return jobs;
      }

      return jobs.filter(
        (job) =>
          job.facility?.customer?.id ===
          Number(customerId)
      );
    }, [jobs, customerId]);

  const invoiceSubtotal =
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

  const invoiceTotal =
    Math.max(
      invoiceSubtotal -
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

  const createNextInvoiceNumber =
    () => {
      const numbers =
        invoices.map(
          (invoice) => {
            const match =
              invoice.invoiceNumber.match(
                /(\d+)$/
              );

            return match
              ? Number(match[1])
              : 0;
          }
        );

      const nextNumber =
        numbers.length > 0
          ? Math.max(
              ...numbers
            ) + 1
          : 1;

      return `LBAC-INV-${String(
        nextNumber
      ).padStart(3, "0")}`;
    };

  const openNewInvoice = () => {
    setEditingInvoiceId(null);
    setSelectedInvoice(null);

    setInvoiceNumber(
      createNextInvoiceNumber()
    );

    setCustomerId("");
    setJobId("");

    setIssueDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setDueDate("");
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
    setShowNewInvoice(true);
  };

  const openInvoice = async (
    invoiceId: number
  ) => {
    try {
      const response =
        await fetch(
          `${API_URL}/api/invoices/${invoiceId}`
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load invoice"
        );
      }

      const data: Invoice =
        await response.json();

      setEditingInvoiceId(null);
      setShowNewInvoice(false);
      setSelectedInvoice(data);
    } catch (error) {
      console.error(error);
    }
  };

  const startEditingInvoice =
    () => {
      if (!selectedInvoice) {
        return;
      }

      setEditingInvoiceId(
        selectedInvoice.id
      );

      setInvoiceNumber(
        selectedInvoice.invoiceNumber
      );

      setCustomerId(
        String(
          selectedInvoice.customer.id
        )
      );

      setJobId(
        selectedInvoice.job
          ? String(
              selectedInvoice.job.id
            )
          : ""
      );

      setIssueDate(
        selectedInvoice.issueDate.slice(
          0,
          10
        )
      );

      setDueDate(
        selectedInvoice.dueDate
          ? selectedInvoice.dueDate.slice(
              0,
              10
            )
          : ""
      );

      setDiscount(
        selectedInvoice.discount
      );

      setNotes(
        selectedInvoice.notes || ""
      );

      setLineItems(
        selectedInvoice.lineItems?.map(
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

      setSelectedInvoice(null);
      setShowNewInvoice(true);
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
            itemIndex !==
            index
        )
    );
  };

  const handleCreateInvoice =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setFormError("");

      if (
        !invoiceNumber.trim()
      ) {
        setFormError(
          "Invoice number is required."
        );
        return;
      }

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
          "Add at least one invoice line item."
        );
        return;
      }

      try {
        setSaving(true);

        const url =
          editingInvoiceId
            ? `${API_URL}/api/invoices/${editingInvoiceId}`
            : `${API_URL}/api/invoices`;

        const response =
          await fetch(
            url,
            {
              method:
                editingInvoiceId
                  ? "PUT"
                  : "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    invoiceNumber:
                      invoiceNumber.trim(),

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

                    dueDate:
                      dueDate ||
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
              (editingInvoiceId
                ? "Unable to update invoice"
                : "Unable to create invoice")
          );
        }

        const savedInvoice:
          Invoice =
            await response.json();

        await loadData();

        setEditingInvoiceId(
          null
        );

        setShowNewInvoice(
          false
        );

        setSelectedInvoice(
          savedInvoice
        );
      } catch (error) {
        console.error(error);

        setFormError(
          error instanceof Error
            ? error.message
            : editingInvoiceId
              ? "Unable to update invoice."
              : "Unable to create invoice."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleMarkPaid =
    async () => {
      if (!selectedInvoice) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/invoices/${selectedInvoice.id}/status`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    status:
                      "PAID",
                  }
                ),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to mark invoice as paid"
          );
        }

        const updatedInvoice:
          Invoice =
            await response.json();

        setSelectedInvoice(
          updatedInvoice
        );

        setInvoices(
          (
            currentInvoices
          ) =>
            currentInvoices.map(
              (invoice) =>
                invoice.id ===
                updatedInvoice.id
                  ? {
                      ...invoice,
                      status:
                        updatedInvoice.status,
                    }
                  : invoice
            )
        );
      } catch (error) {
        console.error(error);
      }
    };

    const handleDeleteInvoice = async () => {
  if (!selectedInvoice) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedInvoice.invoiceNumber}?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    setFormError("");

    const response = await fetch(
      `${API_URL}/api/invoices/${selectedInvoice.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      let message =
        "Unable to delete invoice.";

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

      throw new Error(message);
    }

    setSelectedInvoice(null);

    await loadData();
  } catch (error) {
    console.error(error);

    setFormError(
      error instanceof Error
        ? error.message
        : "Unable to delete invoice."
    );
  }
};

  const cancelInvoiceForm =
    () => {
      setEditingInvoiceId(null);
      setShowNewInvoice(false);
      setFormError("");
    };

  const handleDownloadPdf =
    async () => {
      if (
        !selectedInvoice ||
        !invoicePdfRef.current
      ) {
        return;
      }

      try {
        const canvas =
          await html2canvas(
            invoicePdfRef.current,
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
          `${selectedInvoice.invoiceNumber}.pdf`
        );
      } catch (error) {
        console.error(
          "Unable to generate invoice PDF",
          error
        );
      }
    };

  return (
    <>
      {selectedInvoice ? (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">
                Longbranch Automation
                & Controls
              </p>

              <h2>
                {
                  selectedInvoice.invoiceNumber
                }
              </h2>

              <p className="subtitle">
                Invoice details
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setSelectedInvoice(
                  null
                )
              }
            >
              Back to Invoices
            </button>
          </header>

          <section
            className="invoice-detail"
            ref={invoicePdfRef}
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
                    Invoice
                  </span>

                  <strong>
                    {
                      selectedInvoice.invoiceNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Issue Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedInvoice.issueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedInvoice.dueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    <span
                      className={`status ${selectedInvoice.status.toLowerCase()}`}
                    >
                      {
                        selectedInvoice.status
                      }
                    </span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="invoice-party-grid">
              <div>
                <span className="invoice-label">
                  Bill To
                </span>

                <h3>
                  {
                    selectedInvoice
                      .customer
                      .name
                  }
                </h3>

                {selectedInvoice
                  .customer
                  .email && (
                  <p>
                    {
                      selectedInvoice
                        .customer
                        .email
                    }
                  </p>
                )}

                {selectedInvoice
                  .customer
                  .phone && (
                  <p>
                    {
                      selectedInvoice
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

                {selectedInvoice.job ? (
                  <>
                    <h3>
                      {
                        selectedInvoice
                          .job
                          .jobNumber
                      }
                    </h3>

                    <p>
                      {
                        selectedInvoice
                          .job.name
                      }
                    </p>

                    {selectedInvoice
                      .job
                      .facility && (
                      <p>
                        {
                          selectedInvoice
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

              {selectedInvoice
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
                  {selectedInvoice.notes ||
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
                        selectedInvoice.subtotal
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
                        selectedInvoice.discount
                      )
                    )}
                  </strong>
                </div>

                <div className="invoice-detail-grand-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatCurrency(
                      Number(
                        selectedInvoice.total
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
                  startEditingInvoice
                }
              >
                Edit Invoice
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
  onClick={handleDeleteInvoice}
>
  Delete Invoice
</button>


              {selectedInvoice.status !==
                "PAID" && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleMarkPaid
                  }
                >
                  Mark Paid
                </button>
              )}
            </div>
          </section>
        </>
      ) : showNewInvoice ? (
        <>
          <header className="page-header">
            <div>
              <p className="eyebrow">
                Longbranch Automation
                & Controls
              </p>

              <h2>
                {editingInvoiceId
                  ? "Edit Invoice"
                  : "New Invoice"}
              </h2>

              <p className="subtitle">
                {editingInvoiceId
                  ? "Update this customer invoice."
                  : "Create a customer invoice."}
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={
                cancelInvoiceForm
              }
            >
              Back to Invoices
            </button>
          </header>

          <form
            className="invoice-form"
            onSubmit={
              handleCreateInvoice
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
                    Invoice Details
                  </h3>

                  <p>
                    Customer, job, and
                    billing information.
                  </p>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  <span>
                    Invoice Number
                  </span>

                  <input
                    type="text"
                    value={
                      invoiceNumber
                    }
                    onChange={(
                      event
                    ) =>
                      setInvoiceNumber(
                        event.target
                          .value
                      )
                    }
                  />
                </label>

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
                    Due Date
                  </span>

                  <input
                    type="date"
                    value={
                      dueDate
                    }
                    onChange={(
                      event
                    ) =>
                      setDueDate(
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
                    services being
                    billed.
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
                      Optional invoice
                      or payment notes.
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
                  placeholder="Add invoice notes..."
                />
              </section>

              <section className="form-card totals-card">
                <div className="invoice-total-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      invoiceSubtotal
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
                      invoiceTotal
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
                    ? editingInvoiceId
                      ? "Saving Changes..."
                      : "Creating Invoice..."
                    : editingInvoiceId
                      ? "Save Changes"
                      : "Create Invoice"}
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
                Invoices
              </h2>

              <p className="subtitle">
                Create, manage, and
                track customer
                invoices.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={
                openNewInvoice
              }
            >
              + New Invoice
            </button>
          </header>

          <section className="summary-grid">
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
                  Invoices
                </h3>

                <p>
                  Recent customer
                  invoices
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
                  Due Date
                </span>

                <span>
                  Status
                </span>

                <span className="amount">
                  Total
                </span>
              </div>

              {loading ? (
                <div className="table-row">
                  <span>
                    Loading invoices...
                  </span>
                </div>
              ) : invoices.length ===
                0 ? (
                <div className="table-row">
                  <span>
                    No invoices yet.
                  </span>
                </div>
              ) : (
                invoices.map(
                  (invoice) => (
                    <div
                      className="table-row invoice-row"
                      key={
                        invoice.id
                      }
                      onClick={() =>
                        openInvoice(
                          invoice.id
                        )
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
                          invoice.dueDate
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
      )}
    </>
  );
}

export default Invoices;