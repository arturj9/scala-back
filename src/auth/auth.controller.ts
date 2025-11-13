import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { SignInDto, SignUpDto } from './dtos/auth';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() request) {
    return request.user;
  }
}
