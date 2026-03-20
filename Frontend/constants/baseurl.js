import { Platform } from 'react-native'

const envURL = process.env.EXPO_PUBLIC_API_URL;

const defaultURL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:4000/api/v1/'
        : 'http://192.168.1.109:4000/api/v1/';

const isLocalhostUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url);

const baseURL =
    envURL && !(Platform.OS === 'android' && isLocalhostUrl(envURL))
        ? `${envURL.replace(/\/$/, '')}/`
        : defaultURL;

export default baseURL;