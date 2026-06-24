import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { useAuthBypass } from '../context/AuthBypassContext';
import Emoji from '../components/Emoji';

const redirectMap: Record<string, string> = {
  '/account': '/(tabs)/account',
  '/cart': '/cart',
  '/checkout': '/checkout',
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || '/account';
  }
  return value || '/account';
}

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string | string[] }>();
  const { signInWithPassword, status, launchConfig } = useAuthBypass();
  const [email, setEmail] = useState('revyl.collector@bugbazaar.test');
  const [password, setPassword] = useState('bugbazaar');
  const [error, setError] = useState<string | null>(null);

  const redirect = redirectMap[firstValue(params.redirect)] || '/(tabs)/account';
  const launchState = !launchConfig.ready
    ? 'Loading'
    : launchConfig.source === 'launch-env'
      ? 'Ready'
      : 'Missing';

  const handleSubmit = () => {
    const result = signInWithPassword(email, password);
    if (!result.accepted) {
      setError('Use an email and an 8+ character password.');
      return;
    }
    setError(null);
    router.replace(redirect as Parameters<typeof router.replace>[0]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.kicker}>BUG BAZAAR</Text>
          <Text style={styles.title}>Sign in</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.avatar}>
            <Emoji emoji="🐛" size={36} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="collector@bugbazaar.test"
              placeholderTextColor={Colors.gray}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="bugbazaar"
              placeholderTextColor={Colors.gray}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryText}>SIGN IN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.revylPanel}>
          <View style={styles.revylHeader}>
            <Text style={styles.revylTitle}>Revyl E2E auth state</Text>
            <View
              style={[
                styles.revylBadge,
                launchState === 'Ready' && styles.revylBadgeReady,
                launchState === 'Missing' && styles.revylBadgeMissing,
              ]}
            >
              <Text style={styles.revylBadgeText}>{launchState}</Text>
            </View>
          </View>
          <Text style={styles.revylMessage}>{status.message}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Launch vars</Text>
            <Text style={styles.metaValue}>
              {launchConfig.source === 'launch-env' ? 'Attached' : 'Required'}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Bypass gate</Text>
            <Text style={styles.metaValue}>
              {launchConfig.enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paperWhite,
  },
  keyboard: {
    flex: 1,
    padding: Spacing.m,
    gap: Spacing.l,
  },
  header: {
    paddingTop: Spacing.s,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightGray,
    alignSelf: 'flex-end',
  },
  closeText: {
    color: Colors.inkBlack,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -2,
  },
  kicker: {
    color: Colors.gray,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: Spacing.s,
  },
  title: {
    color: Colors.inkBlack,
    fontFamily: Fonts.display,
    fontSize: 48,
    lineHeight: 56,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.cardBg,
    borderRadius: 8,
    padding: Spacing.m,
    gap: Spacing.m,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.stickerGreen,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  field: {
    gap: 6,
  },
  label: {
    color: Colors.priceGray,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.paperWhite,
    borderRadius: 8,
    color: Colors.inkBlack,
    fontFamily: Fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: 'red',
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: 'bold',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.inkBlack,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryText: {
    color: Colors.paperWhite,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: 'bold',
  },
  revylPanel: {
    borderColor: Colors.inkBlack,
    borderRadius: 8,
    borderWidth: 3,
    padding: Spacing.m,
    gap: Spacing.s,
  },
  revylHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.s,
  },
  revylTitle: {
    color: Colors.inkBlack,
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: 20,
  },
  revylBadge: {
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  revylBadgeReady: {
    backgroundColor: Colors.stickerGreen,
  },
  revylBadgeMissing: {
    backgroundColor: Colors.mangoYellow,
  },
  revylBadgeText: {
    color: Colors.inkBlack,
    fontFamily: Fonts.body,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  revylMessage: {
    color: Colors.priceGray,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: Colors.gray,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaValue: {
    color: Colors.inkBlack,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
