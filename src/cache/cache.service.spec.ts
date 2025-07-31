import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { Logger } from '@nestjs/common';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    service.resetStats();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return cached value and increment hits', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      mockCacheManager.get.mockResolvedValue(value);

      const result = await service.get(key);

      expect(result).toEqual(value);
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(service.getStats().hits).toBe(1);
      expect(service.getStats().misses).toBe(0);
    });

    it('should return undefined and increment misses when cache miss', async () => {
      const key = 'nonexistent-key';
      mockCacheManager.get.mockResolvedValue(undefined);

      const result = await service.get(key);

      expect(result).toBeUndefined();
      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(service.getStats().hits).toBe(0);
      expect(service.getStats().misses).toBe(1);
    });

    it('should handle null values as cache miss', async () => {
      const key = 'null-key';
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.get(key);

      expect(result).toBeNull();
      expect(service.getStats().hits).toBe(0);
      expect(service.getStats().misses).toBe(1);
    });
  });

  describe('set', () => {
    it('should set value with TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };
      const ttl = 300;

      await service.set(key, value, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, { ttl });
    });

    it('should set value without TTL', async () => {
      const key = 'test-key';
      const value = { data: 'test-data' };

      await service.set(key, value);

      expect(mockCacheManager.set).toHaveBeenCalledWith(key, value, { ttl: undefined });
    });
  });

  describe('del', () => {
    it('should delete cache entry', async () => {
      const key = 'test-key';

      await service.del(key);

      expect(mockCacheManager.del).toHaveBeenCalledWith(key);
    });
  });

  describe('reset', () => {
    it('should reset all cache entries', async () => {
      await service.reset();

      expect(mockCacheManager.reset).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Simulate some cache hits and misses
      mockCacheManager.get
        .mockResolvedValueOnce('hit1')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce('hit2')
        .mockResolvedValueOnce(undefined);

      await service.get('key1'); // hit
      await service.get('key2'); // miss
      await service.get('key3'); // hit
      await service.get('key4'); // miss

      const stats = service.getStats();

      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.totalRequests).toBe(4);
    });

    it('should return zero hit rate when no requests', () => {
      const stats = service.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset statistics', async () => {
      // Generate some stats
      mockCacheManager.get.mockResolvedValue('hit');
      await service.get('key1');

      expect(service.getStats().hits).toBe(1);

      service.resetStats();

      const stats = service.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalRequests).toBe(0);
    });
  });
});
