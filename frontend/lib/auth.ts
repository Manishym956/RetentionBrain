const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/';

export function getApiBaseUrl() {
    return API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
}

export function getGoogleAuthStartUrl(nextPath = '/dashboard') {
    const url = new URL('auth/google/start/', getApiBaseUrl());
    url.searchParams.set('next', nextPath);
    return url.toString();
}
