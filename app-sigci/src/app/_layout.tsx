import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      
      {/* UN SOLO BLOQUE DE CAPAS PARA TODAS LAS PANTALLAS DE LA APP */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="ventas" /> 
        <Stack.Screen name="exito" />
        <Stack.Screen name="resumen" /> {/* 🟢 NUEVA PÁGINA REGISTRADA */}
      </Stack>


    </ThemeProvider>
  );
}
