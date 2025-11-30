import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HabitsModule } from './habits/habits.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, HabitsModule, ReportsModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
