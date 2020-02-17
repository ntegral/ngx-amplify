/*
 * Public API Surface of ngx-amplify
 */
export * from './lib/ngx-amplify.module';

export * from './lib/common/interfaces/ngx-amplify.config';
export * from './lib/common/interfaces/common.interface';
export * from './lib/common/common.resource';
export { AuthService } from './lib/services/auth.service';
export { StorageService } from './lib/services/storage.service';
export { TokenInterceptor } from './lib/services/token-interceptor.service';
