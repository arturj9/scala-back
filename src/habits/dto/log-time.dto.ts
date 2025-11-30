import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const logTimeSchema = z
  .object({
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
  })
  .refine(
    (data) => {
      return new Date(data.end_time) > new Date(data.start_time);
    },
    {
      message: 'O horário de término deve ser posterior ao de início.',
      path: ['end_time'],
    },
  );

export class LogTimeDto extends createZodDto(logTimeSchema) {}
