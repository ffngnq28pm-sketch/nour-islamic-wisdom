import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Star, Check, RotateCcw } from 'lucide-react-native';
import { usePremium, PremiumPlan } from '@/hooks/usePremium';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FEATURES = [
  'Accès aux 365 sagesses de la bibliothèque',
  'Les 99 Noms d\'Allah — collection complète',
  'Penseurs islamiques — série encyclopédique',
  'Fonds d\'écran en haute résolution',
  'Contemplation hors-ligne · Aucune publicité',
];

export function PremiumPaywall({ visible, onClose }: Props) {
  const { purchasePlan, restorePurchases, isLoading } = usePremium();
  const [plan, setPlan] = useState<PremiumPlan>('yearly');
  const [restoreMsg, setRestoreMsg] = useState('');
  const shimmer = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideUp, { toValue: 0, duration: 340, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.timing(shimmer, { toValue: 1, duration: 2400, useNativeDriver: true })
      ).start();
    } else {
      slideUp.setValue(60);
      fadeIn.setValue(0);
    }
  }, [visible]);

  const shimmerX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.5, width * 1.5],
  });

  async function handlePurchase() {
    const result = await purchasePlan(plan);
    if (result.success) onClose();
  }

  async function handleRestore() {
    const ok = await restorePurchases();
    setRestoreMsg(ok ? 'Accès restauré ✓' : 'Aucun abonnement retrouvé');
    if (ok) onClose();
    setTimeout(() => setRestoreMsg(''), 3000);
  }

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeIn }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideUp }] }]}>
          {/* Header avec shimmer */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#0A1628', '#0D1B3E']}
              style={StyleSheet.absoluteFillObject}
            />
            <Animated.View
              style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#8A8FA8" />
            </TouchableOpacity>

            <View style={styles.badge}>
              <Star size={11} color="#C9A84C" fill="#C9A84C" />
              <Text style={styles.badgeText}>NOUR PREMIUM</Text>
            </View>

            <Text style={styles.headline}>Éveille ta lumière{'\n'}intérieure</Text>
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>✦ 7 jours gratuits · Résiliable à tout moment</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f} style={styles.featureRow}>
                <View style={styles.checkCircle}>
                  <Check size={10} color="#C9A84C" strokeWidth={3} />
                </View>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Sélecteur de plan */}
          <View style={styles.plans}>
            <TouchableOpacity
              style={[styles.plan, plan === 'yearly' && styles.planSelected]}
              onPress={() => setPlan('yearly')}
              activeOpacity={0.85}
            >
              {plan === 'yearly' && (
                <View style={styles.bestValue}>
                  <Text style={styles.bestValueText}>ÉCONOMISEZ 58%</Text>
                </View>
              )}
              <View style={styles.planContent}>
                <View>
                  <Text style={[styles.planTitle, plan === 'yearly' && styles.planTitleOn]}>
                    Annuel
                  </Text>
                  <Text style={styles.planSub}>1,25€ / mois</Text>
                </View>
                <Text style={[styles.planPrice, plan === 'yearly' && styles.planPriceOn]}>
                  14,99€
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.plan, plan === 'monthly' && styles.planSelected]}
              onPress={() => setPlan('monthly')}
              activeOpacity={0.85}
            >
              <View style={styles.planContent}>
                <View>
                  <Text style={[styles.planTitle, plan === 'monthly' && styles.planTitleOn]}>
                    Mensuel
                  </Text>
                  <Text style={styles.planSub}>Résiliable à tout moment</Text>
                </View>
                <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceOn]}>
                  2,99€
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, isLoading && styles.ctaOff]}
            onPress={handlePurchase}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#C9A84C', '#B8922E']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#050A1E" />
              ) : (
                <Text style={styles.ctaText}>
                  {plan === 'yearly'
                    ? 'Commencer l\'essai gratuit — 7 jours'
                    : 'Rejoindre Nour Premium — 2,99€ / mois'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Restaurer */}
          <TouchableOpacity
            style={styles.restoreRow}
            onPress={handleRestore}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <RotateCcw size={11} color="#5A6070" />
            <Text style={styles.restoreText}>
              {restoreMsg || 'Restaurer mon accès'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Paiement sécurisé · Abonnement géré par Apple ou Google
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0D1B3E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    paddingBottom: 34,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 22,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(201,168,76,0.06)',
    transform: [{ skewX: '-20deg' }],
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(201,168,76,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 9,
    color: '#C9A84C',
    letterSpacing: 2,
  },
  headline: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 26,
    color: '#F5EDD6',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 10,
  },
  trialBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  trialText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: '#8A8FA8',
  },
  features: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 6,
    gap: 9,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(201,168,76,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    color: '#C8D0E0',
    flex: 1,
  },
  plans: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 14,
  },
  plan: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
    paddingTop: 5,
  },
  planSelected: {
    borderColor: '#C9A84C',
    backgroundColor: 'rgba(201,168,76,0.07)',
  },
  bestValue: {
    backgroundColor: '#C9A84C',
    paddingVertical: 2,
    alignItems: 'center',
    marginBottom: 2,
  },
  bestValueText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 8,
    color: '#050A1E',
    letterSpacing: 1.5,
  },
  planContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  planTitle: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: '#8A8FA8',
    marginBottom: 2,
  },
  planTitleOn: { color: '#F5EDD6' },
  planSub: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: '#5A6070',
  },
  planPrice: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 18,
    color: '#8A8FA8',
  },
  planPriceOn: { color: '#C9A84C' },
  cta: {
    marginHorizontal: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaOff: { opacity: 0.55 },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  ctaText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: '#050A1E',
    letterSpacing: 0.2,
  },
  restoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
  },
  restoreText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
    color: '#5A6070',
  },
  legal: {
    fontFamily: 'Lato_400Regular',
    fontSize: 10,
    color: '#3A4060',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
