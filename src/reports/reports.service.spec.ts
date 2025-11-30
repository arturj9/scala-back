import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { HeatmapDto } from './dto/heatmap.dto';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('getDashboard', () => {
    it('deve retornar os totais agregados corretamente', async () => {
      const userId = 'user-1';
      const query: DateRangeDto = {}; 

      // Mocks
      prismaMock.habit.count.mockResolvedValue(5);
      prismaMock.habitCheckIn.count.mockResolvedValue(12);
      prismaMock.habitTimeEntry.findMany.mockResolvedValue([
        { duration_minutes: 30 },
        { duration_minutes: 45 },
        { duration_minutes: 15 },
      ] as any);

      // ACT
      const result = await service.getDashboard(userId, query);

      // ASSERT
      expect(result.overview).toEqual({
        totalHabits: 5,
        checkIns: 12,
        minutes: 90,
      });
      expect(result).toHaveProperty('period');
    });
  });

  // --- TESTES ATUALIZADOS PARA O NOVO getHeatmap ---
  describe('getHeatmap', () => {
    it('deve retornar datas de CheckIns E TimeEntries combinadas e ordenadas', async () => {
      const userId = 'user-1';
      const query: HeatmapDto = { startDate: '2025-01-01', endDate: '2025-01-31' };
      
      const date1 = new Date('2025-01-01T10:00:00Z'); // Mais antigo
      const date2 = new Date('2025-01-02T14:00:00Z'); // Mais recente

      // Mock do CheckIn (retorna dia 1)
      prismaMock.habitCheckIn.findMany.mockResolvedValue([{ checkin_timestamp: date1 }] as any);
      
      // Mock do TimeEntry (retorna dia 2)
      prismaMock.habitTimeEntry.findMany.mockResolvedValue([{ start_time: date2 }] as any);

      // ACT
      // Agora passamos o userId e o DTO
      const result = await service.getHeatmap(userId, query);

      // ASSERT
      expect(result).toHaveLength(2);
      expect(result).toEqual([date1, date2]); // Verifica se uniu as duas listas

      // Verifica se chamou ambos os findMany com os filtros básicos de usuário
      expect(prismaMock.habitCheckIn.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ habit: { user_id: userId } })
      }));
      expect(prismaMock.habitTimeEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ habit: { user_id: userId } })
      }));
    });

    it('deve filtrar por habitId se fornecido no DTO', async () => {
      const userId = 'user-1';
      const query: HeatmapDto = { habitId: 'habit-especifico' };

      prismaMock.habitCheckIn.findMany.mockResolvedValue([]);
      prismaMock.habitTimeEntry.findMany.mockResolvedValue([]);

      await service.getHeatmap(userId, query);

      // Verifica se o filtro habit_id foi passado para o Prisma
      expect(prismaMock.habitCheckIn.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ habit_id: 'habit-especifico' })
      }));
      expect(prismaMock.habitTimeEntry.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ habit_id: 'habit-especifico' })
      }));
    });
  });
});