import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const positiveNumber = z.coerce.number().finite().positive();
const nonNegativeNumber = z.coerce.number().finite().min(0);
const optionalNonNegativeNumber = z.coerce.number().finite().min(0).optional();

export const createFuelEntrySchema = z.object({
  date: isoDateSchema,
  odometer: positiveNumber,
  liters: positiveNumber,
  total_cost: nonNegativeNumber,
  station: z.string().max(200).optional(),
  is_full_tank: z.boolean(),
  notes: z.string().max(2000).optional(),
  receipt_file_id: z.string().max(200).optional(),
  receipt_url: z.string().max(2000).optional(),
});

export const updateFuelEntrySchema = createFuelEntrySchema.partial().extend({
  id: z.string().min(1),
  receipt_file_id: z.string().max(200).optional(),
  receipt_url: z.string().max(2000).optional(),
});

export const fullUpdateFuelEntrySchema = createFuelEntrySchema.extend({
  id: z.string().min(1),
});

export const createServiceEntrySchema = z.object({
  date: isoDateSchema,
  odometer: positiveNumber,
  total_cost: nonNegativeNumber,
  service_type: z.string().trim().min(1).max(200),
  location: z.string().max(200).optional(),
  next_service_odometer: optionalNonNegativeNumber,
  notes: z.string().max(2000).optional(),
});

export const updateServiceEntrySchema = createServiceEntrySchema.extend({
  id: z.string().min(1),
});

export const createExpenseEntrySchema = z.object({
  date: isoDateSchema,
  category: z.string().trim().min(1).max(200),
  total_cost: nonNegativeNumber,
  odometer: optionalNonNegativeNumber,
  vendor: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateExpenseEntrySchema = createExpenseEntrySchema.extend({
  id: z.string().min(1),
});

export const updateVehicleProfileSchema = z.object({
  make: z.string().trim().min(1).max(100),
  model: z.string().trim().min(1).max(100),
  trim: z.string().max(100).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  license_plate: z.string().max(20).optional(),
  fuel_type: z.string().max(100).optional(),
  transmission: z.string().max(100).optional(),
  engine: z.string().max(200).optional(),
  color: z.string().max(100).optional(),
});

export function formatZodError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join("; ");
}

export function validateOdometerMonotonicity(
  existingOdometers: number[],
  newOdometer: number,
  excludeId?: string,
  existingEntries?: Array<{ id: string; odometer: number }>,
) {
  const relevant =
    existingEntries && excludeId
      ? existingEntries.filter((entry) => entry.id !== excludeId)
      : existingEntries ?? existingOdometers.map((odometer, index) => ({
          id: String(index),
          odometer,
        }));

  const maxOdometer = Math.max(0, ...relevant.map((entry) => entry.odometer));

  if (newOdometer < maxOdometer) {
    return `Odometer (${newOdometer} km) cannot be lower than the highest recorded reading (${maxOdometer} km).`;
  }

  return null;
}
