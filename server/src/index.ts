import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Longbranch Automation Books API is running",
  });
});

app.get("/api/customers", async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
    include: {
  facilities: {
    include: {
      jobs: true,
    },
  },
},
      orderBy: {
        name: "asc",
      },
    });

    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve customers",
    });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Customer name is required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to create customer",
    });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
    include: {
  facilities: {
    include: {
      jobs: true,
    },
  },
},
});
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve customer",
    });
  }
});

app.post("/api/customers/:id/facilities", async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    const { name, address, city, state, zipCode, notes } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Facility name is required",
      });
    }

    const facility = await prisma.facility.create({
      data: {
        name: name.trim(),
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        notes: notes || null,
        customerId,
      },
    });

    res.status(201).json(facility);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to create facility",
    });
  }
});

app.post("/api/facilities/:id/jobs", async (req, res) => {
  try {
    const facilityId = Number(req.params.id);
    const {
      jobNumber,
      name,
      description,
      status,
      startDate,
      endDate,
    } = req.body;

    if (!jobNumber?.trim()) {
      return res.status(400).json({
        message: "Job number is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Job name is required",
      });
    }

    const job = await prisma.job.create({
      data: {
        jobNumber: jobNumber.trim(),
        name: name.trim(),
        description: description || null,
        status: status || "ACTIVE",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        facilityId,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to create job",
    });
  }
});
app.get("/api/jobs", async (_req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        facility: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve jobs",
    });
  }
});
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        facility: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve job",
    });
  }
});
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      jobNumber,
      name,
      description,
      status,
      startDate,
      endDate,
      facilityId,
    } = req.body;

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        jobNumber: jobNumber?.trim() || existingJob.jobNumber,
        name: name?.trim() || existingJob.name,
        description:
          description !== undefined ? description || null : existingJob.description,
        status: status || existingJob.status,
        startDate:
          startDate !== undefined
            ? startDate
              ? new Date(startDate)
              : null
            : existingJob.startDate,
        endDate:
          endDate !== undefined
            ? endDate
              ? new Date(endDate)
              : null
            : existingJob.endDate,
        facilityId: facilityId || existingJob.facilityId,
      },
      include: {
        facility: {
          include: {
            customer: true,
          },
        },
      },
    });

    res.json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to update job",
    });
  }
});
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    await prisma.job.delete({
      where: { id },
    });

    res.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to delete job",
    });
  }
});
app.post("/api/invoices", async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerId,
      jobId,
      issueDate,
      dueDate,
      discount = 0,
      notes,
      lineItems,
    } = req.body;

    if (!invoiceNumber?.trim()) {
      return res.status(400).json({
        message: "Invoice number is required",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        message: "Customer is required",
      });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        message: "At least one line item is required",
      });
    }

    const calculatedItems = lineItems.map((item) => {
      const quantity = Number(item.quantity);
      const rate = Number(item.rate);

      return {
        description: item.description,
        quantity,
        rate,
        amount: quantity * rate,
      };
    });

    const subtotal = calculatedItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const discountAmount = Number(discount) || 0;
    const total = Math.max(subtotal - discountAmount, 0);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNumber.trim(),
        customerId: Number(customerId),
        jobId: jobId ? Number(jobId) : null,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        discount: discountAmount,
        subtotal,
        total,
        notes: notes || null,

        lineItems: {
          create: calculatedItems,
        },
      },

      include: {
        customer: true,
        job: true,
        lineItems: true,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to create invoice",
    });
  }
});
app.get("/api/invoices", async (_req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        job: true,
        lineItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve invoices",
    });
  }
});
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        job: {
          include: {
            facility: true,
          },
        },
        lineItems: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to retrieve invoice",
    });
  }
});
app.patch("/api/invoices/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    const allowedStatuses = ["DRAFT", "SENT", "PAID"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid invoice status",
      });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        job: {
          include: {
            facility: true,
          },
        },
        lineItems: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update invoice status",
    });
  }
});
app.put("/api/invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      invoiceNumber,
      customerId,
      jobId,
      issueDate,
      dueDate,
      discount = 0,
      notes,
      lineItems,
    } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid invoice ID",
      });
    }

    if (!invoiceNumber?.trim()) {
      return res.status(400).json({
        message: "Invoice number is required",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        message: "Customer is required",
      });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        message: "At least one line item is required",
      });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const calculatedItems = lineItems.map((item) => {
      const quantity = Number(item.quantity);
      const rate = Number(item.rate);

      return {
        description: item.description.trim(),
        quantity,
        rate,
        amount: quantity * rate,
      };
    });

    const subtotal = calculatedItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const discountAmount = Number(discount) || 0;

    const total = Math.max(
      subtotal - discountAmount,
      0
    );

    const updatedInvoice = await prisma.invoice.update({
      where: { id },

      data: {
        invoiceNumber: invoiceNumber.trim(),

        customerId: Number(customerId),

        jobId: jobId
          ? Number(jobId)
          : null,

        issueDate: issueDate
          ? new Date(issueDate)
          : existingInvoice.issueDate,

        dueDate: dueDate
          ? new Date(dueDate)
          : null,

        subtotal,
        discount: discountAmount,
        total,

        notes: notes || null,

        lineItems: {
          deleteMany: {},

          create: calculatedItems,
        },
      },

      include: {
        customer: true,

        job: {
          include: {
            facility: true,
          },
        },

        lineItems: true,
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to update invoice",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Longbranch server running on port ${PORT}`);
});