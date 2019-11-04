import { InjectionToken } from '@angular/core';

export interface NgxAmplifyConfig {
    region: string;
    userPoolId: string;
    appId: string;
    idpUrl?: string;
    identityPoolId?: string;
}

export interface NgxAmplifyToken {
    config: NgxAmplifyConfig;
}

export const NGX_AMPLIFY_CONFIG = new InjectionToken<NgxAmplifyToken>('NgxAmplifyConfig');