import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jwtConstants } from './constants';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve ser definido', () => {
    expect(guard).toBeDefined();
  });

  it('deve lançar UnauthorizedException se não houver token', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException se o token for inválido', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalid_token' },
        }),
      }),
    } as any;

    mockJwtService.verifyAsync.mockRejectedValue(new Error());

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve retornar true e anexar o usuário ao request se o token for válido', async () => {
    const mockPayload = { sub: 'user-123', email: 'teste@teste.com' };
    const request = { headers: { authorization: 'Bearer valid_token' } };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;

    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid_token', {
      secret: jwtConstants.secret,
    });
    expect(request['user']).toEqual(mockPayload);
  });
});
