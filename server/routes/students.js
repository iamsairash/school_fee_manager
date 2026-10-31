import { Router } from "express";
import Student from "../models/Student.js";
import {
  validateStudentInput,
  validateStudentUpdate,
} from "../utils/validateStudent.js";
import { validatePaymentInput } from "../utils/validatePayment.js";

const router = Router();
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// GET /api/students
// DELAY_MS is still available as a testing helper
router.get("/", async (req, res, next) => {
  try {
    const delay = Number(process.env.DELAY_MS) || 0;
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

    // Not using .lean() on purpose, so the toJSON transform (_id -> id) runs
    const students = await Student.find().sort({ _id: 1 });
    res.json(students);
  } catch (err) {
    next(err); // Express 4 doesn't catch errors in async routes by itself
  }
});

// POST /api/students
router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validateStudentInput(req.body);
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ error: "Please fix the highlighted fields.", fields: errors });
    }
    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});
// PATCH /api/students/:id/payments   body: { "amount": 5000 }
router.patch("/:id/payments", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "Invalid student id" });
    }

    const { error, amount } = validatePaymentInput(req.body);
    if (error) {
      return res.status(400).json({ error, fields: { amount: error } });
    }

    // One atomic update: it only applies if paid + amount stays within totalFee
    const updated = await Student.findOneAndUpdate(
      { _id: id, $expr: { $lte: [{ $add: ["$paid", amount] }, "$totalFee"] } },
      { $inc: { paid: amount } },
      { new: true },
    );

    if (!updated) {
      // No match: either the student doesn't exist, or the payment is too big
      const exists = await Student.exists({ _id: id });
      if (!exists) return res.status(404).json({ error: "Student not found" });
      const message = "That payment is more than the outstanding balance.";
      return res
        .status(400)
        .json({ error: message, fields: { amount: message } });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/students/:id   body: { name, grade, guardian, totalFee }
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid student id" });

    const { errors, data } = validateStudentUpdate(req.body);
    if (Object.keys(errors).length > 0) {
      return res
        .status(400)
        .json({ error: "Please fix the highlighted fields.", fields: errors });
    }

    // One atomic update: it only applies if the new total fee still covers what was paid
    const updated = await Student.findOneAndUpdate(
      { _id: id, paid: { $lte: data.totalFee } },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!updated) {
      const exists = await Student.exists({ _id: id });
      if (!exists) return res.status(404).json({ error: "Student not found" });
      const message = "Total fee can't be less than the amount already paid.";
      return res
        .status(400)
        .json({ error: message, fields: { totalFee: message } });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: "Invalid student id" });

    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Student not found" });

    // JSON body (not 204), because the client's request helper expects JSON
    res.json({ id });
  } catch (err) {
    next(err);
  }
});

export default router;
