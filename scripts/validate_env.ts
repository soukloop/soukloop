
import { assertRequiredEnv } from './lib/env';

console.log('Running environment validation...');
try {
    assertRequiredEnv();
    console.log('Validation complete.');
} catch (error) {
    console.error('Validation failed:', error);
}
