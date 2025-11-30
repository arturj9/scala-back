import { PrismaClient, HabitGoalType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Limpar banco (opcional, cuidado em produção!)
  await prisma.habitCheckIn.deleteMany();
  await prisma.habitTimeEntry.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar Usuário de Teste
  const passwordHash = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Usuário Scala',
      email: 'teste@scala.com',
      password: passwordHash,
    },
  });

  console.log(`👤 Usuário criado: ${user.email} (Senha: 123456)`);

  // 3. Criar Hábitos
  const habitWater = await prisma.habit.create({
    data: {
      user_id: user.id,
      name: 'Beber 2L de Água',
      goal_type: HabitGoalType.TIMES_PER_DAY,
      goal_value: 4, // 4 garrafinhas de 500ml
      days_of_week: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
      reminder_times: ['09:00', '14:00', '18:00'],
    },
  });

  const habitRead = await prisma.habit.create({
    data: {
      user_id: user.id,
      name: 'Ler Livro Técnico',
      goal_type: HabitGoalType.MINUTES_PER_DAY,
      goal_value: 30, // 30 minutos
      days_of_week: [1, 2, 3, 4, 5], // Seg a Sex
      reminder_times: ['20:00'],
    },
  });

  const habitGym = await prisma.habit.create({
    data: {
      user_id: user.id,
      name: 'Ir para a Academia',
      goal_type: HabitGoalType.TIMES_PER_DAY,
      goal_value: 1,
      days_of_week: [1, 3, 5], // Seg, Qua, Sex
    },
  });

  console.log('📝 Hábitos criados.');

  // 4. Gerar Histórico (Últimos 30 dias)
  const today = new Date();
  
  console.log('⏳ Gerando histórico...');

  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay(); // 0-6

    // --- Hábito: Água (Todos os dias) ---
    // Simula 80% de chance de beber algo
    if (Math.random() > 0.2) {
      // Bebeu entre 1 e 5 vezes no dia
      const times = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < times; j++) {
        // Espalha os check-ins durante o dia
        const checkInTime = new Date(date);
        checkInTime.setHours(8 + j * 3, 0, 0); // 8h, 11h, 14h...
        
        await prisma.habitCheckIn.create({
          data: {
            habit_id: habitWater.id,
            checkin_timestamp: checkInTime,
          },
        });
      }
    }

    // --- Hábito: Ler (Seg-Sex) ---
    if (habitRead.days_of_week.includes(dayOfWeek)) {
      // 70% de chance de ler
      if (Math.random() > 0.3) {
        const duration = Math.floor(Math.random() * 45) + 15; // 15 a 60 min
        const start = new Date(date);
        start.setHours(21, 0, 0);
        const end = new Date(start);
        end.setMinutes(duration);

        await prisma.habitTimeEntry.create({
          data: {
            habit_id: habitRead.id,
            start_time: start,
            end_time: end,
            duration_minutes: duration,
          },
        });
      }
    }

    // --- Hábito: Academia (Seg, Qua, Sex) ---
    if (habitGym.days_of_week.includes(dayOfWeek)) {
      // 60% de chance de ir
      if (Math.random() > 0.4) {
        const checkInTime = new Date(date);
        checkInTime.setHours(18, 30, 0);

        await prisma.habitCheckIn.create({
          data: {
            habit_id: habitGym.id,
            checkin_timestamp: checkInTime,
          },
        });
      }
    }
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });