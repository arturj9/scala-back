import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SignUpDto } from './dto/signup.dto.';
import { SignInDto } from './dto/signin.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    me: jest.fn(),
  };

  const mockGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('deve chamar authService.signUp com os dados corretos', async () => {
      const dto: SignUpDto = {
        name: 'Teste',
        email: 't@t.com',
        password: '123',
      };
      const result = { id: '1', ...dto };

      mockAuthService.signUp.mockResolvedValue(result);

      expect(await controller.signUp(dto)).toEqual(result);
      expect(authService.signUp).toHaveBeenCalledWith(dto);
    });
  });

  describe('signIn', () => {
    it('deve chamar authService.signIn com as credenciais', async () => {
      const dto: SignInDto = { email: 't@t.com', password: '123' };
      const result = { accessToken: 'token' };

      mockAuthService.signIn.mockResolvedValue(result);

      expect(await controller.signIn(dto)).toEqual(result);
      expect(authService.signIn).toHaveBeenCalledWith(dto);
    });
  });

  describe('me', () => {
    it('deve retornar o perfil do usuário chamando o serviço', async () => {
      const req = { user: { id: 'user-1' } };
      const userProfile = { id: 'user-1', name: 'Teste', email: 't@t.com' };

      mockAuthService.me.mockResolvedValue(userProfile);

      const result = await controller.me(req);

      expect(result).toEqual(userProfile);
      expect(authService.me).toHaveBeenCalledWith('user-1');
    });
  });
});
