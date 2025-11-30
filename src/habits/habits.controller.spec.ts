import { Test, TestingModule } from '@nestjs/testing';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ListHabitsDto } from './dto/list-habits.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { HabitGoalType } from 'generated/prisma';
import { DateRangeDto } from 'src/common/dto/date-range.dto';

describe('HabitsController', () => {
  let controller: HabitsController;
  let service: HabitsService;

  const mockHabitsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    checkIn: jest.fn(),
    logTime: jest.fn(),
    getHistory: jest.fn(),
    removeCheckIn: jest.fn(),
    removeTimeEntry: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-uuid-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HabitsController],
      providers: [
        {
          provide: HabitsService,
          useValue: mockHabitsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HabitsController>(HabitsController);
    service = module.get<HabitsService>(HabitsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create', async () => {
      const dto: CreateHabitDto = {
        name: 'Teste',
        days_of_week: [1],
        goal_type: HabitGoalType.TIMES_PER_DAY,
        goal_value: 1,
      };

      mockHabitsService.create.mockResolvedValue({ id: '1', ...dto });

      await controller.create(dto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(dto, mockRequest.user.id);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll', async () => {
      const query: ListHabitsDto = { page: 1 };
      mockHabitsService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(mockRequest, query);

      expect(service.findAll).toHaveBeenCalledWith(mockRequest.user.id, query);
    });
  });

  describe('findOne', () => {
    it('deve chamar service.findOne', async () => {
      mockHabitsService.findOne.mockResolvedValue({ id: '1' });
      await controller.findOne('1', mockRequest);
      expect(service.findOne).toHaveBeenCalledWith('1', mockRequest.user.id);
    });
  });

  describe('update', () => {
    it('deve chamar service.update', async () => {
      const dto: UpdateHabitDto = { name: 'Novo Nome' };
      mockHabitsService.update.mockResolvedValue({ id: '1' });

      await controller.update('1', dto, mockRequest);

      expect(service.update).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
        dto,
      );
    });
  });

  describe('remove', () => {
    it('deve chamar service.remove', async () => {
      mockHabitsService.remove.mockResolvedValue({ id: '1' });
      await controller.remove('1', mockRequest);
      expect(service.remove).toHaveBeenCalledWith('1', mockRequest.user.id);
    });
  });

  describe('checkIn', () => {
    it('deve chamar service.checkIn', async () => {
      mockHabitsService.checkIn.mockResolvedValue({ id: 'check-1' });
      await controller.checkIn('habit-1', mockRequest);
      expect(service.checkIn).toHaveBeenCalledWith(
        'habit-1',
        mockRequest.user.id,
      );
    });
  });

  describe('logTime', () => {
    it('deve chamar service.logTime', async () => {
      const dto: LogTimeDto = {
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
      };

      mockHabitsService.logTime.mockResolvedValue({ id: 'time-1' });

      await controller.logTime('habit-1', dto, mockRequest);

      expect(service.logTime).toHaveBeenCalledWith(
        'habit-1',
        mockRequest.user.id,
        dto,
      );
    });
  });

  describe('getHistory', () => {
    it('deve chamar service.getHistory com query params', async () => {
      const habitId = 'habit-1';
      const query: DateRangeDto = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      mockHabitsService.getHistory.mockResolvedValue([]);

      await controller.getHistory(habitId, query, mockRequest);

      expect(service.getHistory).toHaveBeenCalledWith(
        habitId,
        mockRequest.user.id,
        query,
      );
    });
  });

  describe('removeCheckIn', () => {
    it('deve chamar service.removeCheckIn', async () => {
      mockHabitsService.removeCheckIn.mockResolvedValue({ id: '1' });
      await controller.removeCheckIn('1', mockRequest);
      expect(service.removeCheckIn).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
      );
    });
  });

  describe('removeTimeEntry', () => {
    it('deve chamar service.removeTimeEntry', async () => {
      mockHabitsService.removeTimeEntry.mockResolvedValue({ id: '1' });
      await controller.removeTimeEntry('1', mockRequest);
      expect(service.removeTimeEntry).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
      );
    });
  });
});
