import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { HabitGoalType } from '@prisma/client';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createHabitSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),

  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, 'Selecione pelo menos um dia da semana.'),

  goal_type: z.nativeEnum(HabitGoalType),

  goal_value: z.number().int().positive('O valor da meta deve ser positivo.'),

  reminder_times: z
    .array(z.string().regex(timeRegex, 'Horário inválido. Use o formato HH:mm.'))
    .optional(),
});

export class CreateHabitDto extends createZodDto(createHabitSchema) {}
