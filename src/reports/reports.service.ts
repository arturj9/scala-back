import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfWeek, endOfWeek, subDays, startOfYear, endOfYear } from 'date-fns';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { HeatmapDto } from './dto/heatmap.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string, query: DateRangeDto) {
    const now = new Date();
    const start = query.startDate
      ? new Date(query.startDate)
      : startOfWeek(now);

    let end = query.endDate ? new Date(query.endDate) : endOfWeek(now);
    end.setHours(23, 59, 59, 999);

    const totalHabits = await this.prisma.habit.count({
      where: { user_id: userId },
    });

    const checkInsCount = await this.prisma.habitCheckIn.count({
      where: {
        habit: { user_id: userId },
        checkin_timestamp: {
          gte: start,
          lte: end,
        },
      },
    });

    const timeEntries = await this.prisma.habitTimeEntry.findMany({
      where: {
        habit: { user_id: userId },
        start_time: {
          gte: start,
          lte: end,
        },
      },
      select: { duration_minutes: true },
    });

    const totalMinutes = timeEntries.reduce(
      (acc, curr) => acc + curr.duration_minutes,
      0,
    );

    return {
      period: { start, end },
      overview: {
        totalHabits,
        checkIns: checkInsCount,
        minutes: totalMinutes,
      },
    };
  }

async getHeatmap(userId: string, query: HeatmapDto) {
    // 1. Define o range de datas (Padrão: Ano atual se não enviado)
    const now = new Date();
    const start = query.startDate ? new Date(query.startDate) : startOfYear(now);
    const end = query.endDate ? new Date(query.endDate) : endOfYear(now);
    end.setHours(23, 59, 59, 999);

    // 2. Filtro comum (Usuário + Range + Hábito Opcional)
    const whereBase = {
      habit: { user_id: userId }, // Sempre do usuário logado
      ...(query.habitId && { habit_id: query.habitId }), // Se tiver ID, filtra
    };

    // 3. Executa as duas consultas em paralelo
    const [checkIns, timeEntries] = await Promise.all([
      // Busca check-ins
      this.prisma.habitCheckIn.findMany({
        where: {
          ...whereBase,
          checkin_timestamp: { gte: start, lte: end },
        },
        select: { checkin_timestamp: true },
      }),
      // Busca entradas de tempo
      this.prisma.habitTimeEntry.findMany({
        where: {
          ...whereBase,
          start_time: { gte: start, lte: end },
        },
        select: { start_time: true },
      }),
    ]);

    // 4. Unifica as datas em uma lista única
    const dates = [
      ...checkIns.map((c) => c.checkin_timestamp),
      ...timeEntries.map((t) => t.start_time),
    ];

    // 5. Ordena cronologicamente
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }
}
