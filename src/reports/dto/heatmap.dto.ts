import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DateRangeDto } from 'src/common/dto/date-range.dto';

const heatmapSchema = z
  .object({
    habitId: z.string().uuid().optional(),
  })
  .merge(DateRangeDto.schema);

export class HeatmapDto extends createZodDto(heatmapSchema) {}
