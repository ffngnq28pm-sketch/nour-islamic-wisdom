import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Share2, Volume2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { SURAHS } from '@/data/surahs';
import { getSurahText, Verse } from '@/data/surah_texts';
import { getQuranAudioUrl, AudioService } from '@/services/AudioService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SurahReaderScreen() {
  const { number: numParam } = useLocalSearchParams<{ number: string }>();
  const { colors } = useTheme();
  const num = parseInt(numParam ?? '1', 10);
  const surahMeta = SURAHS.find((s) => s.number === num);
  const surahText = getSurahText(num);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);

  async function handlePlayAyah(ayah: number) {
    if (playingAyah === ayah) {
      await AudioService.stopQuran();
      setPlayingAyah(null);
      return;
    }
    setPlayingAyah(ayah);
    const url = getQuranAudioUrl(num, ayah);
    try {
      if (Platform.OS !== 'web') {
        await AudioService.playQuran(url, (playing) => {
          if (!playing) setPlayingAyah(null);
        });
      } else {
        const AudioCtor = typeof window !== 'undefined' && (window as any).Audio;
        if (!AudioCtor) return;
        const audio = new AudioCtor(url) as HTMLAudioElement;
        audio.onended = () => setPlayingAyah(null);
        audio.onerror = () => setPlayingAyah(null);
        audio.play();
      }
    } catch {
      setPlayingAyah(null);
    }
  }

  async function handleShare() {
    if (!surahMeta) return;
    const text = `Sourate ${surahMeta.french} (${surahMeta.transliteration})\n${surahMeta.arabic}\n${surahMeta.verses} versets — ${surahMeta.revelation}\n\nVia Nour — Sagesse Islamique`;
    await Share.share({ message: text }).catch(() => {});
  }

  const renderVerse = ({ item }: { item: Verse }) => {
    const isPlaying = playingAyah === item.ayah;
    return (
      <View style={[styles.verseRow, { borderBottomColor: colors.border }]}>
        {/* Ayah number */}
        <View style={[styles.ayahBadge, { backgroundColor: isPlaying ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.10)', borderColor: 'rgba(201,168,76,0.3)' }]}>
          <Text style={[styles.ayahNum, { color: colors.textAccent }]}>{item.ayah}</Text>
        </View>

        <View style={styles.verseContent}>
          {/* Arabic */}
          <Text style={[styles.verseArabic, { color: colors.textPrimary }]}>{item.arabic}</Text>
          {/* French */}
          <Text style={[styles.verseFrench, { color: colors.textSecondary }]}>{item.french}</Text>
        </View>

        {/* Play button */}
        <TouchableOpacity
          style={[styles.playBtn, isPlaying && { backgroundColor: 'rgba(201,168,76,0.2)' }]}
          onPress={() => handlePlayAyah(item.ayah)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Volume2 size={14} color={isPlaying ? colors.textAccent : colors.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.8}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {surahMeta && (
              <>
                <Text style={[styles.headerArabic, { color: colors.textPrimary }]}>{surahMeta.arabic}</Text>
                <Text style={[styles.headerFrench, { color: colors.textAccent }]}>{surahMeta.french} · {surahMeta.transliteration}</Text>
              </>
            )}
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.8}>
            <Share2 size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Surah hero banner */}
        {surahMeta && (
          <LinearGradient
            colors={['rgba(201,168,76,0.10)', 'transparent']}
            style={styles.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Text style={[styles.heroMeta, { color: colors.textMuted }]}>
              {surahMeta.verses} versets · {surahMeta.revelation === 'mecquoise' ? '🕋 Mecquoise' : '🕌 Médinoise'}
            </Text>
            <Text style={[styles.heroTheme, { color: colors.textSecondary }]}>{surahMeta.theme}</Text>
            <View style={styles.bismillahRow}>
              {num !== 1 && num !== 9 && (
                <Text style={[styles.bismillah, { color: colors.textAccent }]}>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </Text>
              )}
            </View>
          </LinearGradient>
        )}

        {/* Verses list OR unavailable notice */}
        {surahText ? (
          <FlatList
            data={surahText.verses}
            keyExtractor={(v) => String(v.ayah)}
            renderItem={renderVerse}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        ) : (
          <View style={styles.unavailable}>
            <Text style={styles.unavailableIcon}>📖</Text>
            <Text style={[styles.unavailableTitle, { color: colors.textPrimary }]}>Texte complet à venir</Text>
            <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
              Cette sourate sera disponible dans une prochaine mise à jour.{'\n'}
              Vous pouvez écouter sa récitation via le bouton ci-dessous.
            </Text>
            <TouchableOpacity
              style={[styles.listenBtn, { backgroundColor: colors.textAccent }]}
              onPress={() => handlePlayAyah(1)}
              activeOpacity={0.85}
            >
              <Volume2 size={16} color="#050A1E" />
              <Text style={styles.listenBtnText}>Écouter le premier verset</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerArabic: { fontFamily: 'Amiri_700Bold', fontSize: 22 },
  headerFrench: { fontFamily: 'Lato_400Regular', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  heroMeta: { fontFamily: 'Lato_400Regular', fontSize: 12, letterSpacing: 1 },
  heroTheme: { fontFamily: 'Lato_400Regular', fontSize: 12, fontStyle: 'italic' },
  bismillahRow: { marginTop: 8 },
  bismillah: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 36,
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  ayahBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  ayahNum: { fontFamily: 'Lato_700Bold', fontSize: 11 },
  verseContent: { flex: 1 },
  verseArabic: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 6,
  },
  verseFrench: {
    fontFamily: 'Lato_400Regular',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    flexShrink: 0,
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  unavailableIcon: { fontSize: 48 },
  unavailableTitle: { fontFamily: 'Lato_700Bold', fontSize: 18, textAlign: 'center' },
  unavailableText: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  listenBtnText: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: '#050A1E',
  },
});
