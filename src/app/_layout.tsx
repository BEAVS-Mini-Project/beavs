import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
import Toast from 'react-native-toast-message';
import { useColorScheme as rnColorScheme, View } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { toastConfig } from '@/components/Toastconfig';
import Index from './index'

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '/index',
};


export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded){
    return <Index />
  }
  
  return <RootLayoutNav />;
}


function RootLayoutNav() {
  const systemColorScheme = rnColorScheme(); // returns 'light' or 'dark'
  const paperTheme = systemColorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* <Stack.Screen name="index" /> */}
          <Stack.Screen name="login" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="invigilator" />
        </Stack>
        <Toast config={toastConfig} visibilityTime={3000} position="top" />
      </View>
    </PaperProvider>
  );
}

