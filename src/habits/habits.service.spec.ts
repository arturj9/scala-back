import { Test, TestingModule } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { HabitGoalType } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LogTimeDto } from './dto/log-time.dto';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

describe('HabitsService', () => {
  let service: HabitsService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
  });

  // --- 1. TESTES DE CRUD (Adicionados) ---

  describe('create', () => {
    it('deve criar um hábito corretamente com lembretes', async () => {
      // Atualize o nome
      const userId = 'user-uuid-123';
      const dto: CreateHabitDto = {
        name: 'Ler Livro',
        days_of_week: [1, 3, 5],
        goal_type: HabitGoalType.MINUTES_PER_DAY,
        goal_value: 30,
        // Adicione no teste
        reminder_times: ['08:00', '20:00'],
      };

      prismaMock.habit.create.mockResolvedValue({
        id: 'habit-uuid-999',
        user_id: userId,
        ...dto,
        created_at: new Date(),
        // O mock deve retornar o campo também
        reminder_times: dto.reminder_times,
      } as any);

      const result = await service.create(dto, userId);

      expect(result.id).toBe('habit-uuid-999');
      // Verifique se salvou
      expect(result.reminder_times).toEqual(['08:00', '20:00']);

      expect(prismaMock.habit.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          days_of_week: dto.days_of_week,
          goal_type: dto.goal_type,
          goal_value: dto.goal_value,
          reminder_times: dto.reminder_times, // Verifica a chamada
          user_id: userId,
        },
      });
    });

    it('deve criar um hábito corretamente', async () => {
      const userId = 'user-uuid-123';
      const dto: CreateHabitDto = {
        name: 'Ler Livro',
        days_of_week: [1, 3, 5],
        goal_type: HabitGoalType.MINUTES_PER_DAY,
        goal_value: 30,
      };

      prismaMock.habit.create.mockResolvedValue({
        id: 'habit-uuid-999',
        user_id: userId,
        ...dto,
        created_at: new Date(),
      } as any);

      const result = await service.create(dto, userId);

      expect(result.id).toBe('habit-uuid-999');
      expect(prismaMock.habit.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          days_of_week: dto.days_of_week,
          goal_type: dto.goal_type,
          goal_value: dto.goal_value,
          user_id: userId,
          reminder_times: [],
        },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um hábito se ele pertencer ao usuário', async () => {
      const userId = 'user-1';
      const habitId = 'habit-1';
      const mockHabit = { id: habitId, user_id: userId, name: 'Teste' };

      prismaMock.habit.findUnique.mockResolvedValue(mockHabit as any);

      const result = await service.findOne(habitId, userId);
      expect(result).toEqual(mockHabit);
    });

    it('deve lançar NotFoundException se o hábito não existir ou for de outro usuário', async () => {
      const userId = 'user-1';
      prismaMock.habit.findUnique.mockResolvedValue(null); // Não achou

      await expect(service.findOne('habit-x', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um hábito', async () => {
      const userId = 'user-1';
      const habitId = 'habit-1';
      const dto: UpdateHabitDto = { name: 'Novo Nome' };

      // Mock do findOne (para passar na validação de dono)
      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
      } as any);

      // Mock do update
      prismaMock.habit.update.mockResolvedValue({
        id: habitId,
        name: 'Novo Nome',
      } as any);

      await service.update(habitId, userId, dto);

      expect(prismaMock.habit.update).toHaveBeenCalledWith({
        where: { id: habitId },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('deve remover um hábito', async () => {
      const userId = 'user-1';
      const habitId = 'habit-1';

      // Mock do findOne (validação)
      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
      } as any);
      // Mock do delete
      prismaMock.habit.delete.mockResolvedValue({ id: habitId } as any);

      await service.remove(habitId, userId);

      expect(prismaMock.habit.delete).toHaveBeenCalledWith({
        where: { id: habitId },
      });
    });
  });

  // --- 2. SEUS TESTES JÁ EXISTENTES (Mantidos) ---

  describe('findAll', () => {
    it('deve retornar dados paginados', async () => {
      const userId = 'user-1';
      const mockData = [{ id: '1', name: 'Teste' }];
      const mockTotal = 1;

      prismaMock.$transaction.mockResolvedValue([mockTotal, mockData]);

      const result = await service.findAll(userId, { page: 1, perPage: 10 });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(prismaMock.habit.findMany).toHaveBeenCalled();
    });
  });

  describe('checkIn', () => {
    it('deve realizar check-in com sucesso (hábito de contagem)', async () => {
      const habitId = 'habit-1';
      const userId = 'user-1';

      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.TIMES_PER_DAY,
      } as any);

      prismaMock.habitCheckIn.create.mockResolvedValue({
        id: 'check-1',
      } as any);

      await service.checkIn(habitId, userId);

      expect(prismaMock.habitCheckIn.create).toHaveBeenCalledWith({
        data: { habit_id: habitId },
      });
    });

    it('deve falhar se tentar check-in em hábito de tempo', async () => {
      const habitId = 'habit-time';
      const userId = 'user-1';

      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.MINUTES_PER_DAY,
      } as any);

      await expect(service.checkIn(habitId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logTime', () => {
    it('deve registrar tempo com sucesso (hábito de tempo)', async () => {
      const habitId = 'habit-time';
      const userId = 'user-1';
      const dto: LogTimeDto = {
        start_time: '2025-10-25T10:00:00Z',
        end_time: '2025-10-25T10:30:00Z',
      };

      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.MINUTES_PER_DAY,
      } as any);

      prismaMock.habitTimeEntry.create.mockResolvedValue({
        id: 'entry-1',
      } as any);

      await service.logTime(habitId, userId, dto);

      expect(prismaMock.habitTimeEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration_minutes: 30,
          }),
        }),
      );
    });

    it('deve falhar se duração for menor que 1 minuto', async () => {
      const habitId = 'habit-time';
      const userId = 'user-1';
      const dto: LogTimeDto = {
        start_time: '2025-10-25T10:00:00Z',
        end_time: '2025-10-25T10:00:10Z',
      };

      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.MINUTES_PER_DAY,
      } as any);

      await expect(service.logTime(habitId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getHistory', () => {
    it('deve retornar check-ins se o hábito for do tipo TIMES_PER_DAY', async () => {
      const habitId = 'habit-1';
      const userId = 'user-1';
      const query: DateRangeDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      // 1. Mock do hábito (para o findOne interno)
      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.TIMES_PER_DAY,
      } as any);

      // 2. Mock da busca de check-ins
      const mockCheckIns = [{ id: 'c1' }, { id: 'c2' }];
      prismaMock.habitCheckIn.findMany.mockResolvedValue(mockCheckIns as any);

      // ACT
      const result = await service.getHistory(habitId, userId, query);

      // ASSERT
      expect(result).toEqual(mockCheckIns);
      // Verifica se buscou na tabela certa (CheckIn) e usou as datas
      expect(prismaMock.habitCheckIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            habit_id: habitId,
            checkin_timestamp: expect.anything(), // Validamos que houve filtro de data
          }),
        }),
      );
    });

    it('deve retornar time-entries se o hábito for do tipo MINUTES_PER_DAY', async () => {
      const habitId = 'habit-2';
      const userId = 'user-1';
      const query: DateRangeDto = {}; // Sem datas (deve usar padrão)

      // 1. Mock do hábito
      prismaMock.habit.findUnique.mockResolvedValue({
        id: habitId,
        user_id: userId,
        goal_type: HabitGoalType.MINUTES_PER_DAY,
      } as any);

      // 2. Mock da busca de tempo
      const mockEntries = [{ id: 't1', duration_minutes: 30 }];
      prismaMock.habitTimeEntry.findMany.mockResolvedValue(mockEntries as any);

      // ACT
      const result = await service.getHistory(habitId, userId, query);

      // ASSERT
      expect(result).toEqual(mockEntries);
      // Verifica se buscou na tabela certa (TimeEntry)
      expect(prismaMock.habitTimeEntry.findMany).toHaveBeenCalled();
    });
  });

  describe('removeCheckIn', () => {
    it('deve remover um check-in se pertencer ao usuário', async () => {
      const checkInId = 'check-1';
      const userId = 'user-1';

      // 1. Mock do findUnique (sucesso)
      prismaMock.habitCheckIn.findUnique.mockResolvedValue({
        id: checkInId,
        habit: { user_id: userId }, // Hábito pertence ao usuário
      } as any);

      // 2. Mock do delete
      prismaMock.habitCheckIn.delete.mockResolvedValue({
        id: checkInId,
      } as any);

      await service.removeCheckIn(checkInId, userId);

      expect(prismaMock.habitCheckIn.delete).toHaveBeenCalledWith({
        where: { id: checkInId },
      });
    });

    it('deve lançar erro se o check-in for de outro usuário', async () => {
      const checkInId = 'check-1';
      const userId = 'user-1';

      // Mock: Hábito pertence a OUTRO usuário
      prismaMock.habitCheckIn.findUnique.mockResolvedValue({
        id: checkInId,
        habit: { user_id: 'user-impostor' },
      } as any);

      await expect(service.removeCheckIn(checkInId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeTimeEntry', () => {
    it('deve remover um time-entry se pertencer ao usuário', async () => {
      const entryId = 'entry-1';
      const userId = 'user-1';

      prismaMock.habitTimeEntry.findUnique.mockResolvedValue({
        id: entryId,
        habit: { user_id: userId },
      } as any);

      prismaMock.habitTimeEntry.delete.mockResolvedValue({
        id: entryId,
      } as any);

      await service.removeTimeEntry(entryId, userId);

      expect(prismaMock.habitTimeEntry.delete).toHaveBeenCalledWith({
        where: { id: entryId },
      });
    });
  });

  describe('getGeneralHistory', () => {
    it('deve retornar lista combinada e ordenada de check-ins e time-entries', async () => {
      const userId = 'user-1';
      const query = { startDate: '2025-01-01', endDate: '2025-01-02' };

      // Datas para teste (Check-in mais recente que o TimeEntry)
      const dateRecent = new Date('2025-01-02T10:00:00Z');
      const dateOld = new Date('2025-01-01T10:00:00Z');

      // Mock Check-ins
      prismaMock.habitCheckIn.findMany.mockResolvedValue([
        { 
          id: 'c1', 
          checkin_timestamp: dateRecent, 
          habit: { id: 'h1', name: 'Beber Água' } 
        }
      ] as any);

      // Mock Time Entries
      prismaMock.habitTimeEntry.findMany.mockResolvedValue([
        { 
          id: 't1', 
          start_time: dateOld, 
          duration_minutes: 30, 
          habit: { id: 'h2', name: 'Estudar' } 
        }
      ] as any);

      // ACT
      const result = await service.getGeneralHistory(userId, query);

      // ASSERT
      expect(result).toHaveLength(2);
      
      // Verifica ordenação (mais recente primeiro)
      expect(result[0].id).toBe('c1'); // Check-in (dia 02)
      expect(result[0].type).toBe('check-in');
      
      expect(result[1].id).toBe('t1'); // Time-entry (dia 01)
      expect(result[1].type).toBe('time-entry');
      expect(result[1].value).toBe(30);

      // Verifica se os filtros de usuário foram aplicados
      expect(prismaMock.habitCheckIn.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ habit: { user_id: userId } }) })
      );
    });
  });
});
