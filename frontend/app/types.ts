export {};

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '/(auth)/welcome': undefined;
      '/(auth)/location': undefined;
      '/(auth)/signin': undefined;
      '/(auth)/signup': undefined;
      '/(tabs)': undefined;
    }
  }
} 