import { InjectionToken } from '@angular/core';

export type AccessLevelType = 'public' | 'protected' | 'private';

export interface NgxAmplifyStorageConfig {
    bucketName: string;
    bucketRegion: string;
    endpoint?: string;
    folderLevel: AccessLevelType,
    defaultLevel: AccessLevelType
}

export interface NgxAmplifyConfig {
    region: string;
    userPoolId: string;
    appId: string;
    idpUrl?: string;
    identityPoolId?: string;
    storage?: NgxAmplifyStorageConfig;
}

export interface NgxAmplifyToken {
    config: NgxAmplifyConfig;
}

export const NGX_AMPLIFY_CONFIG = new InjectionToken<NgxAmplifyToken>('NgxAmplifyConfig');