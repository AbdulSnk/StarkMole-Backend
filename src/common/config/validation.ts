import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
  LEADERBOARD_RECALCULATION_STRATEGY: Joi.string().default('batch'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  STARKNET_PRIVATE_KEY: Joi.string().required(),
  STARKNET_ACCOUNT_ADDRESS: Joi.string().required(),
  MINT_CONTRACT_ADDRESS: Joi.string().required(),
  // Add more validations as needed
});
