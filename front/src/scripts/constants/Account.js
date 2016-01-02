var BASE_URL = 'http://localhost:3001/';

export default {
    BASE_URL: BASE_URL,
    LOGIN_URL: BASE_URL + 'sessions/create',
    LOGIN_SOCIAL_URL: BASE_URL + 'sessions/create',
    LOGOUT_URL: BASE_URL + 'sessions/remove',
    SIGNUP_URL: BASE_URL + 'users',
    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_PROCESS: 'LOGIN_PROCESS',
    LOGOUT_REQUEST: 'LOGOUT_REQUEST',
    LOGOUT_PROCESS: 'LOGOUT_PROCESS'
}
