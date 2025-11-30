import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto.';
import type { AuthenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (ex: senha curta, email inválido).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito: E-mail já está em uso.',
  })
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário (Login)' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso. Retorna o Token JWT.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas (email ou senha incorretos).',
  })
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obter dados do perfil do usuário logado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado (Token inválido ou ausente).',
  })
  async me(@Request() req: AuthenticatedRequest) {
    return await this.authService.me(req.user.id);
  }
}
