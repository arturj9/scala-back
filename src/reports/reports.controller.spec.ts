import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { HeatmapDto } from './dto/heatmap.dto'; // Importe o DTO correto

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReportsService = {
    getDashboard: jest.fn(),
    getHeatmap: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user-uuid-123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('deve chamar service.getDashboard com o userId e query params', async () => {
      const query: DateRangeDto = { startDate: '2025-01-01' };
      const expectedResult = { overview: {}, period: {} };
      
      mockReportsService.getDashboard.mockResolvedValue(expectedResult);

      await controller.getDashboard(mockRequest, query);

      expect(service.getDashboard).toHaveBeenCalledWith(mockRequest.user.id, query);
    });
  });

  describe('getHeatmap', () => {
    it('deve chamar service.getHeatmap com userId e query params', async () => {
      // ARRANGE
      const query: HeatmapDto = { 
        startDate: '2025-01-01', 
        habitId: 'habit-1' 
      };
      const expectedResult = [new Date()];

      mockReportsService.getHeatmap.mockResolvedValue(expectedResult);

      // ACT
      // --- A CORREÇÃO ESTÁ AQUI ---
      // Passamos (mockRequest, query) para respeitar a ordem do Controller
      const result = await controller.getHeatmap(mockRequest, query);

      // ASSERT
      expect(result).toEqual(expectedResult);
      expect(service.getHeatmap).toHaveBeenCalledWith(mockRequest.user.id, query);
    });
  });
});