import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
  const [rpcUrl, setRpcUrl] = useState('');

  const saveRpcUrl = async () => {
    try {
      await AsyncStorage.setItem('RPC_URL', rpcUrl);
      Alert.alert('Success', 'RPC URL updated!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save RPC URL');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Blockchain RPC URL:</Text>
      <TextInput
        style={styles.input}
        value={rpcUrl}
        onChangeText={setRpcUrl}
        placeholder="http://192.168.1.100:8545"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Save" onPress={saveRpcUrl} color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
  },
});
