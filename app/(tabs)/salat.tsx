import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshCw, MapPin, Settings2, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { PRAYER_METHODS } from '@/services/PrayerTimesService';

const PRAYER_INFO: Record<string, { arabic: string; icon: string; color: string }> = {
  Fajr:    { arabic: 'الفجر',   icon: '🌅', color: '#7A9AAA' },
  Sunrise: { arabic: 'الشروق',  icon: '☀️', color: '#C9A84C' },
  Dhuhr:   { arabic: 'الظهر',   icon: '🌞', color: '#D4A030' },
  Asr:     { arabic: 'العصر',   icon: '🌤',  color: '#8A8A5A' },
  Maghrib: { arabic: 'المغرب',  icon: '🌆', color: '#C05A3A' },
  Isha:    { arabic: 'العشاء',  icon: '🌙', color: '#4A5A8A' },
};

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function formatCountdown(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ` ${m}min` : ''}`;
  }
  return `${minutes} min`;
}

export default function SalatScreen() {
  const { colors } = useTheme();
  const { data, loading, error, reload, method, setMethod, nextPrayer, currentPrayer } = usePrayerTimes();
  const [methodModal, setMethodModal] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(201,168,76,0.08)', 'transparent']}
        style={styles.topGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>الصلاة</Text>
          <Text style={[styles.headerSub, { color: colors.textAccent }]}>Heures de Prière</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setMethodModal(true)} style={styles.iconBtn}>
            <Settings2 size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={reload} style={styles.iconBtn} disabled={loading}>
            <RefreshCw size={20} color={loading ? colors.textMuted : colors.textAccent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.textAccent} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Localisation en cours…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorIcon}>📍</Text>
            <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
              Localisation requise
            </Text>
            <Text style={[styles.errorText, { color: colors.textMuted }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.textAccent }]}
              onPress={reload}
            >
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : data ? (
          <>
            {/* Location chip */}
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textAccent} />
              <Text style={[styles.locationText, { color: colors.textAccent }]}>
                {data.city}{data.country ? `, ${data.country}` : ''} · {data.date}
              </Text>
            </View>

            {/* Next prayer card */}
            {nextPrayer && (
              <LinearGradient
                colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.06)']}
                style={styles.nextCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.nextLabel}>PROCHAINE PRIÈRE</Text>
                <Text style={styles.nextArabic}>{nextPrayer.arabicName}</Text>
                <Text style={[styles.nextName, { color: colors.textPrimary }]}>
                  {PRAYER_INFO[nextPrayer.name]?.icon} {nextPrayer.name}
                </Text>
                <Text style={[styles.nextTime, { color: colors.textAccent }]}>
                  {nextPrayer.time}
                </Text>
                <View style={[styles.countdown, { backgroundColor: 'rgba(201,168,76,0.15)' }]}>
                  <Text style={styles.countdownText}>
                    Dans {formatCountdown(nextPrayer.minutesLeft)}
                  </Text>
                </View>
              </LinearGradient>
            )}

            {/* Prayer times list */}
            <View style={[styles.timesCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              {PRAYER_ORDER.map((name) => {
                const time = data.times[name as keyof typeof data.times];
                const info = PRAYER_INFO[name];
                const isActive = currentPrayer === name;
                const isNext = nextPrayer?.name === name;
                return (
                  <View
                    key={name}
                    style={[
                      styles.prayerRow,
                      isActive && { backgroundColor: 'rgba(201,168,76,0.08)' },
                      { borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={styles.prayerLeft}>
                      <Text style={styles.prayerIcon}>{info.icon}</Text>
                      <View>
                        <Text style={[styles.prayerName, { color: isActive ? colors.textAccent : colors.textPrimary }]}>
                          {name}
                        </Text>
                        <Text style={[styles.prayerArabic, { color: colors.textMuted }]}>
                          {info.arabic}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.prayerRight}>
                      {isNext && (
                        <View style={styles.nextBadge}>
                          <Text style={styles.nextBadgeText}>suivante</Text>
                        </View>
                      )}
                      <Text style={[styles.prayerTime, { color: isActive ? colors.textAccent : colors.textPrimary }]}>
                        {time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Method */}
            <TouchableOpacity
              onPress={() => setMethodModal(true)}
              style={[styles.methodChip, { borderColor: colors.border }]}
            >
              <Text style={[styles.methodText, { color: colors.textMuted }]}>
                Méthode : {PRAYER_METHODS[method] || `#${method}`}
              </Text>
            </TouchableOpacity>

            {/* Islamic reminder */}
            <View style={[styles.hadith, { backgroundColor: colors.bgCard, borderLeftColor: colors.textAccent }]}>
              <Text style={[styles.hadithText, { color: colors.textSecondary }]}>
                « La prière est le pilier de la religion. »
              </Text>
              <Text style={[styles.hadithSource, { color: colors.textMuted }]}>Hadith — At-Tirmidhi</Text>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Method modal */}
      <Modal visible={methodModal} transparent animationType="slide" onRequestClose={() => setMethodModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgCard }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Méthode de calcul</Text>
              <TouchableOpacity onPress={() => setMethodModal(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {Object.entries(PRAYER_METHODS).map(([id, label]) => (
              <TouchableOpacity
                key={id}
                style={[styles.methodRow, { borderBottomColor: colors.border }]}
                onPress={() => { setMethod(Number(id)); setMethodModal(false); }}
              >
                <Text style={[styles.methodRowText, { color: method === Number(id) ? colors.textAccent : colors.textPrimary }]}>
                  {label}
                </Text>
                {method === Number(id) && <Text style={{ color: colors.textAccent }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontFamily: 'Amiri_700Bold', fontSize: 28 },
  headerSub: { fontFamily: 'Lato_400Regular', fontSize: 13, letterSpacing: 1.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 8 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  center: { paddingTop: 80, alignItems: 'center', gap: 12 },
  loadingText: { fontFamily: 'Lato_400Regular', fontSize: 14, marginTop: 8 },
  errorIcon: { fontSize: 48 },
  errorTitle: { fontFamily: 'Amiri_700Bold', fontSize: 22 },
  errorText: { fontFamily: 'Lato_400Regular', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryText: { fontFamily: 'Lato_700Bold', fontSize: 14, color: '#050A1E' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    marginTop: 4,
  },
  locationText: { fontFamily: 'Lato_400Regular', fontSize: 13 },
  nextCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  nextLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(201,168,76,0.7)',
    marginBottom: 8,
  },
  nextArabic: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 32,
    color: '#C9A84C',
    marginBottom: 4,
  },
  nextName: { fontFamily: 'Lato_700Bold', fontSize: 18, marginBottom: 8 },
  nextTime: { fontFamily: 'Amiri_700Bold', fontSize: 40, marginBottom: 12 },
  countdown: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  countdownText: { fontFamily: 'Lato_700Bold', fontSize: 14, color: '#C9A84C' },
  timesCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prayerIcon: { fontSize: 22, width: 32 },
  prayerName: { fontFamily: 'Lato_700Bold', fontSize: 15 },
  prayerArabic: { fontFamily: 'Amiri_400Regular', fontSize: 14, marginTop: 2 },
  prayerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextBadge: {
    backgroundColor: 'rgba(201,168,76,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nextBadgeText: { fontFamily: 'Lato_400Regular', fontSize: 10, color: '#C9A84C' },
  prayerTime: { fontFamily: 'Lato_700Bold', fontSize: 16 },
  methodChip: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  methodText: { fontFamily: 'Lato_400Regular', fontSize: 12 },
  hadith: {
    borderLeftWidth: 3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  hadithText: { fontFamily: 'Lato_400Regular', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  hadithSource: { fontFamily: 'Lato_400Regular', fontSize: 11, marginTop: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: 'Amiri_700Bold', fontSize: 20 },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  methodRowText: { fontFamily: 'Lato_400Regular', fontSize: 15 },
});
