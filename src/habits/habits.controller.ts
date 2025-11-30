import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ListHabitsDto } from './dto/list-habits.dto';
import { LogTimeDto } from './dto/log-time.dto';
import { DateRangeDto } from 'src/common/dto/date-range.dto';
import type { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

@ApiTags('Hábitos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo hábito' })
  @ApiResponse({ status: 201, description: 'Hábito criado com sucesso.' })
  async create(
    @Body() dto: CreateHabitDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar hábitos (com filtros e paginação)' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: ListHabitsDto,
  ) {
    return this.habitsService.findAll(req.user.id, query);
  }

  @Get('history')
  @ApiOperation({ summary: 'Histórico geral unificado (Check-ins + Tempo)' })
  @ApiResponse({
    status: 200,
    description: 'Lista cronológica de todas as atividades no período.',
  })
  async getGeneralHistory(
    @Query() query: DateRangeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.getGeneralHistory(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um hábito específico' })
  async findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um hábito' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um hábito e todo seu histórico' })
  @ApiResponse({ status: 200, description: 'Hábito deletado.' })
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.remove(id, req.user.id);
  }

  @Post(':id/check')
  @ApiOperation({ summary: 'Dar Check-in (para hábitos de contagem)' })
  async checkIn(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.habitsService.checkIn(id, req.user.id);
  }

  @Post(':id/time')
  @ApiOperation({ summary: 'Registrar Tempo (para hábitos de duração)' })
  async logTime(
    @Param('id') id: string,
    @Body() dto: LogTimeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.logTime(id, req.user.id, dto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico específico deste hábito' })
  async getHistory(
    @Param('id') id: string,
    @Query() query: DateRangeDto,
    @Request() req,
  ) {
    return this.habitsService.getHistory(id, req.user.id, query);
  }

  @Delete('check/:id')
  @ApiOperation({ summary: 'Desfazer um Check-in específico' })
  async removeCheckIn(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.removeCheckIn(id, req.user.id);
  }

  @Delete('time/:id')
  @ApiOperation({ summary: 'Excluir um registro de tempo específico' })
  async removeTimeEntry(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.habitsService.removeTimeEntry(id, req.user.id);
  }
}
