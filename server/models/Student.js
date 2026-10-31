import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    grade: { type: String, trim: true, maxlength: 60, default: "—" },
    guardian: { type: String, trim: true, maxlength: 60, default: "—" },
    totalFee: { type: Number, required: true, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// MongoDB uses _id and __v. The React app expects "id", so convert when sending JSON.
studentSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Student", studentSchema);
