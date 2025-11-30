import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Formato de e-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export class SignInDto extends createZodDto(signInSchema) {}