import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductScreen from './src/screens/ProductScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import theme
import { COLORS } from './src/styles/theme';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primaryDark,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
            },
            cardStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'VeriOrganic',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{
              title: 'Scan QR Code',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="Product"
            component={ProductScreen}
            options={{
              title: 'Product Verification',
              headerShown: true,
            }}
          />
           <Stack.Screen
             name="Settings"
             component={SettingsScreen}
             options={{
               title: 'Settings',
               headerShown: true,
             }}
           />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
