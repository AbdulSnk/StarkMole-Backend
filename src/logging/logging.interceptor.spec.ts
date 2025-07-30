/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ClsService } from 'nestjs-cls';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: any;
  let mockClsService: any;

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    mockClsService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log HTTP requests', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/test',
      body: { test: 'data' },
      user: { id: 'user123' },
    };

    const mockResponse = {
      statusCode: 200,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('test response'),
    } as CallHandler;

    mockClsService.get.mockReturnValue('session123');

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
        method: 'GET',
        url: '/test',
        statusCode: 200,
        duration: expect.stringMatching(/\d+ms/),
        userId: 'user123',
        session: 'session123',
        body: { test: 'data' },
      });
      done();
    });
  });

  it('should handle anonymous users', (done) => {
    const mockRequest = {
      method: 'POST',
      url: '/api/test',
      body: {},
      user: null,
    };

    const mockResponse = {
      statusCode: 201,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('test response'),
    } as CallHandler;

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
        method: 'POST',
        url: '/api/test',
        statusCode: 201,
        duration: expect.stringMatching(/\d+ms/),
        userId: 'anonymous',
        session: undefined,
        body: {},
      });
      done();
    });
  });
});
