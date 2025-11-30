import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ListHabitsDto } from './dto/list-habits.dto';
import { HabitGoalType, Prisma } from '@prisma/client';
import { LogTimeDto } from './dto/log-time.dto';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { endOfMonth, startOfMonth } from 'date-fns';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHabitDto, userId: string) {
    const habit = await this.prisma.habit.create({
      data: {
        name: dto.name,
        days_of_week: dto.days_of_week,
        goal_type: dto.goal_type,
        goal_value: dto.goal_value,
        reminder_times: dto.reminder_times || [],
        user_id: userId,
      },
    });
    return habit;
  }

  async findAll(userId: string, query: ListHabitsDto) {
    const { page = 1, perPage = 10, search, goal_type, order = 'desc' } = query;

    const where: Prisma.HabitWhereInput = {
      user_id: userId,
      name: search ? { contains: search, mode: 'insensitive' } : undefined,
      goal_type: goal_type ? goal_type : undefined,
    };

    const [total, habits] = await this.prisma.$transaction([
      this.prisma.habit.count({ where }),
      this.prisma.habit.findMany({
        where,
        take: perPage,
        skip: (page - 1) * perPage,
        orderBy: { created_at: order },
      }),
    ]);

    return {
      data: habits,
      meta: {
        total,
        page,
        perPage,
        lastPage: Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
    });

    if (!habit || habit.user_id !== userId) {
      throw new NotFoundException('Hábito não encontrado.');
    }

    return habit;
  }

  async update(id: string, userId: string, dto: UpdateHabitDto) {
    await this.findOne(id, userId);

    return this.prisma.habit.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.habit.delete({
      where: { id },
    });
  }

  async checkIn(habitId: string, userId: string) {
    const habit = await this.findOne(habitId, userId);
    if (habit.goal_type !== HabitGoalType.TIMES_PER_DAY) {
      throw new BadRequestException(
        'Este hábito não é do tipo contagem (vezes por dia).',
      );
    }

    return this.prisma.habitCheckIn.create({
      data: {
        habit_id: habitId,
      },
    });
  }

  async logTime(habitId: string, userId: string, dto: LogTimeDto) {
    const habit = await this.findOne(habitId, userId);

    if (habit.goal_type !== HabitGoalType.MINUTES_PER_DAY) {
      throw new BadRequestException(
        'Este hábito não é do tipo tempo (minutos por dia).',
      );
    }

    const start = new Date(dto.start_time);
    const end = new Date(dto.end_time);

    const durationMinutes = Math.round(
      (end.getTime() - start.getTime()) / 1000 / 60,
    );

    if (durationMinutes < 1) {
      throw new BadRequestException('A sessão deve ter pelo menos 1 minuto.');
    }

    return this.prisma.habitTimeEntry.create({
      data: {
        habit_id: habitId,
        start_time: start,
        end_time: end,
        duration_minutes: durationMinutes,
      },
    });
  }

  async getHistory(habitId: string, userId: string, query: DateRangeDto) {
    const habit = await this.findOne(habitId, userId);

    const start = query.startDate
      ? new Date(query.startDate)
      : startOfMonth(new Date());
    const end = query.endDate
      ? new Date(query.endDate)
      : endOfMonth(new Date());

    end.setHours(23, 59, 59, 999);

    if (habit.goal_type === HabitGoalType.TIMES_PER_DAY) {
      return this.prisma.habitCheckIn.findMany({
        where: {
          habit_id: habitId,
          checkin_timestamp: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { checkin_timestamp: 'desc' },
      });
    } else {
      return this.prisma.habitTimeEntry.findMany({
        where: {
          habit_id: habitId,
          start_time: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { start_time: 'desc' },
      });
    }
  }

  async removeCheckIn(checkInId: string, userId: string) {
    const record = await this.prisma.habitCheckIn.findUnique({
      where: { id: checkInId },
      include: { habit: true },
    });

    if (!record || record.habit.user_id !== userId) {
      throw new NotFoundException(
        'Registro de check-in não encontrado ou permissão negada.',
      );
    }

    return this.prisma.habitCheckIn.delete({
      where: { id: checkInId },
    });
  }

  async removeTimeEntry(timeEntryId: string, userId: string) {
    const record = await this.prisma.habitTimeEntry.findUnique({
      where: { id: timeEntryId },
      include: { habit: true },
    });

    if (!record || record.habit.user_id !== userId) {
      throw new NotFoundException(
        'Registro de tempo não encontrado ou permissão negada.',
      );
    }

    return this.prisma.habitTimeEntry.delete({
      where: { id: timeEntryId },
    });
  }

  async getGeneralHistory(userId: string, query: DateRangeDto) {
    const start = query.startDate
      ? new Date(query.startDate)
      : startOfMonth(new Date());
    const end = query.endDate
      ? new Date(query.endDate)
      : endOfMonth(new Date());
    end.setHours(23, 59, 59, 999);

    const checkIns = await this.prisma.habitCheckIn.findMany({
      where: {
        habit: { user_id: userId },
        checkin_timestamp: {
          gte: start,
          lte: end,
        },
      },
      include: { habit: { select: { id: true, name: true, goal_type: true } } },
      orderBy: { checkin_timestamp: 'desc' },
    });

    const timeEntries = await this.prisma.habitTimeEntry.findMany({
      where: {
        habit: { user_id: userId },
        start_time: {
          gte: start,
          lte: end,
        },
      },
      include: { habit: { select: { id: true, name: true, goal_type: true } } },
      orderBy: { start_time: 'desc' },
    });

    const history = [
      ...checkIns.map((c) => ({
        id: c.id,
        type: 'check-in',
        date: c.checkin_timestamp,
        habit: c.habit,
        value: 1,
      })),
      ...timeEntries.map((t) => ({
        id: t.id,
        type: 'time-entry',
        date: t.start_time,
        habit: t.habit,
        value: t.duration_minutes,
      })),
    ];

    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
