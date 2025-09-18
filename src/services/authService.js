import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

export const authService = {
  async saveAuthData(token, userData) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async getUserData() {
    try {
      const userData = await SecureStore.getItemAsync(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async clearAuthData() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }
};