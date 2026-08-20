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
        facilities: true,
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
        facilities: true,
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

app.listen(PORT, () => {
  console.log(`Longbranch server running on port ${PORT}`);
});