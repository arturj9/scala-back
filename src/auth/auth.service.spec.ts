import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMockProxy<PrismaService>;
  let jwtMock: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaService>();
    
    jwtMock = mockDeep<JwtService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('deve cadastrar um usuário com sucesso', async () => {
      const dto = { name: 'Teste', email: 'teste@email.com', password: '123' };
      
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      prismaMock.user.create.mockResolvedValue({
        id: 'uuid-123',
        ...dto,
        password: 'hashed_password', 
        created_at: new Date(),
      } as any);

      const result = await service.signUp(dto);

      expect(result).toHaveProperty('id');
      expect(result.email).toBe(dto.email);
      expect(prismaMock.user.create).toHaveBeenCalled();
    });

    it('deve lançar erro se o e-mail já existe', async () => {
      const dto = { name: 'Teste', email: 'existente@email.com', password: '123' };
      
      prismaMock.user.findUnique.mockResolvedValue({ id: '1' } as any);

      await expect(service.signUp(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signIn', () => {
    it('deve retornar um token de acesso no login', async () => {
      const dto = { email: 'teste@email.com', password: '123' };
      const hashedPassword = await bcrypt.hash('123', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'uuid-123',
        email: dto.email,
        password: hashedPassword,
      } as any);

      jwtMock.signAsync.mockResolvedValue('fake_token_jwt');

      const result = await service.signIn(dto);

      expect(result).toEqual({ accessToken: 'fake_token_jwt' });
    });

    it('deve falhar com senha incorreta', async () => {
      const dto = { email: 'teste@email.com', password: 'wrong_password' };
      const hashedPassword = await bcrypt.hash('real_password', 10);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'uuid-123',
        email: dto.email,
        password: hashedPassword,
      } as any);

      await expect(service.signIn(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});