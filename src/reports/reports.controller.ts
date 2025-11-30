import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import { HeatmapDto } from './dto/heatmap.dto';

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard: Totais e Resumo do Período' })
  @ApiResponse({
    status: 200,
    description: 'Retorna contagem de hábitos, check-ins e minutos totais.',
  })
  async getDashboard(@Request() req, @Query() query: DateRangeDto) {
    return this.reportsService.getDashboard(req.user.id, query);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Dados para Calendário (Heatmap)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de datas (ISO) onde houve atividade.',
  })
  async getHeatmap(@Request() req, @Query() query: HeatmapDto) {
    return this.reportsService.getHeatmap(req.user.id, query);
  }
}