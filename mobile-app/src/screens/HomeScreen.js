import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, GLASS_STYLES } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.logo}>🌿</Text>
            <Text style={styles.title}>VeriOrganic</Text>
            <Text style={styles.subtitle}>
              Blockchain-Powered Supply Chain Verification
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, GLASS_STYLES.card]}>
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Products Verified</Text>
            </View>
            <View style={[styles.statCard, GLASS_STYLES.card]}>
              <Text style={styles.statNumber}>99.9%</Text>
              <Text style={styles.statLabel}>Authenticity Rate</Text>
            </View>
          </View>

          {/* Main CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Scanner')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primaryMid, COLORS.primaryLight]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaIcon}>📷</Text>
              <Text style={styles.ctaText}>Scan QR Code</Text>
              <Text style={styles.ctaSubtext}>Verify any organic product</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why VeriOrganic?</Text>
            
            <View style={[styles.featureCard, GLASS_STYLES.card]}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureTitle}>Immutable Records</Text>
              <Text style={styles.featureDescription}>
                Blockchain ensures product history cannot be tampered with
              </Text>
            </View>

            <View style={[styles.featureCard, GLASS_STYLES.card]}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Instant Verification</Text>
              <Text style={styles.featureDescription}>
                Get authenticity results in under 3 seconds
              </Text>
            </View>

            <View style={[styles.featureCard, GLASS_STYLES.card]}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureTitle}>AI Fraud Detection</Text>
              <Text style={styles.featureDescription}>
                AI analyzes sensor data to detect anomalies automatically
              </Text>
            </View>

            <View style={[styles.featureCard, GLASS_STYLES.card]}>
              <Text style={styles.featureIcon}>🌱</Text>
              <Text style={styles.featureTitle}>Carbon Tracking</Text>
              <Text style={styles.featureDescription}>
                See the environmental impact of every product
              </Text>
            </View>
          </View>

          {/* Demo Product */}
          <View style={styles.demoSection}>
            <Text style={styles.sectionTitle}>Try Demo Product</Text>
            <TouchableOpacity
              style={[styles.demoCard, GLASS_STYLES.card]}
              onPress={() => navigation.navigate('Product', { productId: 1 })}
              activeOpacity={0.7}
            >
              <Text style={styles.demoEmoji}>🥑</Text>
              <Text style={styles.demoTitle}>Organic Avocados</Text>
              <Text style={styles.demoSubtitle}>Product ID: 1</Text>
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>Score: 100/100</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Ethereum Blockchain
            </Text>
            <Text style={styles.footerSubtext}>
              Version 1.0.0 • MIT License
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: (width - SPACING.lg * 3) / 2,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primaryLightest,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // CTA Button
  ctaButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  ctaIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  ctaText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  ctaSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  featureCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  featureTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  featureDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 2,
  },
  
  // Demo Section
  demoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  demoCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  demoEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  demoTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  demoSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  demoBadge: {
    backgroundColor: COLORS.scoreExcellent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  demoBadgeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});
