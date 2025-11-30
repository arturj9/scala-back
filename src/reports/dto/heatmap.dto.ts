import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
// Importe o schema do DateRangeDto para reutilizar as regras de data
import { DateRangeDto } from 'src/common/dto/date-range.dto';

// O z.object().merge() combina dois schemas
const heatmapSchema = z.object({
  habitId: z.string().uuid().optional(), // Filtro opcional
}).merge(DateRangeDto.schema); // Herda startDate e endDate

export class HeatmapDto extends createZodDto(heatmapSchema) {}