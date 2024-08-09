import { SetMetadata } from '@nestjs/common';

export const IS_REFRESH_KEY = 'isRef';
export const Refresh = () => SetMetadata(IS_REFRESH_KEY, true);
