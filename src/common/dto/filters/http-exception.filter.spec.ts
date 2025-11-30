import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './http-exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { HttpStatus, HttpException, ArgumentsHost } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';

const mockHttpAdapter = {
  getRequestUrl: jest.fn().mockReturnValue('/test-url'),
  reply: jest.fn(),
};

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: HttpAdapterHost,
          useValue: { httpAdapter: mockHttpAdapter },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('deve ser definido', () => {
    expect(filter).toBeDefined();
  });

  it('deve formatar erros HTTP padrão (HttpException)', () => {
    const exception = new HttpException(
      'Erro Proposital',
      HttpStatus.BAD_REQUEST,
    );

    const mockHost = {
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
    } as ArgumentsHost;

    filter.catch(exception, mockHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Erro Proposital',
        path: '/test-url',
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('deve formatar erros do Zod (ZodValidationException)', () => {
    const zodError = new ZodValidationException({
      issues: [{ path: ['email'], message: 'Email inválido', code: 'custom' }],
    } as any);

    const mockHost = {
      switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
    } as ArgumentsHost;

    filter.catch(zodError, mockHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Email inválido',
          }),
        ]),
      }),
      HttpStatus.BAD_REQUEST,
    );
  });

  it('deve capturar erros genéricos como Internal Server Error', () => {
    const exception = new Error('Erro desconhecido no banco');
    const mockHost = {
      switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
    } as ArgumentsHost;

    filter.catch(exception, mockHost);

    expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro desconhecido no banco',
      }),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  });
});
