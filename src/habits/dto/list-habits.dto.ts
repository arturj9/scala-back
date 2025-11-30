import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { HabitGoalType } from '@prisma/client';

const listHabitsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),

  search: z.string().optional(),
  goal_type: z.nativeEnum(HabitGoalType).optional(),

  order: z.enum(['asc', 'desc']).optional(),
});

export class ListHabitsDto extends createZodDto(listHabitsSchema) {}
