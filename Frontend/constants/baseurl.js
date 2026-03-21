import { Platform } from 'react-native'

const envURL = process.env.EXPO_PUBLIC_API_URL;

const webProtocol = typeof window !== 'undefined' ? window?.location?.protocol : null;
const webHostname = typeof window !== 'undefined' ? window?.location?.hostname : null;

const webDefaultURL =
    webProtocol && webHostname
        ? `${webProtocol}//${webHostname}:4000/api/v1/`
        : 'http://localhost:4000/api/v1/';

const defaultURL =
    Platform.OS === 'android'
        ? 'http://10.0.2.2:4000/api/v1/'
        : Platform.OS === 'web'
            ? webDefaultURL
            : 'http://192.168.1.103:4000/api/v1/';

const isLocalhostUrl = (url) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url);

const baseURL =
    envURL && !(Platform.OS === 'android' && isLocalhostUrl(envURL))
        ? `${envURL.replace(/\/$/, '')}/`
        : defaultURL;

export default baseURL;