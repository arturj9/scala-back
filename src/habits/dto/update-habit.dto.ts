import { createZodDto } from 'nestjs-zod';
import { createHabitSchema } from './create-habit.dto';

const updateHabitSchema = createHabitSchema.partial();

export class UpdateHabitDto extends createZodDto(updateHabitSchema) {}
