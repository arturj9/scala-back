import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().date().optional(), 
  endDate: z.string().date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "A data final deve ser igual ou posterior à data inicial.",
  path: ['endDate'],
});

export class DateRangeDto extends createZodDto(dateRangeSchema) {}